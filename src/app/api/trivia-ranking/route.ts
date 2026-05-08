import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import { normalizeMemberEmail } from '@/lib/members-email-lookup';
import { stableMergeSort } from '@/lib/perf-algorithms';
import { triviaBasePointsByDifficulty, TRIVIA_TOPICS } from '@/lib/trivia-topics';

type RankingUser = {
  displayName: string;
  title: string;
  points: number;
};

type RankingSourceDoc = {
  clerkUserId?: unknown;
  email?: unknown;
  displayName?: unknown;
  rankTitle?: unknown;
  triviaPoints?: unknown;
  totalPoints?: unknown;
  dashboardSnapshot?: {
    totalPoints?: unknown;
  };
  avgResponseSeconds?: unknown;
  updatedAt?: unknown;
  _id?: unknown;
};

function badgesCollectionName() {
  return process.env.STORAGE_MONGODB_BADGES_COLLECTION?.trim() || 'badges';
}

function rankingCollectionName() {
  return process.env.STORAGE_MONGODB_RANKING_COLLECTION?.trim() || 'ranking';
}

function rankingCacheCollectionName() {
  return process.env.STORAGE_MONGODB_TRIVIA_RANKING_COLLECTION?.trim() || 'trivia_rankings_daily';
}

const postPayloadSchema = z.object({
  topicSlug: z.string().trim().min(1).max(120),
  score: z.number().int().min(0).max(10),
  totalQuestions: z.number().int().min(1).max(100),
  timing: z
    .object({
      answeredCount: z.number().int().min(0).max(100).optional(),
      totalResponseSeconds: z.number().min(0).max(10_000).optional(),
      avgResponseSeconds: z.number().min(0).max(300).optional(),
      fastestResponseSeconds: z.number().min(0).max(300).optional(),
    })
    .optional(),
  snapshot: z
    .object({
      levelTitle: z.string().trim().min(1).max(120).optional(),
      totalPoints: z.number().int().min(0).max(1_000_000).optional(),
      streakDays: z.number().int().min(0).max(1000).optional(),
    })
    .optional(),
});

function speedBonusFromAvgSeconds(avgSeconds: number): number {
  if (avgSeconds <= 5) return 80;
  if (avgSeconds <= 8) return 60;
  if (avgSeconds <= 12) return 40;
  if (avgSeconds <= 16) return 25;
  if (avgSeconds <= 20) return 10;
  return 0;
}

function dateKeyInTimezone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value ?? '1970';
  const month = parts.find(p => p.type === 'month')?.value ?? '01';
  const day = parts.find(p => p.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

function asNumber(input: unknown): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : 0;
}

function asTitle(input: unknown): string {
  const s = String(input ?? '').trim();
  return s || 'FIEL';
}

function asName(input: unknown, email: unknown): string {
  const fromName = String(input ?? '').trim();
  if (fromName) return fromName;
  const emailStr = String(email ?? '').trim();
  if (!emailStr) return 'Usuario';
  return emailStr.split('@')[0] || 'Usuario';
}

function totalPointsFromDoc(doc: RankingSourceDoc): number {
  const fromSnapshot = asNumber(doc.dashboardSnapshot?.totalPoints);
  const fromBadgesTotal = asNumber(doc.totalPoints);
  const fromTrivia = asNumber(doc.triviaPoints);
  return Math.max(fromSnapshot, fromBadgesTotal, fromTrivia);
}

function timestampFromUnknown(input: unknown): number {
  const t = new Date(input as string | number | Date).getTime();
  return Number.isFinite(t) ? t : 0;
}

async function loadOrBuildDailyRanking(forceRebuild = false) {
  const db = await getMongoDb();
  const rankingColl = db.collection(rankingCollectionName());
  const badgesColl = db.collection(badgesCollectionName());
  const cacheColl = db.collection(rankingCacheCollectionName());

  const tz = process.env.TRIVIA_RANKING_TIMEZONE?.trim() || 'America/Mazatlan';
  const todayKey = dateKeyInTimezone(new Date(), tz);

  const existing = await cacheColl.findOne({ _id: todayKey });
  if (existing && !forceRebuild) return existing;

  const rankingDocs = await rankingColl
    .find(
      {},
      {
        projection: {
          clerkUserId: 1,
          email: 1,
          displayName: 1,
          rankTitle: 1,
          triviaPoints: 1,
          dashboardSnapshot: 1,
          avgResponseSeconds: 1,
          updatedAt: 1,
        },
      }
    )
    .toArray();

  const docs =
    rankingDocs.length > 0
      ? rankingDocs
      : await badgesColl
          .find(
            {},
            {
              projection: {
                clerkUserId: 1,
                email: 1,
                displayName: 1,
                rankTitle: 1,
                totalPoints: 1,
              },
            }
          )
          .sort({ totalPoints: -1, updatedAt: 1, _id: 1 })
          .toArray();

  const sortedDocs = stableMergeSort(docs, (a, b) => {
    const pointsDiff = totalPointsFromDoc(b as RankingSourceDoc) - totalPointsFromDoc(a as RankingSourceDoc);
    if (pointsDiff !== 0) return pointsDiff;
    const avgA = asNumber((a as RankingSourceDoc).avgResponseSeconds);
    const avgB = asNumber((b as RankingSourceDoc).avgResponseSeconds);
    if (avgA !== avgB) return avgA - avgB;
    const timeA = timestampFromUnknown((a as RankingSourceDoc).updatedAt);
    const timeB = timestampFromUnknown((b as RankingSourceDoc).updatedAt);
    return timeA - timeB;
  });

  const allUsers = sortedDocs.map((doc, idx) => ({
    rank: idx + 1,
    clerkUserId: String(doc.clerkUserId ?? ''),
    email: String(doc.email ?? ''),
    displayName: asName(doc.displayName, doc.email),
    title: asTitle(doc.rankTitle),
    points: totalPointsFromDoc(doc as RankingSourceDoc),
  }));

  const topUsers = allUsers.slice(0, 20);
  const top20CutoffPoints = allUsers[19]?.points ?? 0;

  const payload = {
    _id: todayKey,
    dateKey: todayKey,
    timezone: tz,
    generatedAt: new Date(),
    totalUsers: allUsers.length,
    topUsers,
    top20CutoffPoints,
    allUsers,
  };

  await cacheColl.updateOne({ _id: todayKey }, { $set: payload }, { upsert: true });
  return payload;
}

function viewerPositionFromDailyRanking(input: {
  allUsers: Array<{
    rank: number;
    clerkUserId: string;
    email: string;
    displayName: string;
    title: string;
    points: number;
  }>;
  viewerClerkUserId: string;
  viewerEmail: string;
}) {
  const { allUsers, viewerClerkUserId, viewerEmail } = input;
  const byClerk = viewerClerkUserId
    ? allUsers.find(u => u.clerkUserId && u.clerkUserId === viewerClerkUserId)
    : null;
  if (byClerk) return byClerk;
  if (!viewerEmail) return null;
  return allUsers.find(u => u.email && normalizeMemberEmail(u.email) === normalizeMemberEmail(viewerEmail)) ?? null;
}

export async function GET() {
  try {
    const daily = await loadOrBuildDailyRanking();
    const db = await getMongoDb();
    const rankingColl = db.collection(rankingCollectionName());
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    const emailRaw =
      user?.primaryEmailAddress?.emailAddress?.trim() ??
      user?.emailAddresses?.[0]?.emailAddress?.trim() ??
      '';

    const viewerFromCache = viewerPositionFromDailyRanking({
      allUsers: daily.allUsers ?? [],
      viewerClerkUserId: userId ?? '',
      viewerEmail: emailRaw,
    });

    const liveViewerDoc = userId
      ? await rankingColl.findOne(
          { clerkUserId: userId },
          { projection: { triviaPoints: 1, dashboardSnapshot: 1, clerkUserId: 1, email: 1, displayName: 1, rankTitle: 1 } }
        )
      : null;

    const viewer = viewerFromCache
      ? {
          ...viewerFromCache,
          points: liveViewerDoc ? totalPointsFromDoc(liveViewerDoc as RankingSourceDoc) : viewerFromCache.points,
        }
      : liveViewerDoc
      ? {
          rank: null,
          clerkUserId: String(liveViewerDoc.clerkUserId ?? ''),
          email: String(liveViewerDoc.email ?? emailRaw),
          displayName: asName(liveViewerDoc.displayName, liveViewerDoc.email),
          title: asTitle(liveViewerDoc.rankTitle),
          points: totalPointsFromDoc(liveViewerDoc as RankingSourceDoc),
        }
      : null;

    const viewerPosition = viewer?.rank ?? null;
    const viewerPoints = viewer?.points ?? 0;
    const pointsToTop20 = Math.max(0, Number(daily.top20CutoffPoints ?? 0) - viewerPoints);

    return NextResponse.json({
      ok: true,
      dateKey: daily.dateKey,
      generatedAt: daily.generatedAt,
      topUsers: (daily.topUsers ?? []) as RankingUser[],
      viewer: viewer
        ? {
            rank: viewer.rank,
            points: viewer.points,
            pointsToTop20,
          }
        : null,
      top20CutoffPoints: Number(daily.top20CutoffPoints ?? 0),
    });
  } catch (error) {
    console.error('[api/trivia-ranking GET]', error);
    return NextResponse.json({ ok: false, error: 'No se pudo cargar el ranking.' }, { status: 500 });
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

    const parsed = postPayloadSchema.safeParse(body);
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

    const { topicSlug, score, totalQuestions, timing, snapshot } = parsed.data;
    const topic = TRIVIA_TOPICS.find(t => t.slug === topicSlug) ?? null;
    const difficultyLevel = topic?.level ?? 'Principiante';
    const basePoints = triviaBasePointsByDifficulty(difficultyLevel);
    const accuracy = Math.round((score / totalQuestions) * 100);
    const avgResponseSeconds = Number(timing?.avgResponseSeconds ?? 30);
    const speedBonus = speedBonusFromAvgSeconds(avgResponseSeconds);
    const pointsEarned = basePoints + score * 10 + speedBonus;
    const rankTitle = accuracy >= 90 ? 'LEGADO ETERNO' : accuracy >= 75 ? 'SABIDURÍA' : accuracy >= 55 ? 'BUSCADOR' : 'FIEL';

    const db = await getMongoDb();
    const rankingColl = db.collection(rankingCollectionName());
    const now = new Date();

    await rankingColl.updateOne(
      { clerkUserId: userId },
      {
        $set: {
          clerkUserId: userId,
          email,
          displayName,
          rankTitle,
          avgResponseSeconds,
          updatedAt: now,
          dashboardSnapshot: {
            levelTitle: snapshot?.levelTitle ?? null,
            totalPoints: snapshot?.totalPoints ?? null,
            streakDays: snapshot?.streakDays ?? null,
          },
          lastTest: {
            topicSlug,
            difficultyLevel,
            score,
            totalQuestions,
            accuracy,
            timing: {
              answeredCount: Number(timing?.answeredCount ?? 0),
              totalResponseSeconds: Number(timing?.totalResponseSeconds ?? 0),
              avgResponseSeconds,
              fastestResponseSeconds: Number(timing?.fastestResponseSeconds ?? 30),
            },
            speedBonus,
            basePoints,
            pointsEarned,
            takenAt: now,
          },
        },
        $inc: {
          totalTests: 1,
          totalCorrectAnswers: score,
          totalQuestionsAnswered: totalQuestions,
          triviaPoints: pointsEarned,
          [`testsByTopic.${topicSlug}.tests`]: 1,
          [`testsByTopic.${topicSlug}.correct`]: score,
          [`testsByTopic.${topicSlug}.questions`]: totalQuestions,
          [`testsByTopic.${topicSlug}.points`]: pointsEarned,
        },
        $max: {
          bestScore: score,
          bestAccuracy: accuracy,
        },
        $setOnInsert: {
          createdAt: now,
        },
        $push: {
          testHistory: {
            $each: [
              {
                topicSlug,
                difficultyLevel,
                score,
                totalQuestions,
                accuracy,
                timing: {
                  answeredCount: Number(timing?.answeredCount ?? 0),
                  totalResponseSeconds: Number(timing?.totalResponseSeconds ?? 0),
                  avgResponseSeconds,
                  fastestResponseSeconds: Number(timing?.fastestResponseSeconds ?? 30),
                },
                speedBonus,
                basePoints,
                pointsEarned,
                takenAt: now,
              },
            ],
            $slice: -100,
          },
        },
      },
      { upsert: true }
    );

    // Refresca el ranking diario inmediatamente después de cada test completado.
    await loadOrBuildDailyRanking(true);

    return NextResponse.json({ ok: true, synced: true });
  } catch (error) {
    console.error('[api/trivia-ranking POST]', error);
    return NextResponse.json({ ok: false, error: 'No se pudo sincronizar el test.' }, { status: 500 });
  }
}
