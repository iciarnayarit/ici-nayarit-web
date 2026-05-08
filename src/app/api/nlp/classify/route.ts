import { NextResponse } from 'next/server';
import { z } from 'zod';
import { classifyReflectionText } from '@/lib/nlp-classifier';
import { consumeTokenBucket, getClientIpFromHeaders } from '@/lib/rate-limit';
import { logRateLimitHit } from '@/lib/rate-limit-telemetry';
import { buildRateLimit429Headers, buildRateLimitPolicy } from '@/lib/rate-limit-headers';

const payloadSchema = z.object({
  title: z.string().trim().max(240).optional(),
  body: z.string().trim().min(1).max(15_000),
  maxTags: z.number().int().min(1).max(8).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const policy = buildRateLimitPolicy({
      kind: 'token-bucket',
      capacity: 40,
      refillTokens: 1,
      refillIntervalMs: 1500,
    });
    const rate = consumeTokenBucket({
      key: `api:nlp-classify:${ip}`,
      capacity: 40,
      refillTokens: 1,
      refillIntervalMs: 1500,
    });
    if (!rate.allowed) {
      logRateLimitHit({
        endpoint: '/api/nlp/classify',
        key: ip,
        retryAfterSeconds: rate.retryAfterSeconds,
        meta: {
          policy,
          remaining: rate.remaining,
        },
      });
      return NextResponse.json(
        { ok: false, error: 'Demasiadas solicitudes de clasificación. Intenta de nuevo en unos segundos.' },
        {
          status: 429,
          headers: buildRateLimit429Headers({
            retryAfterSeconds: rate.retryAfterSeconds,
            remaining: rate.remaining,
            policy,
          }),
        }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
    }
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 });
    }

    const classification = classifyReflectionText(parsed.data);
    return NextResponse.json({ ok: true, classification });
  } catch (error) {
    console.error('[api/nlp/classify POST]', error);
    return NextResponse.json({ ok: false, error: 'No se pudo clasificar el texto.' }, { status: 500 });
  }
}
