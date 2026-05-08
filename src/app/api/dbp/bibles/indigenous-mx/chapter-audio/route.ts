import { NextRequest, NextResponse } from 'next/server';
import { buildDbpCircuitHeader, fetchDbpJson } from '@/lib/dbp-proxy';

type DbpBiblesResponse = {
  data?: Array<{
    id?: string | number;
    name?: string;
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
    duration?: number;
  }>;
};

const SUPPORTED_ISOS = new Set(['hch']);

/** Preferencia: MP3 u otros archivos directos antes que HLS. */
const AUDIO_FILESET_TYPES = ['audio', 'audio_drama', 'audio_stream', 'audio_drama_stream'] as const;

function pickAudioFilesetId(payload: DbpBiblesResponse): string | null {
  const bibles = Array.isArray(payload?.data) ? payload.data : [];
  for (const type of AUDIO_FILESET_TYPES) {
    for (const bible of bibles) {
      const groups = bible.filesets ? Object.values(bible.filesets) : [];
      for (const filesets of groups) {
        const match = filesets.find((f) => f?.type === type && typeof f.id === 'string');
        if (match?.id) return match.id;
      }
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const circuitStateHeader = buildDbpCircuitHeader();
  const iso = req.nextUrl.searchParams.get('iso')?.toLowerCase().trim() ?? '';
  const book = req.nextUrl.searchParams.get('book')?.toUpperCase().trim() ?? '';
  const chapter = Number.parseInt(req.nextUrl.searchParams.get('chapter') ?? '', 10);

  if (!SUPPORTED_ISOS.has(iso) || !book || !Number.isFinite(chapter) || chapter < 1) {
    return NextResponse.json(
      { error: 'Parámetros inválidos. Requiere iso=hch, book (USFM) y chapter.' },
      { status: 400, headers: { 'X-Circuit-State': circuitStateHeader } }
    );
  }

  try {
    const biblesPayload = await fetchDbpJson<DbpBiblesResponse>(['bibles'], {
      language_code: iso,
      limit: 250,
    });
    const filesetId = pickAudioFilesetId(biblesPayload);
    if (!filesetId) {
      return NextResponse.json(
        { data: { audioUrl: null as string | null, filesetId: null, message: 'Sin fileset de audio' } },
        { headers: { 'X-Circuit-State': circuitStateHeader } }
      );
    }

    const chapterPayload = await fetchDbpJson<DbpFilesetChapterResponse>(
      ['bibles', 'filesets', filesetId, book, String(chapter)]
    );
    const row = chapterPayload?.data?.[0];
    const audioUrl = typeof row?.path === 'string' && row.path.trim() ? row.path.trim() : null;

    return NextResponse.json({
      data: {
        audioUrl,
        filesetId,
        bookId: book,
        chapter,
        duration: typeof row?.duration === 'number' ? row.duration : undefined,
      },
    }, {
      headers: { 'X-Circuit-State': circuitStateHeader },
    });
  } catch (error) {
    console.error('[api/dbp/bibles/indigenous-mx/chapter-audio]', error);
    return NextResponse.json(
      { error: 'No se pudo obtener el audio del capítulo.' },
      { status: 502, headers: { 'X-Circuit-State': circuitStateHeader } }
    );
  }
}
