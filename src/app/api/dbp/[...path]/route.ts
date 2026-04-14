import { NextRequest, NextResponse } from 'next/server';
import { proxyDbpGet } from '@/lib/dbp-proxy';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.json(
      {
        error: 'Ruta DBP inválida.',
        usage: '/api/dbp/<endpoint>?... (ej. /api/dbp/languages?language_code=spa)',
      },
      { status: 400 }
    );
  }

  return proxyDbpGet(req, path);
}
