import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { listChurchOptionsForMemberForm } from '@/lib/member-churches';
import { fuzzySimilarity, normalizeSearchText } from '@/lib/fuzzy-search';

/** Templos para el formulario de miembros (colección `churches`). */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    const churches = await listChurchOptionsForMemberForm();
    const url = new URL(req.url);
    const qRaw = url.searchParams.get('q') ?? '';
    const q = normalizeSearchText(qRaw);

    const result = !q
      ? churches
      : churches
          .map((church) => {
            const label = normalizeSearchText(church.label);
            const municipality = normalizeSearchText(church.municipality ?? '');
            const addressLine = normalizeSearchText(church.addressLine ?? '');
            const bestScore = Math.max(
              fuzzySimilarity(label, q),
              fuzzySimilarity(municipality, q),
              fuzzySimilarity(addressLine, q),
              label.includes(q) ? 0.95 : 0
            );
            return { church, score: bestScore };
          })
          .filter((row) => row.score >= 0.72)
          .sort((a, b) => b.score - a.score)
          .map((row) => row.church);
    return NextResponse.json({ churches: result });
  } catch (err) {
    console.error('[api/churches GET]', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    if (message.includes('STORAGE_MONGODB_URI')) {
      return NextResponse.json(
        { error: 'La base de datos no está configurada en el servidor.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'No se pudieron cargar los templos.' }, { status: 500 });
  }
}
