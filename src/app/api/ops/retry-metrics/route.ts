import { NextResponse } from 'next/server';
import { getRetryTelemetrySnapshot } from '@/lib/retry-telemetry';

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
    const rawLimit = Number(url.searchParams.get('limit') ?? 50);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(500, Math.floor(rawLimit))) : 50;
    const snapshot = getRetryTelemetrySnapshot(limit);

    return NextResponse.json({
      ok: true,
      limit,
      retries: snapshot,
    });
  } catch (error) {
    console.error('[api/ops/retry-metrics GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudieron obtener las métricas de retry.' },
      { status: 500 }
    );
  }
}

