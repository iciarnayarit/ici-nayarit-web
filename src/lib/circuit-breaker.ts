type CircuitState = 'closed' | 'open' | 'half-open';

type BreakerEntry = {
  state: CircuitState;
  failureCount: number;
  openedAt: number | null;
  halfOpenInFlight: boolean;
};

type CircuitBreakerOptions = {
  failureThreshold?: number;
  openMs?: number;
};

const CIRCUITS = new Map<string, BreakerEntry>();

function logCircuitTransition(input: {
  key: string;
  from: CircuitState;
  to: CircuitState;
  reason: string;
  failureCount: number;
  openedAt: number | null;
}) {
  console.warn('[circuit-breaker][transition]', {
    key: input.key,
    from: input.from,
    to: input.to,
    reason: input.reason,
    failureCount: input.failureCount,
    openedAt: input.openedAt ? new Date(input.openedAt).toISOString() : null,
    at: new Date().toISOString(),
  });
}

function nowMs() {
  return Date.now();
}

function getEntry(key: string): BreakerEntry {
  const existing = CIRCUITS.get(key);
  if (existing) return existing;
  const created: BreakerEntry = {
    state: 'closed',
    failureCount: 0,
    openedAt: null,
    halfOpenInFlight: false,
  };
  CIRCUITS.set(key, created);
  return created;
}

function transitionToOpen(entry: BreakerEntry, key: string, reason: string) {
  const from = entry.state;
  entry.state = 'open';
  entry.openedAt = nowMs();
  entry.halfOpenInFlight = false;
  if (from !== 'open') {
    logCircuitTransition({
      key,
      from,
      to: 'open',
      reason,
      failureCount: entry.failureCount,
      openedAt: entry.openedAt,
    });
  }
}

function transitionToHalfOpen(entry: BreakerEntry, key: string, reason: string) {
  const from = entry.state;
  entry.state = 'half-open';
  entry.halfOpenInFlight = false;
  if (from !== 'half-open') {
    logCircuitTransition({
      key,
      from,
      to: 'half-open',
      reason,
      failureCount: entry.failureCount,
      openedAt: entry.openedAt,
    });
  }
}

function transitionToClosed(entry: BreakerEntry, key: string, reason: string) {
  const from = entry.state;
  entry.state = 'closed';
  entry.failureCount = 0;
  entry.openedAt = null;
  entry.halfOpenInFlight = false;
  if (from !== 'closed') {
    logCircuitTransition({
      key,
      from,
      to: 'closed',
      reason,
      failureCount: entry.failureCount,
      openedAt: entry.openedAt,
    });
  }
}

export function getCircuitStateSnapshot(key: string) {
  const entry = getEntry(key);
  return {
    key,
    state: entry.state,
    failureCount: entry.failureCount,
    openedAt: entry.openedAt ? new Date(entry.openedAt).toISOString() : null,
    halfOpenInFlight: entry.halfOpenInFlight,
  };
}

export function getAllCircuitStateSnapshots() {
  return Array.from(CIRCUITS.entries()).map(([key, entry]) => ({
    key,
    state: entry.state,
    failureCount: entry.failureCount,
    openedAt: entry.openedAt ? new Date(entry.openedAt).toISOString() : null,
    halfOpenInFlight: entry.halfOpenInFlight,
  }));
}

export async function withCircuitBreaker<T>(
  key: string,
  task: () => Promise<T>,
  options?: CircuitBreakerOptions
): Promise<T> {
  const failureThreshold = Math.max(1, Math.floor(options?.failureThreshold ?? 4));
  const openMs = Math.max(500, Math.floor(options?.openMs ?? 12_000));
  const entry = getEntry(key);
  const now = nowMs();

  if (entry.state === 'open') {
    const openedAt = entry.openedAt ?? now;
    const elapsed = now - openedAt;
    if (elapsed < openMs) {
      throw new Error(`CIRCUIT_OPEN:${key}`);
    }
    transitionToHalfOpen(entry, key, 'cooldown_elapsed');
  }

  if (entry.state === 'half-open') {
    if (entry.halfOpenInFlight) {
      throw new Error(`CIRCUIT_HALF_OPEN_BUSY:${key}`);
    }
    entry.halfOpenInFlight = true;
  }

  try {
    const result = await task();
    transitionToClosed(entry, key, 'task_succeeded');
    return result;
  } catch (error) {
    if (entry.state === 'half-open') {
      transitionToOpen(entry, key, 'half_open_probe_failed');
      throw error;
    }

    entry.failureCount += 1;
    if (entry.failureCount >= failureThreshold) {
      transitionToOpen(entry, key, 'failure_threshold_reached');
    }
    throw error;
  } finally {
    if (entry.state === 'half-open') {
      entry.halfOpenInFlight = false;
    }
  }
}

