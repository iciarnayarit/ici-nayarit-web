import { NextRequest, NextResponse } from 'next/server';
import { proxyDbpGet } from '@/lib/dbp-proxy';

type DbpAlphabetItem = {
  name: string;
  script: string;
  family: string;
  type: string;
  direction: string;
};

type DbpAlphabetResponse = {
  data?: DbpAlphabetItem[];
};

/**
 * Endpoint dedicado para listar alfabetos de DBP.
 * Retorna una forma estable: { data: DbpAlphabetItem[] }.
 */
export async function GET(req: NextRequest) {
  const upstreamRes = await proxyDbpGet(req, ['alphabets']);

  if (!upstreamRes.ok) return upstreamRes;

  try {
    const payload = (await upstreamRes.json()) as DbpAlphabetResponse;
    const data = Array.isArray(payload?.data)
      ? payload.data.map(item => ({
          name: item?.name ?? '',
          script: item?.script ?? '',
          family: item?.family ?? '',
          type: item?.type ?? '',
          direction: item?.direction ?? '',
        }))
      : [];

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[api/dbp/alphabets] Respuesta inválida', error);
    return NextResponse.json(
      { error: 'Respuesta inválida del servicio DBP.' },
      { status: 502 }
    );
  }
}
