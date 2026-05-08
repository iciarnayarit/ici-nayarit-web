import { NextResponse } from 'next/server';
import {
  buildOpsTelemetryPanel,
  isOpsTelemetryAuthorized,
  parseOpsPanelQuery,
} from '@/lib/ops-telemetry-panel';

/**
 * Snapshot agregado para dashboard: rate-limit + retries + upstreams (mismo cuerpo que `/api/ops/panel`, distinto `kind` para enlaces y monitorización).
 */
export async function GET(req: Request) {
  try {
    if (!isOpsTelemetryAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const panel = buildOpsTelemetryPanel(parseOpsPanelQuery(new URL(req.url)));

    return NextResponse.json({
      ok: true,
      kind: 'health-snapshot',
      schemaVersion: 1,
      ...panel,
    });
  } catch (error) {
    console.error('[api/ops/health-snapshot GET]', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo construir el snapshot de salud ops.' },
      { status: 500 }
    );
  }
}
