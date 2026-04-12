import { NextRequest, NextResponse } from 'next/server';

const LIBRE_TRANSLATE = 'https://libretranslate.de/translate';
const MAX_CHARS_PER_CHUNK = 1600;
const MYMEMORY_MAX = 450;
const MAX_SEGMENTS = 60;
const MAX_TOTAL_CHARS = 400_000;

const FETCH_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'ICIAR-Nayarit-Web/1.0 (translation)',
} as const;

type Body = {
  segments?: unknown;
  source?: string;
  target?: string;
};

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const v = JSON.parse(trimmed) as unknown;
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function translateViaLibre(chunk: string, source: string, target: string): Promise<string> {
  const res = await fetch(LIBRE_TRANSLATE, {
    method: 'POST',
    headers: FETCH_HEADERS,
    body: JSON.stringify({ q: chunk, source, target, format: 'text' }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`LibreTranslate ${res.status}: ${raw.slice(0, 160)}`);
  }
  const data = parseJsonObject(raw);
  const translated =
    data && typeof data.translatedText === 'string' ? data.translatedText.trim() : '';
  if (!translated) {
    throw new Error(
      `LibreTranslate: respuesta inválida (${raw.slice(0, 120).replace(/\s+/g, ' ')}…)`
    );
  }
  return translated;
}

async function translateViaMyMemory(slice: string, langpair: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(slice)}&langpair=${encodeURIComponent(langpair)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': FETCH_HEADERS['User-Agent'] },
  });
  const raw = await res.text();
  const data = parseJsonObject(raw);
  if (!data) {
    throw new Error(`MyMemory: no JSON (${raw.slice(0, 100)}…)`);
  }
  const status = data.responseStatus;
  const rd = data.responseData;
  const text =
    rd && typeof rd === 'object' && rd !== null && 'translatedText' in rd
      ? String((rd as { translatedText?: string }).translatedText ?? '')
      : '';
  if (status !== 200 || !text.trim()) {
    throw new Error(
      typeof data.responseDetails === 'string'
        ? data.responseDetails.slice(0, 200)
        : `MyMemory status ${String(status)}`
    );
  }
  return text.trim();
}

async function translateViaGoogle(text: string, source: string, target: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': FETCH_HEADERS['User-Agent'] },
  });
  if (!res.ok) throw new Error('Google HTTP error');
  const data = await res.json() as unknown;
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map((item: unknown) => (Array.isArray(item) ? String(item[0] ?? '') : '')).join('');
  }
  throw new Error('Google JSON error');
}

async function translateChunkWithFallback(
  text: string,
  source: string,
  target: string,
  langpair: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (source === target) return text;

  const parts: string[] = [];
  for (let i = 0; i < text.length; i += MAX_CHARS_PER_CHUNK) {
    const chunk = text.slice(i, i + MAX_CHARS_PER_CHUNK);
    let piece = '';

    try {
      piece = await translateViaGoogle(chunk, source, target);
    } catch {
      try {
        piece = await translateViaLibre(chunk, source, target);
      } catch {
        try {
          const memParts: string[] = [];
          for (let j = 0; j < chunk.length; j += MYMEMORY_MAX) {
            const slice = chunk.slice(j, j + MYMEMORY_MAX);
            memParts.push(await translateViaMyMemory(slice, langpair));
          }
          piece = memParts.join('');
        } catch {
          throw new Error('Lo sentimos mucho, los límites diarios de traducción se han agotado en nuestros servidores gratuitos. Por favor, intenta de nuevo más tarde.');
        }
      }
    }
    parts.push(piece);
  }
  return parts.join('');
}

async function translateSegmentsWithPool(
  segments: string[],
  source: string,
  target: string,
  langpair: string,
  concurrency: number
): Promise<string[]> {
  const results = new Array<string>(segments.length);
  let next = 0;

  async function worker() {
    while (true) {
      const idx = next++;
      if (idx >= segments.length) return;
      results[idx] = await translateChunkWithFallback(segments[idx], source, target, langpair);
    }
  }

  const n = Math.min(Math.max(1, concurrency), segments.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const { segments, source = 'en', target = 'es' } = body;

    if (!Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ error: 'Se requiere "segments" (array de textos).' }, { status: 400 });
    }
    if (segments.length > MAX_SEGMENTS) {
      return NextResponse.json({ error: 'Demasiados fragmentos.' }, { status: 400 });
    }
    if (!segments.every((s): s is string => typeof s === 'string')) {
      return NextResponse.json({ error: 'Cada segmento debe ser texto.' }, { status: 400 });
    }

    const total = segments.reduce((n, s) => n + s.length, 0);
    if (total > MAX_TOTAL_CHARS) {
      return NextResponse.json({ error: 'Texto demasiado largo.' }, { status: 400 });
    }

    if (typeof source !== 'string' || typeof target !== 'string' || source.length > 8 || target.length > 8) {
      return NextResponse.json({ error: 'Idiomas no válidos.' }, { status: 400 });
    }

    const langpair = `${source}|${target}`;
    const translations = await translateSegmentsWithPool(segments, source, target, langpair, 3);

    return NextResponse.json({ translations });
  } catch (e) {
    console.error('[translate]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Falló la traducción.' },
      { status: 502 }
    );
  }
}
