import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_DBP_BASE_URL = 'https://4.dbt.io/api';

function getDbpConfig() {
  const apiKey = process.env.DBP_API_KEY?.trim();
  const baseUrl = (process.env.DBP_BASE_URL?.trim() || DEFAULT_DBP_BASE_URL).replace(/\/+$/, '');
  return { apiKey, baseUrl };
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
  const { apiKey, baseUrl } = getDbpConfig();
  if (!apiKey) {
    throw new Error('Falta configurar DBP_API_KEY en el servidor.');
  }

  const buildUrl = (base: string) => {
    const safePath = pathSegments.map(seg => encodeURIComponent(seg)).join('/');
    const upstream = new URL(`${base}/${safePath}`);
    appendDbpQuery(upstream, query, apiKey);
    return upstream.toString();
  };

  const primaryUrl = buildUrl(baseUrl);
  const tryFetch = async (url: string) => {
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
  };

  try {
    return await tryFetch(primaryUrl);
  } catch (error) {
    const dnsFailed = (error as { cause?: { code?: string } })?.cause?.code === 'ENOTFOUND';
    if (dnsFailed && baseUrl !== DEFAULT_DBP_BASE_URL) {
      return tryFetch(buildUrl(DEFAULT_DBP_BASE_URL));
    }
    throw error;
  }
}

export async function proxyDbpGet(req: NextRequest, pathSegments: string[]) {
  const { apiKey, baseUrl } = getDbpConfig();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Falta configurar DBP_API_KEY en el servidor.' },
      { status: 503 }
    );
  }

  async function fetchUpstream(url: string) {
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

    return new NextResponse(body, {
      status: upstreamRes.status,
      headers: { 'content-type': contentType },
    });
  }

  const upstreamUrl = buildUpstreamUrl(req, pathSegments, baseUrl, apiKey);

  try {
    return await fetchUpstream(upstreamUrl);
  } catch (error) {
    const cause = (error as { cause?: { code?: string } })?.cause;
    const dnsFailed = cause?.code === 'ENOTFOUND';

    if (dnsFailed && baseUrl !== DEFAULT_DBP_BASE_URL) {
      const fallbackUrl = buildUpstreamUrl(req, pathSegments, DEFAULT_DBP_BASE_URL, apiKey);
      try {
        return await fetchUpstream(fallbackUrl);
      } catch (fallbackError) {
        console.error(
          '[api/dbp] Error proxy DBP (fallback también falló)',
          { pathSegments, upstreamUrl, fallbackUrl },
          fallbackError
        );
      }
    }

    console.error('[api/dbp] Error proxy DBP', { pathSegments, upstreamUrl }, error);
    return NextResponse.json(
      { error: 'No se pudo consultar DBP en este momento.' },
      { status: 502 }
    );
  }
}
