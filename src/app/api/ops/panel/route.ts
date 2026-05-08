import { NextResponse } from 'next/server';
import {
  buildOpsTelemetryPanel,
  isOpsTelemetryAuthorized,
  parseOpsPanelQuery,
} from '@/lib/ops-telemetry-panel';

/** Panel ops agregado: rate-limit + retries + upstreams en un solo JSON. */
export async function GET(req: Request) {
  try {
    if (!isOpsTelemetryAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const panel = buildOpsTelemetryPanel(parseOpsPanelQuery(new URL(req.url)));

    return NextResponse.json({
      ok: true,
      schemaVersion: 1,
      ...panel,
    });
  } catch (error) {
    console.error('[api/ops/panel GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo construir el panel de telemetría.' },
      { status: 500 }
    );
  }
}
