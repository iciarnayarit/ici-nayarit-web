import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { allAnnouncements, slugify as slugifyAnnouncement } from '@/app/lib/announcements';
import { resourceItems, slugify as slugifyResource } from '@/app/lib/resources-data';
import { getMongoDb } from '@/lib/mongodb';
import { findMemberDocumentByEmail, normalizeMemberEmail } from '@/lib/members-email-lookup';
import { getOrSetRamCache } from '@/lib/ram-cache';

type RecommendationType = 'avisos' | 'recursos' | 'all';

type PopularitySnapshot = {
  byDedupKey: Record<string, number>;
};

function membersCollectionName() {
  return process.env.STORAGE_MONGODB_MEMBERS_COLLECTION?.trim() || 'members';
}

function normalizeType(raw: string | null): RecommendationType {
  const t = (raw ?? 'all').toLowerCase().trim();
  if (t === 'avisos') return 'avisos';
  if (t === 'recursos') return 'recursos';
  return 'all';
}

function compactSlug(input: string): string {
  return input.replace(/-de-/g, '-').replace(/-del-/g, '-').replace(/-la-/g, '-');
}

function scoreAnnouncement(input: {
  slug: string;
  title: string;
  category: string;
  seen: Set<string>;
  popularity: Record<string, number>;
}) {
  const { slug, title, category, seen, popularity } = input;
  const key = `aviso-read:${slug}`;
  const base = popularity[key] ?? 0;
  const isSeen = seen.has(key);
  const categoryBoost =
    category.toLowerCase() === 'evento'
      ? 1.2
      : category.toLowerCase() === 'comunidad'
        ? 1.1
        : 1;
  const score = (base + 1) * categoryBoost * (isSeen ? 0.18 : 1);
  return {
    type: 'aviso' as const,
    slug,
    title,
    category,
    score: Number(score.toFixed(4)),
    reason: isSeen ? 'Relacionado con tus lecturas previas' : 'Popular en la comunidad',
  };
}

function scoreResource(input: {
  slug: string;
  title: string;
  category: string;
  badge?: string;
  link: string;
  seen: Set<string>;
  popularity: Record<string, number>;
}) {
  const { slug, title, category, badge, link, seen, popularity } = input;
  const readKey = `resource-read:${slug}`;
  const downloadSlugKey = `resource-download:${slug}`;
  const compactDownloadKey = `resource-download:${compactSlug(slug)}`;
  const base =
    (popularity[readKey] ?? 0) +
    (popularity[downloadSlugKey] ?? 0) +
    (popularity[compactDownloadKey] ?? 0);
  const isSeen = seen.has(readKey) || seen.has(downloadSlugKey) || seen.has(compactDownloadKey);
  const downloadBoost = badge?.toUpperCase() === 'PDF' ? 1.25 : 1;
  const score = (base + 1) * downloadBoost * (isSeen ? 0.2 : 1);
  return {
    type: 'recurso' as const,
    slug,
    title,
    category,
    badge: badge ?? null,
    link,
    score: Number(score.toFixed(4)),
    reason: isSeen ? 'Relacionado con tu historial de recursos' : 'Recurso recomendado por tendencia',
  };
}

async function getPopularitySnapshot(): Promise<PopularitySnapshot> {
  return getOrSetRamCache<PopularitySnapshot>('api:content-recommendations:popularity:v1', 90_000, async () => {
    const db = await getMongoDb();
    const coll = db.collection(membersCollectionName());
    const rows = await coll
      .aggregate<{ _id: string; hits: number }>([
        { $match: { engagementAppliedKeys: { $exists: true, $ne: [] } } },
        { $unwind: '$engagementAppliedKeys' },
        {
          $match: {
            engagementAppliedKeys: {
              $regex: '^(aviso-read:|resource-read:|resource-download:)',
            },
          },
        },
        {
          $group: {
            _id: '$engagementAppliedKeys',
            hits: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const byDedupKey: Record<string, number> = {};
    for (const row of rows) {
      if (!row?._id) continue;
      byDedupKey[row._id] = Number(row.hits ?? 0);
    }
    return { byDedupKey };
  });
}

async function getSeenSetForUser(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const clerkUser = await currentUser();
  const emailRaw =
    clerkUser?.primaryEmailAddress?.emailAddress?.trim() ??
    clerkUser?.emailAddresses?.[0]?.emailAddress?.trim() ??
    '';
  if (!emailRaw) return new Set();

  const db = await getMongoDb();
  const coll = db.collection(membersCollectionName());
  const member = await findMemberDocumentByEmail(coll, emailRaw);
  if (!member) return new Set();
  const keys = Array.isArray(member.engagementAppliedKeys)
    ? member.engagementAppliedKeys.filter((k): k is string => typeof k === 'string')
    : [];
  return new Set(keys);
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const type = normalizeType(url.searchParams.get('type'));
    const limit = Math.max(1, Math.min(12, Number(url.searchParams.get('limit') ?? 6)));

    const cacheKey = `api:content-recommendations:${type}:${userId ?? 'guest'}:${limit}`;
    const payload = await getOrSetRamCache(cacheKey, 45_000, async () => {
      const [popularity, seen] = await Promise.all([getPopularitySnapshot(), getSeenSetForUser(userId ?? null)]);

      const avisoCandidates = allAnnouncements
        .map((a) =>
          scoreAnnouncement({
            slug: slugifyAnnouncement(a.title),
            title: a.title,
            category: a.category,
            popularity: popularity.byDedupKey,
            seen,
          })
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      const recursoCandidates = resourceItems
        .map((r) =>
          scoreResource({
            slug: slugifyResource(r.title),
            title: r.title,
            category: r.category,
            badge: r.badge,
            link: r.link,
            popularity: popularity.byDedupKey,
            seen,
          })
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (type === 'avisos') {
        return {
          ok: true,
          strategy: userId ? 'hybrid-personalized-popularity' : 'popularity-fallback',
          recommendations: avisoCandidates,
        };
      }
      if (type === 'recursos') {
        return {
          ok: true,
          strategy: userId ? 'hybrid-personalized-popularity' : 'popularity-fallback',
          recommendations: recursoCandidates,
        };
      }
      return {
        ok: true,
        strategy: userId ? 'hybrid-personalized-popularity' : 'popularity-fallback',
        recommendations: [...avisoCandidates, ...recursoCandidates]
          .sort((a, b) => b.score - a.score)
          .slice(0, limit),
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[api/content-recommendations GET]', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron cargar las recomendaciones de contenido.' }, { status: 500 });
  }
}

