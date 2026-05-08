import { NextRequest, NextResponse } from 'next/server';
import { listEncyclopediaEntries } from '@/lib/bible-encyclopedia-data';
import { fuzzySimilarity, normalizeSearchText } from '@/lib/fuzzy-search';

type EncyclopediaSearchResult = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  score: number;
  reason: 'title' | 'kind' | 'summary' | 'section';
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 60;
const MIN_QUERY_LENGTH = 2;

function streamNdjsonLine(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  payload: unknown
) {
  controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
}

function scoreEntry(
  queryNorm: string,
  entry: ReturnType<typeof listEncyclopediaEntries>[number]
): EncyclopediaSearchResult | null {
  const titleNorm = normalizeSearchText(entry.title);
  const kindNorm = normalizeSearchText(entry.kind);
  const summaryNorm = normalizeSearchText(entry.summary);
  const sectionTexts = entry.sections.map((s) => normalizeSearchText(`${s.title} ${s.body}`));

  let reason: EncyclopediaSearchResult['reason'] = 'summary';
  let score = 0;

  if (titleNorm.includes(queryNorm)) {
    reason = 'title';
    score = 1;
  } else if (kindNorm.includes(queryNorm)) {
    reason = 'kind';
    score = 0.94;
  } else if (summaryNorm.includes(queryNorm)) {
    reason = 'summary';
    score = 0.9;
  } else {
    const titleFuzzy = fuzzySimilarity(titleNorm, queryNorm);
    const kindFuzzy = fuzzySimilarity(kindNorm, queryNorm);
    const summaryFuzzy = fuzzySimilarity(summaryNorm, queryNorm);
    const sectionFuzzy = sectionTexts.reduce((max, text) => Math.max(max, fuzzySimilarity(text, queryNorm)), 0);
    const best = Math.max(titleFuzzy, kindFuzzy, summaryFuzzy, sectionFuzzy);
    if (best < 0.72) return null;
    score = best;
    if (best === titleFuzzy) reason = 'title';
    else if (best === kindFuzzy) reason = 'kind';
    else if (best === sectionFuzzy) reason = 'section';
    else reason = 'summary';
  }

  return {
    slug: entry.slug,
    title: entry.title,
    kind: entry.kind,
    summary: entry.summary,
    score: Number(score.toFixed(4)),
    reason,
  };
}

function runSearch(query: string, limit: number): EncyclopediaSearchResult[] {
  const queryNorm = normalizeSearchText(query);
  if (queryNorm.length < MIN_QUERY_LENGTH) return [];

  return listEncyclopediaEntries()
    .map((entry) => scoreEntry(queryNorm, entry))
    .filter((x): x is EncyclopediaSearchResult => Boolean(x))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function streamSearchAsNdjson(query: string, limit: number) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      try {
        streamNdjsonLine(controller, encoder, {
          type: 'start',
          query,
          limit,
        });
        const results = runSearch(query, limit);
        for (let i = 0; i < results.length; i += 1) {
          streamNdjsonLine(controller, encoder, {
            type: 'result',
            index: i,
            item: results[i],
          });
        }
        streamNdjsonLine(controller, encoder, {
          type: 'done',
          total: results.length,
        });
      } catch (error) {
        streamNdjsonLine(controller, encoder, {
          type: 'error',
          message: error instanceof Error ? error.message : 'Error en búsqueda NDJSON.',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (q.length < MIN_QUERY_LENGTH) {
      return NextResponse.json(
        { ok: false, error: `El parámetro q requiere al menos ${MIN_QUERY_LENGTH} caracteres.` },
        { status: 400 }
      );
    }

    const rawLimit = Number(req.nextUrl.searchParams.get('limit') ?? DEFAULT_LIMIT);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(MAX_LIMIT, Math.floor(rawLimit)))
      : DEFAULT_LIMIT;

    const streamRequested =
      req.nextUrl.searchParams.get('stream') === '1' ||
      req.headers.get('accept')?.toLowerCase().includes('application/x-ndjson') === true;

    if (streamRequested) {
      return streamSearchAsNdjson(q, limit);
    }

    const results = runSearch(q, limit);
    return NextResponse.json({
      ok: true,
      query: q,
      limit,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error('[api/enciclopedia/search GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo completar la búsqueda de enciclopedia.' },
      { status: 500 }
    );
  }
}

