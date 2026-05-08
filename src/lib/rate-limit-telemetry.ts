type RateLimitTelemetryInput = {
  endpoint: string;
  key: string;
  retryAfterSeconds: number;
  meta?: Record<string, unknown>;
};

type CounterState = {
  hits: number;
  firstAt: number;
  lastAt: number;
};

const RATE_LIMIT_COUNTERS = new Map<string, CounterState>();
const ENDPOINT_COUNTERS = new Map<string, CounterState>();

function formatIso(ts: number) {
  return new Date(ts).toISOString();
}

function topBlockedEndpoints(limit = 5) {
  return [...ENDPOINT_COUNTERS.entries()]
    .sort((a, b) => b[1].hits - a[1].hits)
    .slice(0, limit)
    .map(([endpoint, state]) => ({
      endpoint,
      hits: state.hits,
      firstAt: formatIso(state.firstAt),
      lastAt: formatIso(state.lastAt),
    }));
}

export function getRateLimitTelemetrySnapshot(limit = 20) {
  const endpointTotals = [...ENDPOINT_COUNTERS.entries()]
    .sort((a, b) => b[1].hits - a[1].hits)
    .slice(0, Math.max(1, limit))
    .map(([endpoint, state]) => ({
      endpoint,
      hits: state.hits,
      firstAt: formatIso(state.firstAt),
      lastAt: formatIso(state.lastAt),
    }));

  const keys = [...RATE_LIMIT_COUNTERS.entries()]
    .sort((a, b) => b[1].hits - a[1].hits)
    .slice(0, Math.max(1, limit))
    .map(([compositeKey, state]) => {
      const splitAt = compositeKey.indexOf(':');
      const endpoint = splitAt >= 0 ? compositeKey.slice(0, splitAt) : compositeKey;
      const key = splitAt >= 0 ? compositeKey.slice(splitAt + 1) : '';
      return {
        compositeKey,
        endpoint,
        key,
        hits: state.hits,
        firstAt: formatIso(state.firstAt),
        lastAt: formatIso(state.lastAt),
      };
    });

  const totalHits = endpointTotals.reduce((acc, row) => acc + row.hits, 0);
  return {
    generatedAt: formatIso(Date.now()),
    totalTrackedEndpointKeys: RATE_LIMIT_COUNTERS.size,
    totalTrackedEndpoints: ENDPOINT_COUNTERS.size,
    totalHits,
    topEndpoints: endpointTotals,
    topEndpointKeys: keys,
  };
}

export function logRateLimitHit(input: RateLimitTelemetryInput) {
  const now = Date.now();
  const counterKey = `${input.endpoint}:${input.key}`;
  const current = RATE_LIMIT_COUNTERS.get(counterKey) ?? {
    hits: 0,
    firstAt: now,
    lastAt: now,
  };
  current.hits += 1;
  current.lastAt = now;
  RATE_LIMIT_COUNTERS.set(counterKey, current);

  const endpointState = ENDPOINT_COUNTERS.get(input.endpoint) ?? {
    hits: 0,
    firstAt: now,
    lastAt: now,
  };
  endpointState.hits += 1;
  endpointState.lastAt = now;
  ENDPOINT_COUNTERS.set(input.endpoint, endpointState);

  const shouldEmit = current.hits <= 3 || current.hits % 10 === 0;
  if (!shouldEmit) return;

  console.warn('[rate-limit][429]', {
    endpoint: input.endpoint,
    key: input.key,
    retryAfterSeconds: input.retryAfterSeconds,
    hits: current.hits,
    firstAt: formatIso(current.firstAt),
    lastAt: formatIso(current.lastAt),
    ...(input.meta ?? {}),
  });

  if (endpointState.hits <= 3 || endpointState.hits % 20 === 0) {
    console.warn('[rate-limit][top-blocked-endpoints]', {
      totalEndpoints: ENDPOINT_COUNTERS.size,
      ranking: topBlockedEndpoints(5),
    });
  }
}

