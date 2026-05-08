import { consumeTokenBucket, getClientIpFromHeaders } from '@/lib/rate-limit';

export { getClientIpFromHeaders };

export function consumeThrottleWindow(input: { key: string; limit: number; windowMs: number }) {
  return consumeTokenBucket({
    key: input.key,
    capacity: input.limit,
    refillTokens: input.limit,
    refillIntervalMs: input.windowMs,
    cost: 1,
  });
}
