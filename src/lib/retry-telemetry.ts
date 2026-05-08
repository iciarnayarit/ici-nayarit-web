type RetryTelemetryInput = {
  provider: string;
  attempt: number;
  delayMs: number;
  operation?: string;
  error: unknown;
};

type RetryCounter = {
  retries: number;
  firstAt: number;
  lastAt: number;
  totalDelayMs: number;
};

const RETRY_COUNTERS = new Map<string, RetryCounter>();

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error ?? 'unknown');
}

function topRetryProviders(limit = 5) {
  return [...RETRY_COUNTERS.entries()]
    .sort((a, b) => b[1].retries - a[1].retries)
    .slice(0, limit)
    .map(([key, value]) => ({
      key,
      retries: value.retries,
      avgDelayMs: value.retries > 0 ? Math.round((value.totalDelayMs / value.retries) * 100) / 100 : 0,
      firstAt: new Date(value.firstAt).toISOString(),
      lastAt: new Date(value.lastAt).toISOString(),
    }));
}

export function getRetryTelemetrySnapshot(limit = 20) {
  const safeLimit = Math.max(1, limit);
  const ranking = [...RETRY_COUNTERS.entries()]
    .sort((a, b) => b[1].retries - a[1].retries)
    .slice(0, safeLimit)
    .map(([key, value]) => ({
      key,
      operation: key.includes(':') ? key.slice(0, key.indexOf(':')) : key,
      provider: key.includes(':') ? key.slice(key.indexOf(':') + 1) : '',
      retries: value.retries,
      avgDelayMs: value.retries > 0 ? Math.round((value.totalDelayMs / value.retries) * 100) / 100 : 0,
      firstAt: new Date(value.firstAt).toISOString(),
      lastAt: new Date(value.lastAt).toISOString(),
    }));

  const totalRetries = ranking.reduce((acc, row) => acc + row.retries, 0);
  return {
    generatedAt: new Date().toISOString(),
    totalTrackedProviders: RETRY_COUNTERS.size,
    totalRetries,
    topProviders: ranking,
  };
}

export function logRetryAttempt(input: RetryTelemetryInput) {
  const now = Date.now();
  const operation = input.operation?.trim() || 'generic';
  const key = `${operation}:${input.provider}`;
  const current = RETRY_COUNTERS.get(key) ?? {
    retries: 0,
    firstAt: now,
    lastAt: now,
    totalDelayMs: 0,
  };
  current.retries += 1;
  current.lastAt = now;
  current.totalDelayMs += Math.max(0, input.delayMs);
  RETRY_COUNTERS.set(key, current);

  const shouldEmit = current.retries <= 3 || current.retries % 20 === 0;
  if (!shouldEmit) return;

  console.warn('[retry][attempt]', {
    operation,
    provider: input.provider,
    attempt: input.attempt,
    delayMs: input.delayMs,
    error: errorMessage(input.error).slice(0, 220),
    retriesForProvider: current.retries,
    avgDelayMs: Math.round((current.totalDelayMs / current.retries) * 100) / 100,
    firstAt: new Date(current.firstAt).toISOString(),
    lastAt: new Date(current.lastAt).toISOString(),
  });

  if (current.retries <= 3 || current.retries % 50 === 0) {
    console.warn('[retry][top-providers]', {
      totalProviders: RETRY_COUNTERS.size,
      ranking: topRetryProviders(5),
    });
  }
}

