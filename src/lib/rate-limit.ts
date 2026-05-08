type TokenBucketState = {
  tokens: number;
  lastRefillAt: number;
};

type LeakyBucketState = {
  level: number;
  lastLeakAt: number;
};

const TOKEN_BUCKETS = new Map<string, TokenBucketState>();
const LEAKY_BUCKETS = new Map<string, LeakyBucketState>();

function nowMs() {
  return Date.now();
}

function clampPositiveInt(value: number, fallback: number) {
  const normalized = Math.floor(Number.isFinite(value) ? value : fallback);
  return normalized > 0 ? normalized : fallback;
}

function sweepMaps(ts: number) {
  if (TOKEN_BUCKETS.size > 5000) {
    for (const [key, value] of TOKEN_BUCKETS.entries()) {
      if (value.tokens >= 1 && ts - value.lastRefillAt > 5 * 60_000) {
        TOKEN_BUCKETS.delete(key);
      }
    }
  }
  if (LEAKY_BUCKETS.size > 5000) {
    for (const [key, value] of LEAKY_BUCKETS.entries()) {
      if (value.level <= 0 && ts - value.lastLeakAt > 5 * 60_000) {
        LEAKY_BUCKETS.delete(key);
      }
    }
  }
}

export function consumeTokenBucket(input: {
  key: string;
  capacity: number;
  refillTokens: number;
  refillIntervalMs: number;
  cost?: number;
}) {
  const ts = nowMs();
  sweepMaps(ts);

  const capacity = clampPositiveInt(input.capacity, 10);
  const refillTokens = clampPositiveInt(input.refillTokens, 1);
  const refillIntervalMs = clampPositiveInt(input.refillIntervalMs, 1000);
  const cost = Math.max(1, clampPositiveInt(input.cost ?? 1, 1));

  const bucket = TOKEN_BUCKETS.get(input.key) ?? {
    tokens: capacity,
    lastRefillAt: ts,
  };

  const elapsedMs = Math.max(0, ts - bucket.lastRefillAt);
  if (elapsedMs > 0) {
    const refillUnits = Math.floor(elapsedMs / refillIntervalMs);
    if (refillUnits > 0) {
      bucket.tokens = Math.min(capacity, bucket.tokens + refillUnits * refillTokens);
      bucket.lastRefillAt += refillUnits * refillIntervalMs;
    }
  }

  if (bucket.tokens < cost) {
    TOKEN_BUCKETS.set(input.key, bucket);
    const missing = cost - bucket.tokens;
    const intervalsUntilReady = Math.ceil(missing / refillTokens);
    return {
      allowed: false,
      remaining: Math.max(0, Math.floor(bucket.tokens)),
      retryAfterSeconds: Math.max(1, Math.ceil((intervalsUntilReady * refillIntervalMs) / 1000)),
    };
  }

  bucket.tokens -= cost;
  TOKEN_BUCKETS.set(input.key, bucket);
  return {
    allowed: true,
    remaining: Math.max(0, Math.floor(bucket.tokens)),
    retryAfterSeconds: Math.max(1, Math.ceil(refillIntervalMs / 1000)),
  };
}

export function consumeLeakyBucket(input: {
  key: string;
  capacity: number;
  leakRatePerSecond: number;
  cost?: number;
}) {
  const ts = nowMs();
  sweepMaps(ts);

  const capacity = clampPositiveInt(input.capacity, 20);
  const leakRatePerSecond = Math.max(0.1, Number(input.leakRatePerSecond) || 1);
  const cost = Math.max(1, clampPositiveInt(input.cost ?? 1, 1));

  const bucket = LEAKY_BUCKETS.get(input.key) ?? {
    level: 0,
    lastLeakAt: ts,
  };

  const elapsedSeconds = Math.max(0, (ts - bucket.lastLeakAt) / 1000);
  if (elapsedSeconds > 0) {
    bucket.level = Math.max(0, bucket.level - elapsedSeconds * leakRatePerSecond);
    bucket.lastLeakAt = ts;
  }

  if (bucket.level + cost > capacity) {
    LEAKY_BUCKETS.set(input.key, bucket);
    const overflow = bucket.level + cost - capacity;
    return {
      allowed: false,
      remaining: Math.max(0, Math.floor(capacity - bucket.level)),
      retryAfterSeconds: Math.max(1, Math.ceil(overflow / leakRatePerSecond)),
    };
  }

  bucket.level += cost;
  LEAKY_BUCKETS.set(input.key, bucket);
  return {
    allowed: true,
    remaining: Math.max(0, Math.floor(capacity - bucket.level)),
    retryAfterSeconds: 1,
  };
}

export function getClientIpFromHeaders(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown-ip';
}
