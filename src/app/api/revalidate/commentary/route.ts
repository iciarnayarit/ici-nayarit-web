import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildCommentaryRevalidateTags } from '@/lib/helloao-commentaries';

const payloadSchema = z
  .object({
    commentaryId: z.string().trim().min(1).max(120),
    book: z.string().trim().min(2).max(10).optional(),
    chapter: z.number().int().min(1).max(500).optional(),
    includeCatalogTag: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    const hasBook = typeof value.book === 'string';
    const hasChapter = typeof value.chapter === 'number';
    if (hasChapter && !hasBook) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Si envías chapter, también debes enviar book.',
        path: ['book'],
      });
    }
  });

function parseBooleanLike(value: string | null): boolean | undefined {
  if (value == null) return undefined;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return undefined;
}

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

    const url = new URL(req.url);

    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      // Permite llamadas sin body cuando usan query string.
      body = {};
    }

    const fromBody = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    const mergedPayload = {
      commentaryId:
        url.searchParams.get('commentaryId')?.trim() ||
        url.searchParams.get('id')?.trim() ||
        (typeof fromBody.commentaryId === 'string' ? fromBody.commentaryId : undefined),
      book:
        url.searchParams.get('book')?.trim() ||
        url.searchParams.get('bookUsfm')?.trim() ||
        (typeof fromBody.book === 'string' ? fromBody.book : undefined),
      chapter:
        (() => {
          const queryChapter = url.searchParams.get('chapter');
          if (queryChapter != null && queryChapter.trim() !== '') {
            const parsedChapter = Number(queryChapter);
            return Number.isFinite(parsedChapter) ? parsedChapter : queryChapter;
          }
          return fromBody.chapter;
        })(),
      includeCatalogTag:
        parseBooleanLike(url.searchParams.get('includeCatalogTag')) ??
        (typeof fromBody.includeCatalogTag === 'boolean' ? fromBody.includeCatalogTag : undefined),
    };

    const parsed = payloadSchema.safeParse(mergedPayload);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Payload inválido.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const tags = buildCommentaryRevalidateTags({
      commentaryId: parsed.data.commentaryId,
      bookUsfm: parsed.data.book,
      chapterNumber: parsed.data.chapter,
      includeCatalogTag: parsed.data.includeCatalogTag === true,
    });

    for (const tag of tags) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      ok: true,
      revalidated: tags.length,
      tags,
      input: {
        commentaryId: parsed.data.commentaryId,
        book: parsed.data.book ?? null,
        chapter: parsed.data.chapter ?? null,
        includeCatalogTag: parsed.data.includeCatalogTag === true,
      },
    });
  } catch (error) {
    console.error('[api/revalidate/commentary POST]', error);
    return NextResponse.json({ ok: false, error: 'No se pudo revalidar caché de comentarios.' }, { status: 500 });
  }
}

