import { NextResponse } from 'next/server';
import { fetchDbpJson } from '@/lib/dbp-proxy';

type DbpBiblesResponse = {
  data?: Array<Record<string, unknown>>;
};

const TARGET_LANGUAGES = [
  { iso: 'hch', name: 'Huichol' },
  { iso: 'crn', name: 'Cora, El Nayar' },
  { iso: 'cok', name: 'Cora, Santa Teresa' },
  { iso: 'stp', name: 'Tepehuan de Durango' },
] as const;

export async function GET() {
  try {
    const groups = await Promise.all(
      TARGET_LANGUAGES.map(async lang => {
        const payload = await fetchDbpJson<DbpBiblesResponse>(['bibles'], {
          language_code: lang.iso,
          limit: 250,
        });
        const bibles = Array.isArray(payload?.data) ? payload.data : [];
        return {
          language: lang.name,
          iso: lang.iso,
          total: bibles.length,
          bibles,
        };
      })
    );

    return NextResponse.json({
      data: groups,
      meta: {
        requested_languages: TARGET_LANGUAGES.length,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[api/dbp/bibles/indigenous-mx]', error);
    return NextResponse.json(
      { error: 'No se pudo cargar la Biblia para los idiomas solicitados.' },
      { status: 502 }
    );
  }
}
