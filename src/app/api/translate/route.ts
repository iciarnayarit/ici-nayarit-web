import { NextRequest, NextResponse } from 'next/server';
import { consumeTokenBucket, getClientIpFromHeaders } from '@/lib/rate-limit';
import { pickUpstreamIndex, withBalancedUpstream, type LoadBalanceStrategy } from '@/lib/load-balancer';
import { getSemanticCacheMatch, setSemanticCacheValue } from '@/lib/semantic-cache';
import { withExponentialBackoff } from '@/lib/exponential-backoff';
import { getCircuitStateSnapshot, withCircuitBreaker } from '@/lib/circuit-breaker';
import { logRateLimitHit } from '@/lib/rate-limit-telemetry';
import { buildRateLimit429Headers, buildRateLimitPolicy } from '@/lib/rate-limit-headers';

const LIBRE_TRANSLATE = 'https://libretranslate.de/translate';
const MAX_CHARS_PER_CHUNK = 1600;
const MYMEMORY_MAX = 450;
const MAX_SEGMENTS = 60;
const MAX_TOTAL_CHARS = 400_000;

const FETCH_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'ICIAR-Nayarit-Web/1.0 (translation)',
} as const;

type Body = {
  segments?: unknown;
  source?: string;
  target?: string;
};

function buildTranslateCircuitHeader() {
  const keys = ['translate:google', 'translate:libre', 'translate:mymemory'] as const;
  return keys
    .map((key) => {
      const snapshot = getCircuitStateSnapshot(key);
      return `${key.split(':')[1]}=${snapshot.state}`;
    })
    .join(',');
}

function streamNdjsonLine(controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder, payload: unknown) {
  controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const v = JSON.parse(trimmed) as unknown;
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function translateViaLibre(chunk: string, source: string, target: string): Promise<string> {
  return withCircuitBreaker(
    'translate:libre',
    () =>
      withExponentialBackoff(
        async () => {
          const res = await fetch(LIBRE_TRANSLATE, {
            method: 'POST',
            headers: FETCH_HEADERS,
            body: JSON.stringify({ q: chunk, source, target, format: 'text' }),
          });
          const raw = await res.text();
          if (!res.ok) {
            throw new Error(`LibreTranslate ${res.status}: ${raw.slice(0, 160)}`);
          }
          const data = parseJsonObject(raw);
          const translated =
            data && typeof data.translatedText === 'string' ? data.translatedText.trim() : '';
          if (!translated) {
            throw new Error(
              `LibreTranslate: respuesta inválida (${raw.slice(0, 120).replace(/\s+/g, ' ')}…)`
            );
          }
          return translated;
        },
        {
          maxRetries: 3,
          baseDelayMs: 150,
          maxDelayMs: 2500,
          telemetry: { provider: 'libretranslate', operation: 'translate' },
        }
      ),
    { failureThreshold: 4, openMs: 15_000 }
  );
}

async function translateViaMyMemory(slice: string, langpair: string): Promise<string> {
  return withCircuitBreaker(
    'translate:mymemory',
    () =>
      withExponentialBackoff(
        async () => {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(slice)}&langpair=${encodeURIComponent(langpair)}`;
          const res = await fetch(url, {
            headers: { 'User-Agent': FETCH_HEADERS['User-Agent'] },
          });
          const raw = await res.text();
          const data = parseJsonObject(raw);
          if (!data) {
            throw new Error(`MyMemory: no JSON (${raw.slice(0, 100)}…)`);
          }
          const status = data.responseStatus;
          const rd = data.responseData;
          const text =
            rd && typeof rd === 'object' && rd !== null && 'translatedText' in rd
              ? String((rd as { translatedText?: string }).translatedText ?? '')
              : '';
          if (status !== 200 || !text.trim()) {
            throw new Error(
              typeof data.responseDetails === 'string'
                ? data.responseDetails.slice(0, 200)
                : `MyMemory status ${String(status)}`
            );
          }
          return text.trim();
        },
        {
          maxRetries: 3,
          baseDelayMs: 150,
          maxDelayMs: 2500,
          telemetry: { provider: 'mymemory', operation: 'translate' },
        }
      ),
    { failureThreshold: 4, openMs: 15_000 }
  );
}

async function translateViaGoogle(text: string, source: string, target: string): Promise<string> {
  return withCircuitBreaker(
    'translate:google',
    () =>
      withExponentialBackoff(
        async () => {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
          const res = await fetch(url, {
            headers: { 'User-Agent': FETCH_HEADERS['User-Agent'] },
          });
          if (!res.ok) throw new Error(`Google HTTP error ${res.status}`);
          const data = await res.json() as unknown;
          if (Array.isArray(data) && Array.isArray(data[0])) {
            return data[0].map((item: unknown) => (Array.isArray(item) ? String(item[0] ?? '') : '')).join('');
          }
          throw new Error('Google JSON error');
        },
        {
          maxRetries: 3,
          baseDelayMs: 150,
          maxDelayMs: 2500,
          telemetry: { provider: 'google-translate', operation: 'translate' },
        }
      ),
    { failureThreshold: 4, openMs: 15_000 }
  );
}

async function translateChunkWithFallback(
  text: string,
  source: string,
  target: string,
  langpair: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (source === target) return text;
  const cacheKeyspace = `translate:${source}:${target}`;
  const semanticHit = getSemanticCacheMatch<string>({
    keyspace: cacheKeyspace,
    text: trimmed,
    minSimilarity: 0.95,
  });
  if (semanticHit) {
    return semanticHit.value;
  }

  const providers = ['google', 'libre', 'mymemory'] as const;
  const strategyRaw = (process.env.TRANSLATE_LOAD_BALANCE_STRATEGY?.trim().toLowerCase() ||
    'round-robin') as LoadBalanceStrategy;
  const strategy: LoadBalanceStrategy =
    strategyRaw === 'least-connections' ? 'least-connections' : 'round-robin';
  const startIndex = pickUpstreamIndex({
    namespace: 'translate-providers',
    strategy,
    upstreamIds: [...providers],
  });
  const orderedProviders = [...providers.slice(startIndex), ...providers.slice(0, startIndex)];

  const parts: string[] = [];
  for (let i = 0; i < text.length; i += MAX_CHARS_PER_CHUNK) {
    const chunk = text.slice(i, i + MAX_CHARS_PER_CHUNK);
    let piece = '';

    let translated = false;
    for (const provider of orderedProviders) {
      try {
        if (provider === 'google') {
          piece = await withBalancedUpstream({
            namespace: 'translate-providers',
            upstreamId: provider,
            task: () => translateViaGoogle(chunk, source, target),
          });
        } else if (provider === 'libre') {
          piece = await withBalancedUpstream({
            namespace: 'translate-providers',
            upstreamId: provider,
            task: () => translateViaLibre(chunk, source, target),
          });
        } else {
          piece = await withBalancedUpstream({
            namespace: 'translate-providers',
            upstreamId: provider,
            task: async () => {
              const memParts: string[] = [];
              for (let j = 0; j < chunk.length; j += MYMEMORY_MAX) {
                const slice = chunk.slice(j, j + MYMEMORY_MAX);
                memParts.push(await translateViaMyMemory(slice, langpair));
              }
              return memParts.join('');
            },
          });
        }
        translated = true;
        break;
      } catch {
        // Intentar siguiente proveedor balanceado.
      }
    }

    if (!translated) {
      throw new Error(
        'Lo sentimos mucho, los límites diarios de traducción se han agotado en nuestros servidores gratuitos. Por favor, intenta de nuevo más tarde.'
      );
    }
    parts.push(piece);
  }
  const translated = parts.join('');
  setSemanticCacheValue({
    keyspace: cacheKeyspace,
    text: trimmed,
    value: translated,
  });
  return translated;
}

async function translateSegmentsWithPool(
  segments: string[],
  source: string,
  target: string,
  langpair: string,
  concurrency: number
): Promise<string[]> {
  const results = new Array<string>(segments.length);
  let next = 0;

  async function worker() {
    while (true) {
      const idx = next++;
      if (idx >= segments.length) return;
      results[idx] = await translateChunkWithFallback(segments[idx], source, target, langpair);
    }
  }

  const n = Math.min(Math.max(1, concurrency), segments.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

function streamTranslationsAsNdjson(input: {
  segments: string[];
  source: string;
  target: string;
  langpair: string;
  circuitStateHeader: string;
}) {
  const { segments, source, target, langpair, circuitStateHeader } = input;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        streamNdjsonLine(controller, encoder, { type: 'start', total: segments.length });
        for (let i = 0; i < segments.length; i += 1) {
          const translated = await translateChunkWithFallback(segments[i], source, target, langpair);
          streamNdjsonLine(controller, encoder, {
            type: 'segment',
            index: i,
            text: translated,
          });
        }
        streamNdjsonLine(controller, encoder, { type: 'done', total: segments.length });
      } catch (error) {
        streamNdjsonLine(controller, encoder, {
          type: 'error',
          message: error instanceof Error ? error.message : 'Falló la traducción en streaming.',
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
      'X-Circuit-State': circuitStateHeader,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const policy = buildRateLimitPolicy({
      kind: 'token-bucket',
      capacity: 12,
      refillTokens: 1,
      refillIntervalMs: 5000,
    });
    const throttle = consumeTokenBucket({
      key: `api:translate:${ip}`,
      capacity: 12,
      refillTokens: 1,
      refillIntervalMs: 5000,
    });
    if (!throttle.allowed) {
      logRateLimitHit({
        endpoint: '/api/translate',
        key: ip,
        retryAfterSeconds: throttle.retryAfterSeconds,
        meta: {
          policy,
          remaining: throttle.remaining,
        },
      });
      return NextResponse.json(
        { error: 'Demasiadas solicitudes de traducción. Intenta de nuevo en unos segundos.' },
        {
          status: 429,
          headers: buildRateLimit429Headers({
            retryAfterSeconds: throttle.retryAfterSeconds,
            remaining: throttle.remaining,
            policy,
          }),
        }
      );
    }

    const body = (await req.json()) as Body;
    const { segments, source = 'en', target = 'es' } = body;

    if (!Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ error: 'Se requiere "segments" (array de textos).' }, { status: 400 });
    }
    if (segments.length > MAX_SEGMENTS) {
      return NextResponse.json({ error: 'Demasiados fragmentos.' }, { status: 400 });
    }
    if (!segments.every((s): s is string => typeof s === 'string')) {
      return NextResponse.json({ error: 'Cada segmento debe ser texto.' }, { status: 400 });
    }

    const total = segments.reduce((n, s) => n + s.length, 0);
    if (total > MAX_TOTAL_CHARS) {
      return NextResponse.json({ error: 'Texto demasiado largo.' }, { status: 400 });
    }

    if (typeof source !== 'string' || typeof target !== 'string' || source.length > 8 || target.length > 8) {
      return NextResponse.json({ error: 'Idiomas no válidos.' }, { status: 400 });
    }

    const langpair = `${source}|${target}`;
    const streamRequested =
      req.nextUrl.searchParams.get('stream') === '1' ||
      req.headers.get('accept')?.toLowerCase().includes('application/x-ndjson') === true;
    const circuitStateHeader = buildTranslateCircuitHeader();
    if (streamRequested) {
      return streamTranslationsAsNdjson({ segments, source, target, langpair, circuitStateHeader });
    }

    const translations = await translateSegmentsWithPool(segments, source, target, langpair, 3);

    return NextResponse.json(
      { translations },
      {
        headers: {
          'X-Circuit-State': circuitStateHeader,
        },
      }
    );
  } catch (e) {
    console.error('[translate]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Falló la traducción.' },
      { status: 502 }
    );
  }
}
