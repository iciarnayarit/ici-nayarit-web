import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cosineSimilarity, normalizePositive, topKByScore } from '@/lib/collaborative-filtering';
import { getMongoDb } from '@/lib/mongodb';
import { getOrSetRamCache } from '@/lib/ram-cache';
import { TRIVIA_TOPICS } from '@/lib/trivia-topics';

type RankingDoc = {
  clerkUserId?: unknown;
  completedTopics?: unknown;
  testsByTopic?: unknown;
  triviaPoints?: unknown;
};

type RecommendedTopic = {
  slug: string;
  title: string;
  level: string;
  description: string;
  score: number;
  reason: string;
};

function rankingCollectionName() {
  return process.env.STORAGE_MONGODB_RANKING_COLLECTION?.trim() || 'ranking';
}

function topicCatalog() {
  return new Map(TRIVIA_TOPICS.map(t => [t.slug, t]));
}

function buildUserVector(doc: RankingDoc): Record<string, number> {
  const vector: Record<string, number> = {};
  const completed =
    doc.completedTopics && typeof doc.completedTopics === 'object'
      ? (doc.completedTopics as Record<string, unknown>)
      : {};
  const testsByTopic =
    doc.testsByTopic && typeof doc.testsByTopic === 'object'
      ? (doc.testsByTopic as Record<string, { tests?: unknown; correct?: unknown }>)
      : {};

  for (const [slug, done] of Object.entries(completed)) {
    if (done) vector[slug] = Math.max(vector[slug] ?? 0, 2.2);
  }
  for (const [slug, stats] of Object.entries(testsByTopic)) {
    const tests = normalizePositive(stats?.tests, 0);
    const correct = normalizePositive(stats?.correct, 0);
    const implicit = Math.min(3.5, tests * 0.25 + correct * 0.1);
    if (implicit > 0) {
      vector[slug] = Math.max(vector[slug] ?? 0, implicit);
    }
  }

  return vector;
}

function buildPopularFallback(limit: number): RecommendedTopic[] {
  return TRIVIA_TOPICS.slice(0, limit).map(topic => ({
    slug: topic.slug,
    title: topic.title,
    level: topic.level,
    description: topic.description,
    score: 0.01,
    reason: 'Popular en la comunidad',
  }));
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(12, Number(url.searchParams.get('limit') ?? 6)));
    const cacheKey = `api:trivia-recommendations:${userId ?? 'guest'}:${limit}`;

    const payload = await getOrSetRamCache(cacheKey, 45_000, async () => {
      if (!userId) {
        return {
          ok: true,
          strategy: 'popular-fallback',
          recommendations: buildPopularFallback(limit),
        };
      }

      const db = await getMongoDb();
      const rankingColl = db.collection(rankingCollectionName());
      const docs = (await rankingColl
        .find(
          {},
          {
            projection: {
              clerkUserId: 1,
              completedTopics: 1,
              testsByTopic: 1,
              triviaPoints: 1,
            },
          }
        )
        .toArray()) as RankingDoc[];

      const me = docs.find(doc => String(doc.clerkUserId ?? '') === userId) ?? null;
      if (!me) {
        return {
          ok: true,
          strategy: 'popular-fallback',
          recommendations: buildPopularFallback(limit),
        };
      }

      const myVector = buildUserVector(me);
      const seenTopics = new Set(Object.keys(myVector));

      const neighbors = topKByScore(
        docs
          .filter(doc => String(doc.clerkUserId ?? '') !== userId)
          .map(doc => ({
            doc,
            score: cosineSimilarity(myVector, buildUserVector(doc)),
          }))
          .filter(x => x.score > 0.02),
        35
      );

      if (neighbors.length === 0) {
        return {
          ok: true,
          strategy: 'popular-fallback',
          recommendations: buildPopularFallback(limit),
        };
      }

      const candidateScores = new Map<string, number>();
      const candidateSupport = new Map<string, number>();

      for (const neighbor of neighbors) {
        const neighborVector = buildUserVector(neighbor.doc);
        for (const [slug, affinity] of Object.entries(neighborVector)) {
          if (seenTopics.has(slug)) continue;
          const partial = neighbor.score * affinity;
          candidateScores.set(slug, (candidateScores.get(slug) ?? 0) + partial);
          candidateSupport.set(slug, (candidateSupport.get(slug) ?? 0) + 1);
        }
      }

      const catalog = topicCatalog();
      const recommendations = [...candidateScores.entries()]
        .map(([slug, rawScore]) => {
          const topic = catalog.get(slug);
          if (!topic) return null;
          const support = candidateSupport.get(slug) ?? 1;
          const score = rawScore * (1 + Math.min(0.35, support * 0.03));
          return {
            slug,
            title: topic.title,
            level: topic.level,
            description: topic.description,
            score: Number(score.toFixed(4)),
            reason: `Coincide con usuarios de perfil similar (${support} afinidades)`,
          } satisfies RecommendedTopic;
        })
        .filter((x): x is RecommendedTopic => x !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (recommendations.length === 0) {
        return {
          ok: true,
          strategy: 'popular-fallback',
          recommendations: buildPopularFallback(limit),
        };
      }

      return {
        ok: true,
        strategy: 'collaborative-filtering',
        recommendations,
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[api/trivia-recommendations GET]', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron cargar las recomendaciones.' }, { status: 500 });
  }
}
