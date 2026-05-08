import { getAllCircuitStateSnapshots } from '@/lib/circuit-breaker';
import { isOpsTelemetryAuthorized } from '@/lib/ops-telemetry-panel';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    if (!isOpsTelemetryAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      circuitStates: getAllCircuitStateSnapshots(),
    });
  } catch (error) {
    console.error('[api/ops/circuit-states GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo obtener el estado de los circuit breakers.' },
      { status: 500 }
    );
  }
}
