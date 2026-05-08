import { NextRequest, NextResponse } from 'next/server';
import { getEncyclopediaEntry, listEncyclopediaEntries } from '@/lib/bible-encyclopedia-data';
import { fuzzySimilarity, normalizeSearchText } from '@/lib/fuzzy-search';

type RecommendationItem = {
  slug: string;
  label: string;
  score: number;
  reason: 'see-also' | 'kind' | 'title';
};

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 12;

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug')?.trim() ?? '';
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Falta slug.' }, { status: 400 });
    }

    const rawLimit = Number(req.nextUrl.searchParams.get('limit') ?? DEFAULT_LIMIT);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(MAX_LIMIT, Math.floor(rawLimit)))
      : DEFAULT_LIMIT;

    const entry = getEncyclopediaEntry(slug);
    if (!entry) {
      return NextResponse.json({ ok: false, error: 'Entrada no encontrada.' }, { status: 404 });
    }

    const allEntries = listEncyclopediaEntries();
    const seeAlsoSet = new Set((entry.seeAlso ?? []).map((x) => x.slug));
    const kindNorm = normalizeSearchText(entry.kind);
    const titleNorm = normalizeSearchText(entry.title);

    const recommendations: RecommendationItem[] = allEntries
      .filter((candidate) => candidate.slug !== entry.slug)
      .map((candidate) => {
        const candidateKindNorm = normalizeSearchText(candidate.kind);
        const candidateTitleNorm = normalizeSearchText(candidate.title);
        const inSeeAlso = seeAlsoSet.has(candidate.slug);
        const kindScore = fuzzySimilarity(kindNorm, candidateKindNorm);
        const titleScore = fuzzySimilarity(titleNorm, candidateTitleNorm);

        if (inSeeAlso) {
          return {
            slug: candidate.slug,
            label: candidate.title,
            score: Number((1.2 + kindScore * 0.1).toFixed(4)),
            reason: 'see-also' as const,
          };
        }
        if (kindScore >= 0.75) {
          return {
            slug: candidate.slug,
            label: candidate.title,
            score: Number((kindScore + titleScore * 0.15).toFixed(4)),
            reason: 'kind' as const,
          };
        }
        if (titleScore >= 0.72) {
          return {
            slug: candidate.slug,
            label: candidate.title,
            score: Number((titleScore * 0.9).toFixed(4)),
            reason: 'title' as const,
          };
        }
        return null;
      })
      .filter((x): x is RecommendationItem => Boolean(x))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      ok: true,
      slug,
      limit,
      total: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('[api/enciclopedia/recommendations GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudieron cargar las recomendaciones de enciclopedia.' },
      { status: 500 }
    );
  }
}

