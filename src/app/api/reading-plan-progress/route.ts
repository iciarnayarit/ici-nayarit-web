import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import { normalizeMemberEmail } from '@/lib/members-email-lookup';

const payloadSchema = z.object({
  planSlug: z.string().trim().min(1).max(160),
  planTitle: z.string().trim().min(1).max(240),
  completedDays: z.array(z.number().int().min(1).max(10000)).max(10000),
  completedChaptersByDay: z.record(z.string(), z.array(z.string().max(120)).max(500)).optional(),
  totalDays: z.number().int().min(1).max(10000),
  percent: z.number().min(0).max(100),
  lastReadDay: z.number().int().min(1).max(10000).nullable().optional(),
});

function plansCollectionName() {
  return process.env.STORAGE_MONGODB_PLANS_COLLECTION?.trim() || 'plans';
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, reason: 'unauthenticated' }, { status: 401 });
    }

    const db = await getMongoDb();
    const coll = db.collection(plansCollectionName());
    const docs = await coll
      .find(
        { clerkUserId: userId },
        {
          projection: {
            planSlug: 1,
            planTitle: 1,
            completedDays: 1,
            totalDays: 1,
            percent: 1,
            status: 1,
            updatedAt: 1,
          },
        }
      )
      .toArray();

    return NextResponse.json({
      ok: true,
      plans: docs.map((doc) => ({
        slug: String(doc.planSlug ?? ''),
        title: String(doc.planTitle ?? ''),
        completedDays: Array.isArray(doc.completedDays) ? doc.completedDays.length : 0,
        totalDays: Number(doc.totalDays ?? 0),
        percent: Number(doc.percent ?? 0),
        completed: String(doc.status ?? '') === 'completed' || Number(doc.percent ?? 0) >= 100,
        updatedAt: doc.updatedAt ?? null,
      })),
    });
  } catch (error) {
    console.error('[api/reading-plan-progress GET]', error);
    return NextResponse.json({ ok: false, error: 'No se pudo obtener el progreso de planes.' }, { status: 500 });
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
    const email = normalizeMemberEmail(emailRaw);
    const firstName = clerkUser?.firstName?.trim() ?? '';
    const lastName = clerkUser?.lastName?.trim() ?? '';
    const displayName = `${firstName} ${lastName}`.trim() || (email ? email.split('@')[0] ?? 'Usuario' : 'Usuario');

    const { planSlug, planTitle, completedDays, completedChaptersByDay, totalDays, percent, lastReadDay } = parsed.data;
    const now = new Date();
    const status = percent >= 100 ? 'completed' : completedDays.length > 0 ? 'reading' : 'not_started';

    const db = await getMongoDb();
    const coll = db.collection(plansCollectionName());

    await coll.updateOne(
      { clerkUserId: userId, planSlug },
      {
        $set: {
          clerkUserId: userId,
          email,
          displayName,
          planSlug,
          planTitle,
          completedDays,
          completedChaptersByDay: completedChaptersByDay ?? {},
          totalDays,
          percent,
          status,
          lastReadDay: lastReadDay ?? null,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, synced: true });
  } catch (error) {
    console.error('[api/reading-plan-progress POST]', error);
    return NextResponse.json({ ok: false, error: 'No se pudo sincronizar el plan.' }, { status: 500 });
  }
}
