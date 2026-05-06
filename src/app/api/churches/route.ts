import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { listChurchOptionsForMemberForm } from '@/lib/member-churches';

/** Templos para el formulario de miembros (colección `churches`). */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    const churches = await listChurchOptionsForMemberForm();
    return NextResponse.json({ churches });
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
