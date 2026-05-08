import { NextResponse } from 'next/server';
import { getRateLimitTelemetrySnapshot } from '@/lib/rate-limit-telemetry';

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
    const rawLimit = Number(url.searchParams.get('limit') ?? 20);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(200, Math.floor(rawLimit))) : 20;
    const snapshot = getRateLimitTelemetrySnapshot(limit);

    return NextResponse.json({
      ok: true,
      limit,
      telemetry: snapshot,
    });
  } catch (error) {
    console.error('[api/ops/rate-limit-telemetry GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo obtener la telemetría de rate limit.' },
      { status: 500 }
    );
  }
}

