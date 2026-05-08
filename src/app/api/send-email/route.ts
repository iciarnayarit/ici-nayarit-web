import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { consumeTokenBucket, getClientIpFromHeaders } from '@/lib/rate-limit';
import { logRateLimitHit } from '@/lib/rate-limit-telemetry';
import { buildRateLimit429Headers, buildRateLimitPolicy } from '@/lib/rate-limit-headers';
//import { Resend } from 'resend';

//const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const payloadSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(320),
    message: z.string().trim().min(10).max(4000),
  });

  try {
    const ip = getClientIpFromHeaders(req.headers);
    const policy = buildRateLimitPolicy({
      kind: 'token-bucket',
      capacity: 5,
      refillTokens: 1,
      refillIntervalMs: 20_000,
    });
    const rate = consumeTokenBucket({
      key: `api:send-email:${ip}`,
      capacity: 5,
      refillTokens: 1,
      refillIntervalMs: 20_000,
    });
    if (!rate.allowed) {
      logRateLimitHit({
        endpoint: '/api/send-email',
        key: ip,
        retryAfterSeconds: rate.retryAfterSeconds,
        meta: {
          policy,
          remaining: rate.remaining,
        },
      });
      return NextResponse.json(
        { ok: false, error: 'Demasiados intentos de envío. Intenta de nuevo en unos segundos.' },
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

    // Endpoint seguro y validado; integrar proveedor de email cuando se habilite RESEND_API_KEY.
    return NextResponse.json({
      ok: true,
      message: 'Solicitud recibida correctamente.',
      queued: true,
      preview: {
        name: parsed.data.name,
        email: parsed.data.email,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Ocurrió un error al procesar la solicitud.' }, { status: 500 });
  }
}
