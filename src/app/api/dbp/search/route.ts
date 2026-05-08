import { NextRequest } from 'next/server';
import { proxyDbpGet } from '@/lib/dbp-proxy';
import { NextResponse } from 'next/server';
import { consumeTokenBucket, getClientIpFromHeaders } from '@/lib/rate-limit';
import { logRateLimitHit } from '@/lib/rate-limit-telemetry';
import { buildRateLimit429Headers, buildRateLimitPolicy } from '@/lib/rate-limit-headers';

export async function GET(req: NextRequest) {
  const ip = getClientIpFromHeaders(req.headers);
  const policy = buildRateLimitPolicy({
    kind: 'token-bucket',
    capacity: 20,
    refillTokens: 1,
    refillIntervalMs: 3000,
  });
  const throttle = consumeTokenBucket({
    key: `api:dbp-search:${ip}`,
    capacity: 20,
    refillTokens: 1,
    refillIntervalMs: 3000,
  });
  if (!throttle.allowed) {
    logRateLimitHit({
      endpoint: '/api/dbp/search',
      key: ip,
      retryAfterSeconds: throttle.retryAfterSeconds,
      meta: {
        policy,
        remaining: throttle.remaining,
      },
    });
    return NextResponse.json(
      { error: 'Demasiadas búsquedas seguidas. Espera un momento e intenta de nuevo.' },
      {
        status: 429,
        headers: buildRateLimit429Headers({
          retryAfterSeconds: throttle.retryAfterSeconds,
          remaining: throttle.remaining,
          policy,
        }),
      }
    );
  }
  return proxyDbpGet(req, ['search']);
}
