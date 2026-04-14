import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_DBP_BASE_URL = 'https://4.dbt.io/api';

function getDbpConfig() {
  const apiKey = process.env.DBP_API_KEY?.trim();
  const baseUrl = (process.env.DBP_BASE_URL?.trim() || DEFAULT_DBP_BASE_URL).replace(/\/+$/, '');
  return { apiKey, baseUrl };
}

function buildUpstreamUrl(req: NextRequest, pathSegments: string[], baseUrl: string, apiKey: string): string {
  const safePath = pathSegments.map(seg => encodeURIComponent(seg)).join('/');
  const upstream = new URL(`${baseUrl}/${safePath}`);

  req.nextUrl.searchParams.forEach((value, key) => {
    upstream.searchParams.append(key, value);
  });

  if (!upstream.searchParams.has('v')) {
    upstream.searchParams.set('v', '4');
  }

  upstream.searchParams.set('key', apiKey);
  return upstream.toString();
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
