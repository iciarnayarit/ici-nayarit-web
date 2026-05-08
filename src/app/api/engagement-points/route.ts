import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { Document } from 'mongodb';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import { findMemberDocumentByEmail, normalizeMemberEmail } from '@/lib/members-email-lookup';
import type { EngagementPointsAction } from '@/lib/engagement-points';

const actionSchema = z.enum([
  'bible_read',
  'bible_share',
  'bible_highlight',
  'bible_note_create',
  'bible_image_generate',
  'bible_image_create',
] as const satisfies readonly EngagementPointsAction[]);

const payloadSchema = z.object({
  action: actionSchema,
  points: z.number().int().min(1).max(500),
  dedupeKey: z.string().trim().min(1).max(200).optional(),
});

function membersCollectionName() {
  return process.env.STORAGE_MONGODB_MEMBERS_COLLECTION?.trim() || 'members';
}

function badgesCollectionName() {
  return process.env.STORAGE_MONGODB_BADGES_COLLECTION?.trim() || 'badges';
}

function asNumberRecord(input: unknown): Record<string, number> {
  if (!input || typeof input !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(input)) {
    const n = Number(v);
    if (!Number.isFinite(n)) continue;
    out[k] = n;
  }
  return out;
}

type EngagementSnapshot = {
  totalPoints: number;
  counters: Record<string, number>;
  pointsByAction: Record<string, number>;
  dailyActivity: Record<string, number>;
};

function buildSnapshotFromMemberDoc(doc: Document): EngagementSnapshot {
  return {
    totalPoints: Number(doc.engagementPoints ?? 0),
    counters: asNumberRecord(doc.engagementCounters),
    pointsByAction: asNumberRecord(doc.engagementPointsByAction),
    dailyActivity: asNumberRecord(doc.engagementDailyActivity),
  };
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

function computeStreakDays(dailyActivity: Record<string, number>): number {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < 366; i += 1) {
    const day = isoDay(addDays(now, -i));
    if ((dailyActivity[day] ?? 0) > 0) {
      count += 1;
      continue;
    }
    break;
  }
  return count;
}

function computeBadgesFromSnapshot(snapshot: EngagementSnapshot) {
  const readCount = snapshot.counters.bible_read ?? 0;
  const shareCount = snapshot.counters.bible_share ?? 0;
  const highlightCount = snapshot.counters.bible_highlight ?? 0;
  const noteCount = snapshot.counters.bible_note_create ?? 0;
  const imgCount = (snapshot.counters.bible_image_generate ?? 0) + (snapshot.counters.bible_image_create ?? 0);

  return [
    { id: 'buscador-fiel', title: 'Buscador Fiel', tier: 'ORO', unlocked: readCount >= 30, requirement: '30 lecturas' },
    { id: 'sabio-mes', title: 'Sabio del Mes', tier: 'PLATA', unlocked: noteCount >= 12, requirement: '12 notas' },
    { id: 'voz-comun', title: 'Voz Común', tier: 'BRONCE', unlocked: shareCount >= 8, requirement: '8 compartidos' },
    { id: 'escriba-novicio', title: 'Escriba Novicio', tier: 'INICIAL', unlocked: noteCount >= 1, requirement: '1 nota' },
    { id: 'centenario', title: 'Centenario ICIAR', tier: 'ÉPICO', unlocked: snapshot.totalPoints >= 100, requirement: '100 puntos' },
    { id: 'donante-generoso', title: 'Donante Generoso', tier: 'SERVICIO', unlocked: highlightCount >= 20, requirement: '20 resaltados' },
    { id: 'misionero-digital', title: 'Misionero Digital', tier: 'DIGITAL', unlocked: shareCount >= 20, requirement: '20 compartidos' },
    { id: 'maestro-ley', title: 'Maestro de Ley', tier: 'EXPERTO', unlocked: imgCount >= 12, requirement: '12 imágenes' },
  ];
}

function rankTitleFromUnlockedCount(unlockedCount: number): string {
  if (unlockedCount >= 8) return 'LEGADO ETERNO';
  if (unlockedCount >= 6) return 'SABIDURÍA';
  if (unlockedCount >= 4) return 'GUARDIÁN';
  if (unlockedCount >= 2) return 'BUSCADOR';
  return 'FIEL';
}

function memberDisplayName(memberDoc: Document, email: string): string {
  const firstName = String(memberDoc.firstName ?? '').trim();
  const lastName = String(memberDoc.lastName ?? '').trim();
  const full = `${firstName} ${lastName}`.trim();
  if (full) return full;
  const user = email.split('@')[0]?.trim();
  return user || 'Usuario';
}

async function syncBadgesCollection(input: {
  memberDoc: Document;
  email: string;
  clerkUserId: string;
  now: Date;
  snapshot: EngagementSnapshot;
}) {
  const { memberDoc, email, clerkUserId, now, snapshot } = input;
  const db = await getMongoDb();
  const badgesColl = db.collection(badgesCollectionName());
  const memberId = memberDoc._id;
  if (!memberId) return;

  const badges = computeBadgesFromSnapshot(snapshot);
  const streakDays = computeStreakDays(snapshot.dailyActivity);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const displayName = memberDisplayName(memberDoc, email);
  const rankTitle = rankTitleFromUnlockedCount(unlockedCount);

  await badgesColl.updateOne(
    { memberId },
    {
      $set: {
        memberId,
        email,
        clerkUserId,
        displayName,
        rankTitle,
        totalPoints: snapshot.totalPoints,
        counters: snapshot.counters,
        pointsByAction: snapshot.pointsByAction,
        dailyActivity: snapshot.dailyActivity,
        streakDays,
        badges,
        unlockedCount,
        totalBadges: badges.length,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, reason: 'unauthenticated' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const emailRaw =
      clerkUser?.primaryEmailAddress?.emailAddress?.trim() ??
      clerkUser?.emailAddresses?.[0]?.emailAddress?.trim() ??
      '';
    if (!emailRaw) {
      return NextResponse.json({ ok: true, found: false, reason: 'no_email' });
    }
    const email = normalizeMemberEmail(emailRaw);

    const db = await getMongoDb();
    const badgesColl = db.collection(badgesCollectionName());

    // Fuente principal para insignias: colección `badges`.
    const badgesDoc =
      (await badgesColl.findOne({ clerkUserId: userId })) ??
      (await badgesColl.findOne({ email })) ??
      (await badgesColl.findOne({ email: emailRaw.trim() }));

    if (badgesDoc) {
      return NextResponse.json({
        ok: true,
        found: true,
        source: 'badges',
        snapshot: {
          totalPoints: Number(badgesDoc.totalPoints ?? 0),
          counters: asNumberRecord(badgesDoc.counters),
          pointsByAction: asNumberRecord(badgesDoc.pointsByAction),
          dailyActivity: asNumberRecord(badgesDoc.dailyActivity),
        },
      });
    }

    // Fallback de compatibilidad: documento members.
    const membersColl = db.collection(membersCollectionName());
    const memberDoc = await findMemberDocumentByEmail(membersColl, emailRaw);
    if (!memberDoc) {
      return NextResponse.json({ ok: true, found: false, reason: 'member_not_found' });
    }

    return NextResponse.json({
      ok: true,
      found: true,
      source: 'members',
      snapshot: {
        ...buildSnapshotFromMemberDoc(memberDoc),
      },
    });
  } catch (error) {
    console.error('[api/engagement-points GET]', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron cargar los puntos.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, reason: 'unauthenticated' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
    }

    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 });
    }

    const clerkUser = await currentUser();
    const emailRaw =
      clerkUser?.primaryEmailAddress?.emailAddress?.trim() ??
      clerkUser?.emailAddresses?.[0]?.emailAddress?.trim() ??
      '';
    if (!emailRaw) {
      return NextResponse.json({ ok: true, synced: false, reason: 'no_email' });
    }

    const db = await getMongoDb();
    const coll = db.collection(membersCollectionName());
    const doc = await findMemberDocumentByEmail(coll, emailRaw);
    if (!doc || !('_id' in doc) || !doc._id) {
      return NextResponse.json({ ok: true, synced: false, reason: 'member_not_found' });
    }

    const { action, points, dedupeKey } = parsed.data;
    const now = new Date();
    const email = normalizeMemberEmail(emailRaw);

    if (dedupeKey) {
      const result = await coll.updateOne(
        {
          _id: doc._id,
          engagementAppliedKeys: { $ne: dedupeKey },
        },
        {
          $inc: {
            engagementPoints: points,
            [`engagementCounters.${action}`]: 1,
            [`engagementPointsByAction.${action}`]: points,
            [`engagementDailyActivity.${now.toISOString().slice(0, 10)}`]: 1,
          },
          $set: {
            email,
            engagementUpdatedAt: now,
            updatedAt: now,
          },
          $addToSet: {
            engagementAppliedKeys: dedupeKey,
          },
        }
      );
      const refreshed = await coll.findOne({ _id: doc._id });
      if (refreshed) {
        await syncBadgesCollection({
          memberDoc: refreshed,
          email,
          clerkUserId: userId,
          now,
          snapshot: buildSnapshotFromMemberDoc(refreshed),
        });
      }
      return NextResponse.json({
        ok: true,
        synced: true,
        applied: result.modifiedCount > 0,
      });
    }

    const result = await coll.updateOne(
      { _id: doc._id },
      {
        $inc: {
          engagementPoints: points,
          [`engagementCounters.${action}`]: 1,
          [`engagementPointsByAction.${action}`]: points,
          [`engagementDailyActivity.${now.toISOString().slice(0, 10)}`]: 1,
        },
        $set: {
          email,
          engagementUpdatedAt: now,
          updatedAt: now,
        },
      }
    );
    const refreshed = await coll.findOne({ _id: doc._id });
    if (refreshed) {
      await syncBadgesCollection({
        memberDoc: refreshed,
        email,
        clerkUserId: userId,
        now,
        snapshot: buildSnapshotFromMemberDoc(refreshed),
      });
    }

    return NextResponse.json({ ok: true, synced: true, applied: result.modifiedCount > 0 });
  } catch (error) {
    console.error('[api/engagement-points POST]', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron guardar los puntos.' }, { status: 500 });
  }
}
