import { NextRequest, NextResponse } from 'next/server';
import { pickUpstreamIndex, withBalancedUpstream, type LoadBalanceStrategy } from '@/lib/load-balancer';
import { withExponentialBackoff } from '@/lib/exponential-backoff';
import { getCircuitStateSnapshot, withCircuitBreaker } from '@/lib/circuit-breaker';

const DEFAULT_DBP_BASE_URL = 'https://4.dbt.io/api';

export function buildDbpCircuitHeader() {
  const keys = ['dbp:proxy', 'dbp:json'] as const;
  return keys
    .map((key) => `${key.split(':')[1]}=${getCircuitStateSnapshot(key).state}`)
    .join(',');
}

function getDbpConfig() {
  const apiKey = process.env.DBP_API_KEY?.trim();
  const rawBaseUrls =
    process.env.DBP_BASE_URLS?.trim() ||
    process.env.DBP_UPSTREAMS?.trim() ||
    process.env.DBP_BASE_URL?.trim() ||
    DEFAULT_DBP_BASE_URL;
  const baseUrls = rawBaseUrls
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .map(v => v.replace(/\/+$/, ''));
  const strategyRaw = (process.env.DBP_LOAD_BALANCE_STRATEGY?.trim().toLowerCase() ||
    'round-robin') as LoadBalanceStrategy;
  const strategy: LoadBalanceStrategy =
    strategyRaw === 'least-connections' ? 'least-connections' : 'round-robin';
  return { apiKey, baseUrls, strategy };
}

function appendDbpQuery(
  upstream: URL,
  query: Record<string, string | number | boolean | undefined | null>,
  apiKey: string
) {
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    upstream.searchParams.set(key, String(value));
  });
  if (!upstream.searchParams.has('v')) {
    upstream.searchParams.set('v', '4');
  }
  upstream.searchParams.set('key', apiKey);
}

function buildUpstreamUrl(req: NextRequest, pathSegments: string[], baseUrl: string, apiKey: string): string {
  const safePath = pathSegments.map(seg => encodeURIComponent(seg)).join('/');
  const upstream = new URL(`${baseUrl}/${safePath}`);

  const query: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  appendDbpQuery(upstream, query, apiKey);
  return upstream.toString();
}

export async function fetchDbpJson<T>(
  pathSegments: string[],
  query: Record<string, string | number | boolean | undefined | null> = {}
): Promise<T> {
  const { apiKey, baseUrls, strategy } = getDbpConfig();
  if (!apiKey) {
    throw new Error('Falta configurar DBP_API_KEY en el servidor.');
  }

  const buildUrl = (base: string) => {
    const safePath = pathSegments.map(seg => encodeURIComponent(seg)).join('/');
    const upstream = new URL(`${base}/${safePath}`);
    appendDbpQuery(upstream, query, apiKey);
    return upstream.toString();
  };

  const upstreams = baseUrls.length > 0 ? baseUrls : [DEFAULT_DBP_BASE_URL];
  const startIndex = pickUpstreamIndex({
    namespace: 'dbp-json',
    strategy,
    upstreamIds: upstreams,
  });
  const orderedUpstreams = [...upstreams.slice(startIndex), ...upstreams.slice(0, startIndex)];

  const tryFetch = async (url: string) => {
    return withCircuitBreaker(
      'dbp:json',
      () =>
        withExponentialBackoff(
          async () => {
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'User-Agent': 'ICIAR-Nayarit-Web/1.0 (dbp-proxy)',
              },
              cache: 'no-store',
            });
            if (!res.ok) {
              const raw = await res.text().catch(() => '');
              throw new Error(`DBP ${res.status}: ${raw.slice(0, 200)}`);
            }
            return (await res.json()) as T;
          },
          {
            maxRetries: 3,
            baseDelayMs: 160,
            maxDelayMs: 3000,
            telemetry: { provider: url, operation: 'dbp-json' },
          }
        ),
      { failureThreshold: 4, openMs: 12_000 }
    );
  };

  let lastError: unknown = null;
  for (const upstreamBase of orderedUpstreams) {
    const url = buildUrl(upstreamBase);
    try {
      return await withBalancedUpstream({
        namespace: 'dbp-json',
        upstreamId: upstreamBase,
        task: () => tryFetch(url),
      });
    } catch (error) {
      lastError = error;
      const dnsFailed = (error as { cause?: { code?: string } })?.cause?.code === 'ENOTFOUND';
      if (!dnsFailed) {
        throw error;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('No hay upstream DBP disponible.');
}

export async function proxyDbpGet(req: NextRequest, pathSegments: string[]) {
  const circuitStateHeader = buildDbpCircuitHeader();
  const { apiKey, baseUrls, strategy } = getDbpConfig();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Falta configurar DBP_API_KEY en el servidor.' },
      { status: 503, headers: { 'X-Circuit-State': circuitStateHeader } }
    );
  }

  async function fetchUpstream(url: string) {
    return withCircuitBreaker(
      'dbp:proxy',
      () =>
        withExponentialBackoff(
          async () => {
            const upstreamRes = await fetch(url, {
              method: 'GET',
              headers: {
                Accept: req.headers.get('accept') || 'application/json',
                'User-Agent': 'ICIAR-Nayarit-Web/1.0 (dbp-proxy)',
              },
              cache: 'no-store',
            });

            const contentType = upstreamRes.headers.get('content-type') || 'application/json; charset=utf-8';
            const body = await upstreamRes.text();

            if (!upstreamRes.ok) {
              throw new Error(`DBP ${upstreamRes.status}: ${body.slice(0, 200)}`);
            }

            return new NextResponse(body, {
              status: upstreamRes.status,
              headers: {
                'content-type': contentType,
                'X-Circuit-State': circuitStateHeader,
              },
            });
          },
          {
            maxRetries: 3,
            baseDelayMs: 160,
            maxDelayMs: 3000,
            telemetry: { provider: url, operation: 'dbp-proxy' },
            shouldRetry: (error, attempt) => {
              const msg = error instanceof Error ? error.message : String(error ?? '');
              if (/DBP 4\d\d/i.test(msg) && !/DBP 429/i.test(msg)) return false;
              return attempt < 3;
            },
          }
        ),
      { failureThreshold: 4, openMs: 12_000 }
    );
  }

  const upstreams = baseUrls.length > 0 ? baseUrls : [DEFAULT_DBP_BASE_URL];
  const startIndex = pickUpstreamIndex({
    namespace: 'dbp-proxy',
    strategy,
    upstreamIds: upstreams,
  });
  const orderedUpstreams = [...upstreams.slice(startIndex), ...upstreams.slice(0, startIndex)];

  let lastError: unknown = null;
  for (const upstreamBase of orderedUpstreams) {
    const upstreamUrl = buildUpstreamUrl(req, pathSegments, upstreamBase, apiKey);
    try {
      return await withBalancedUpstream({
        namespace: 'dbp-proxy',
        upstreamId: upstreamBase,
        task: () => fetchUpstream(upstreamUrl),
      });
    } catch (error) {
      lastError = error;
      const cause = (error as { cause?: { code?: string } })?.cause;
      const dnsFailed = cause?.code === 'ENOTFOUND';
      if (!dnsFailed) {
        console.error('[api/dbp] Error proxy DBP', { pathSegments, upstreamUrl }, error);
        break;
      }
    }
  }

  console.error('[api/dbp] Error proxy DBP (todos los upstreams fallaron)', { pathSegments }, lastError);
  return NextResponse.json(
    { error: 'No se pudo consultar DBP en este momento.' },
    {
      status: 502,
      headers: { 'X-Circuit-State': circuitStateHeader },
    }
  );
}
