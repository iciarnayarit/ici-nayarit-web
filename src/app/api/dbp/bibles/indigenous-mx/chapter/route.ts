import { NextRequest, NextResponse } from 'next/server';
import { fetchDbpJson } from '@/lib/dbp-proxy';

type DbpBiblesResponse = {
  data?: Array<{
    filesets?: Record<
      string,
      Array<{
        id?: string;
        type?: string;
      }>
    >;
  }>;
};

type DbpFilesetChapterResponse = {
  data?: Array<{
    path?: string;
  }>;
};

type SofriaNode = string | { type?: string; subtype?: string; atts?: Record<string, string>; content?: SofriaNode[] };

const SUPPORTED_ISOS = new Set(['hch', 'crn', 'cok', 'stp']);

function textFromNode(node: SofriaNode): string {
  if (typeof node === 'string') return node;
  const content = Array.isArray(node.content) ? node.content : [];
  return content.map(textFromNode).join('');
}

function collectVerses(node: SofriaNode, bucket: Map<number, string>) {
  if (typeof node === 'string') return;

  const subtype = node.subtype ?? '';
  if (subtype === 'verses') {
    const verseNo = Number.parseInt(node.atts?.number ?? '', 10);
    if (Number.isFinite(verseNo)) {
      const text = textFromNode(node).replace(/\s+/g, ' ').trim();
      if (text) {
        const prev = bucket.get(verseNo) ?? '';
        bucket.set(verseNo, prev ? `${prev} ${text}`.trim() : text);
      }
    }
  }

  const content = Array.isArray(node.content) ? node.content : [];
  for (const child of content) {
    collectVerses(child, bucket);
  }
}

function extractSofriaVerses(document: unknown): Array<{ verse: number; text: string }> {
  const doc = document as { sequence?: { blocks?: SofriaNode[] } };
  const blocks = Array.isArray(doc?.sequence?.blocks) ? doc.sequence.blocks : [];
  const verses = new Map<number, string>();
  for (const block of blocks) {
    collectVerses(block, verses);
  }
  return [...verses.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([verse, text]) => ({ verse, text }));
}

function pickTextJsonFilesetId(payload: DbpBiblesResponse): string | null {
  const bibles = Array.isArray(payload?.data) ? payload.data : [];
  for (const bible of bibles) {
    const groups = bible.filesets ? Object.values(bible.filesets) : [];
    for (const filesets of groups) {
      const match = filesets.find(f => f?.type === 'text_json' && typeof f.id === 'string');
      if (match?.id) return match.id;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const iso = req.nextUrl.searchParams.get('iso')?.toLowerCase().trim() ?? '';
  const book = req.nextUrl.searchParams.get('book')?.toUpperCase().trim() ?? '';
  const chapter = Number.parseInt(req.nextUrl.searchParams.get('chapter') ?? '', 10);

  if (!SUPPORTED_ISOS.has(iso) || !book || !Number.isFinite(chapter) || chapter < 1) {
    return NextResponse.json(
      { error: 'Parámetros inválidos. Requiere iso, book y chapter.' },
      { status: 400 }
    );
  }

  try {
    const biblesPayload = await fetchDbpJson<DbpBiblesResponse>(['bibles'], {
      language_code: iso,
      limit: 250,
    });
    const filesetId = pickTextJsonFilesetId(biblesPayload);
    if (!filesetId) {
      return NextResponse.json({ data: { iso, bookId: book, chapter, verses: [] } });
    }

    const chapterPayload = await fetchDbpJson<DbpFilesetChapterResponse>(
      ['bibles', 'filesets', filesetId, book, String(chapter)]
    );
    const sourcePath = chapterPayload?.data?.[0]?.path;
    if (!sourcePath) {
      return NextResponse.json({ data: { iso, filesetId, bookId: book, chapter, verses: [] } });
    }

    const sourceRes = await fetch(sourcePath, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!sourceRes.ok) {
      return NextResponse.json({ data: { iso, filesetId, bookId: book, chapter, verses: [] } });
    }

    const sourceJson = (await sourceRes.json()) as unknown;
    const verses = extractSofriaVerses(sourceJson);

    return NextResponse.json({
      data: {
        iso,
        filesetId,
        bookId: book,
        chapter,
        verses,
      },
    });
  } catch (error) {
    console.error('[api/dbp/bibles/indigenous-mx/chapter]', error);
    return NextResponse.json(
      { error: 'No se pudo cargar el capítulo solicitado.' },
      { status: 502 }
    );
  }
}
