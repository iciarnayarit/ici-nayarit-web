import { NextResponse } from 'next/server';
import {
  buildOpsTelemetryPanel,
  isOpsTelemetryAuthorized,
  parseOpsPanelQuery,
} from '@/lib/ops-telemetry-panel';

/**
 * Mismo payload que `GET /api/ops/panel`, con cabeceras alineadas al resto de `/api/telemetry/*`.
 */
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
    console.error('[api/telemetry/panel GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo construir el panel de telemetría.' },
      { status: 500 }
    );
  }
}
