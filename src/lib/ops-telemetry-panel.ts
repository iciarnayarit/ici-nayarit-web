import { getRateLimitTelemetrySnapshot } from '@/lib/rate-limit-telemetry';
import { getRetryTelemetrySnapshot } from '@/lib/retry-telemetry';
import { getUpstreamMetricsSnapshot } from '@/lib/load-balancer';

/** Auth compartida para `/api/ops/panel`, `/api/ops/health-snapshot`, `/api/telemetry/panel`. */
export function isOpsTelemetryAuthorized(req: Request): boolean {
  const expected = process.env.TELEMETRY_SECRET?.trim() || process.env.REVALIDATE_SECRET?.trim();
  if (!expected) return false;
  const headerSecret =
    req.headers.get('x-ops-secret')?.trim() ||
    req.headers.get('x-telemetry-secret')?.trim() ||
    req.headers.get('x-revalidate-secret')?.trim();
  return headerSecret === expected;
}

export function parseOpsPanelQuery(url: URL): {
  rateLimitLimit?: number;
  retryLimit?: number;
  upstreamLimit?: number;
  namespace?: string;
} {
  const rateLimitLimit = Number(url.searchParams.get('limitRate') ?? url.searchParams.get('rateLimit'));
  const retryLimit = Number(url.searchParams.get('limitRetries') ?? url.searchParams.get('retries'));
  const upstreamLimit = Number(url.searchParams.get('limitUpstreams') ?? url.searchParams.get('upstreams'));
  const namespace = url.searchParams.get('namespace')?.trim() || undefined;
  return {
    rateLimitLimit: Number.isFinite(rateLimitLimit) ? rateLimitLimit : undefined,
    retryLimit: Number.isFinite(retryLimit) ? retryLimit : undefined,
    upstreamLimit: Number.isFinite(upstreamLimit) ? upstreamLimit : undefined,
    namespace,
  };
}

export type OpsTelemetryPanelPayload = {
  generatedAt: string;
  rateLimit: {
    limit: number;
    telemetry: ReturnType<typeof getRateLimitTelemetrySnapshot>;
  };
  retries: {
    limit: number;
    retries: ReturnType<typeof getRetryTelemetrySnapshot>;
  };
  upstreams: {
    namespace: string | null;
    limit: number;
    total: number;
    upstreams: ReturnType<typeof getUpstreamMetricsSnapshot>;
  };
};

function clampInt(n: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

/**
 * Snapshot único para paneles ops: rate-limit + reintentos + upstreams.
 */
export function buildOpsTelemetryPanel(input: {
  rateLimitLimit?: number;
  retryLimit?: number;
  upstreamLimit?: number;
  namespace?: string;
}): OpsTelemetryPanelPayload {
  const rateLimitLimit = clampInt(input.rateLimitLimit ?? 20, 1, 200, 20);
  const retryLimit = clampInt(input.retryLimit ?? 50, 1, 500, 50);
  const upstreamLimit = clampInt(input.upstreamLimit ?? 100, 1, 500, 100);
  const namespace = input.namespace?.trim() || undefined;
  const upstreamRows = getUpstreamMetricsSnapshot(namespace).slice(0, upstreamLimit);

  return {
    generatedAt: new Date().toISOString(),
    rateLimit: {
      limit: rateLimitLimit,
      telemetry: getRateLimitTelemetrySnapshot(rateLimitLimit),
    },
    retries: {
      limit: retryLimit,
      retries: getRetryTelemetrySnapshot(retryLimit),
    },
    upstreams: {
      namespace: namespace ?? null,
      limit: upstreamLimit,
      total: upstreamRows.length,
      upstreams: upstreamRows,
    },
  };
}
