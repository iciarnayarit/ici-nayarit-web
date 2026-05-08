export type LoadBalanceStrategy = 'round-robin' | 'least-connections';

type UpstreamState = {
  activeConnections: number;
  lastAssignedAt: number;
};

type UpstreamMetrics = {
  requests: number;
  errors: number;
  totalLatencyMs: number;
  lastRequestAt: number;
  lastErrorAt: number | null;
};

const UPSTREAM_STATE = new Map<string, UpstreamState>();
const ROUND_ROBIN_INDEX = new Map<string, number>();
const UPSTREAM_METRICS = new Map<string, UpstreamMetrics>();

function nowMs() {
  return Date.now();
}

function getState(key: string): UpstreamState {
  const existing = UPSTREAM_STATE.get(key);
  if (existing) return existing;
  const created: UpstreamState = { activeConnections: 0, lastAssignedAt: 0 };
  UPSTREAM_STATE.set(key, created);
  return created;
}

function bumpRoundRobin(namespace: string, total: number): number {
  const previous = ROUND_ROBIN_INDEX.get(namespace) ?? -1;
  const next = (previous + 1) % Math.max(1, total);
  ROUND_ROBIN_INDEX.set(namespace, next);
  return next;
}

function getMetrics(key: string): UpstreamMetrics {
  const existing = UPSTREAM_METRICS.get(key);
  if (existing) return existing;
  const created: UpstreamMetrics = {
    requests: 0,
    errors: 0,
    totalLatencyMs: 0,
    lastRequestAt: 0,
    lastErrorAt: null,
  };
  UPSTREAM_METRICS.set(key, created);
  return created;
}

function avgLatencyMs(m: UpstreamMetrics): number {
  if (m.requests <= 0) return 0;
  return Math.round((m.totalLatencyMs / m.requests) * 100) / 100;
}

function logUpstreamMetrics(input: { namespace: string; upstreamId: string; metrics: UpstreamMetrics }) {
  const { namespace, upstreamId, metrics } = input;
  const shouldEmit = metrics.requests <= 3 || metrics.requests % 50 === 0;
  if (!shouldEmit) return;
  console.info('[load-balancer][upstream-metrics]', {
    namespace,
    upstreamId,
    requests: metrics.requests,
    errors: metrics.errors,
    errorRate: metrics.requests > 0 ? Math.round((metrics.errors / metrics.requests) * 10_000) / 100 : 0,
    avgLatencyMs: avgLatencyMs(metrics),
    lastRequestAt: new Date(metrics.lastRequestAt).toISOString(),
    lastErrorAt: metrics.lastErrorAt ? new Date(metrics.lastErrorAt).toISOString() : null,
  });
}

export function getUpstreamMetricsSnapshot(namespace?: string) {
  const prefix = namespace ? `${namespace}:` : '';
  return [...UPSTREAM_METRICS.entries()]
    .filter(([key]) => (prefix ? key.startsWith(prefix) : true))
    .map(([key, m]) => {
      const [ns, ...rest] = key.split(':');
      const upstreamId = rest.join(':');
      return {
        key,
        namespace: ns,
        upstreamId,
        requests: m.requests,
        errors: m.errors,
        avgLatencyMs: avgLatencyMs(m),
        lastRequestAt: m.lastRequestAt ? new Date(m.lastRequestAt).toISOString() : null,
        lastErrorAt: m.lastErrorAt ? new Date(m.lastErrorAt).toISOString() : null,
      };
    })
    .sort((a, b) => b.requests - a.requests);
}

export function pickUpstreamIndex(input: {
  namespace: string;
  strategy: LoadBalanceStrategy;
  upstreamIds: string[];
}): number {
  const { namespace, strategy, upstreamIds } = input;
  if (upstreamIds.length <= 1) return 0;

  if (strategy === 'round-robin') {
    return bumpRoundRobin(namespace, upstreamIds.length);
  }

  let bestIndex = 0;
  let bestConn = Number.POSITIVE_INFINITY;
  let bestLastAssigned = Number.POSITIVE_INFINITY;
  for (let i = 0; i < upstreamIds.length; i += 1) {
    const state = getState(`${namespace}:${upstreamIds[i]}`);
    if (
      state.activeConnections < bestConn ||
      (state.activeConnections === bestConn && state.lastAssignedAt < bestLastAssigned)
    ) {
      bestIndex = i;
      bestConn = state.activeConnections;
      bestLastAssigned = state.lastAssignedAt;
    }
  }
  return bestIndex;
}

export async function withBalancedUpstream<T>(input: {
  namespace: string;
  upstreamId: string;
  task: () => Promise<T>;
}): Promise<T> {
  const key = `${input.namespace}:${input.upstreamId}`;
  const state = getState(key);
  const startedAt = nowMs();
  state.activeConnections += 1;
  state.lastAssignedAt = nowMs();
  UPSTREAM_STATE.set(key, state);

  try {
    const result = await input.task();
    const elapsedMs = Math.max(0, nowMs() - startedAt);
    const metrics = getMetrics(key);
    metrics.requests += 1;
    metrics.totalLatencyMs += elapsedMs;
    metrics.lastRequestAt = nowMs();
    UPSTREAM_METRICS.set(key, metrics);
    logUpstreamMetrics({
      namespace: input.namespace,
      upstreamId: input.upstreamId,
      metrics,
    });
    return result;
  } catch (error) {
    const elapsedMs = Math.max(0, nowMs() - startedAt);
    const metrics = getMetrics(key);
    metrics.requests += 1;
    metrics.errors += 1;
    metrics.totalLatencyMs += elapsedMs;
    metrics.lastRequestAt = nowMs();
    metrics.lastErrorAt = nowMs();
    UPSTREAM_METRICS.set(key, metrics);
    logUpstreamMetrics({
      namespace: input.namespace,
      upstreamId: input.upstreamId,
      metrics,
    });
    throw error;
  } finally {
    const latest = getState(key);
    latest.activeConnections = Math.max(0, latest.activeConnections - 1);
    UPSTREAM_STATE.set(key, latest);
  }
}
