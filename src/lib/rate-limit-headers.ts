type RateLimitPolicyInput =
  | {
      kind: 'token-bucket';
      capacity: number;
      refillTokens: number;
      refillIntervalMs: number;
    }
  | {
      kind: 'leaky-bucket';
      capacity: number;
      leakRatePerSecond: number;
    };

export function buildRateLimitPolicy(input: RateLimitPolicyInput) {
  if (input.kind === 'token-bucket') {
    return `token-bucket; capacity=${input.capacity}; refill=${input.refillTokens}/${Math.max(
      1,
      Math.round(input.refillIntervalMs / 1000)
    )}s`;
  }
  return `leaky-bucket; capacity=${input.capacity}; leak=${input.leakRatePerSecond}/s`;
}

export function buildRateLimit429Headers(input: {
  remaining: number;
  retryAfterSeconds: number;
  policy: string;
}) {
  return {
    'Retry-After': String(Math.max(1, Math.floor(input.retryAfterSeconds))),
    'X-RateLimit-Remaining': String(Math.max(0, Math.floor(input.remaining))),
    'X-RateLimit-Policy': input.policy,
  };
}

