import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const payloadSchema = z.object({
  tags: z.array(z.string().trim().min(1).max(180)).min(1).max(50),
});

function hasValidSecret(req: Request): boolean {
  const expected = process.env.REVALIDATE_SECRET?.trim();
  if (!expected) return false;
  const headerSecret = req.headers.get('x-revalidate-secret')?.trim();
  return headerSecret === expected;
}

export async function POST(req: Request) {
  try {
    if (!hasValidSecret(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
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

    const uniqueTags = [...new Set(parsed.data.tags)];
    for (const tag of uniqueTags) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      ok: true,
      revalidated: uniqueTags.length,
      tags: uniqueTags,
    });
  } catch (error) {
    console.error('[api/revalidate POST]', error);
    return NextResponse.json({ ok: false, error: 'No se pudo revalidar caché.' }, { status: 500 });
  }
}

