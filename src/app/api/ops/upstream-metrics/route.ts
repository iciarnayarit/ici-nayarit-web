import { NextResponse } from 'next/server';
import { getUpstreamMetricsSnapshot } from '@/lib/load-balancer';

function hasValidSecret(req: Request): boolean {
  const expected = process.env.TELEMETRY_SECRET?.trim() || process.env.REVALIDATE_SECRET?.trim();
  if (!expected) return false;
  const headerSecret =
    req.headers.get('x-ops-secret')?.trim() ||
    req.headers.get('x-telemetry-secret')?.trim() ||
    req.headers.get('x-revalidate-secret')?.trim();
  return headerSecret === expected;
}

export async function GET(req: Request) {
  try {
    if (!hasValidSecret(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const namespace = url.searchParams.get('namespace')?.trim() || undefined;
    const rawLimit = Number(url.searchParams.get('limit') ?? 100);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(500, Math.floor(rawLimit))) : 100;
    const snapshot = getUpstreamMetricsSnapshot(namespace).slice(0, limit);

    return NextResponse.json({
      ok: true,
      namespace: namespace ?? null,
      limit,
      total: snapshot.length,
      upstreams: snapshot,
    });
  } catch (error) {
    console.error('[api/ops/upstream-metrics GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudieron obtener las métricas de upstreams.' },
      { status: 500 }
    );
  }
}

