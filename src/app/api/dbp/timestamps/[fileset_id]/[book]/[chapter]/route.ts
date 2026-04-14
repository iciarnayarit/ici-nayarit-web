import { NextRequest } from 'next/server';
import { proxyDbpGet } from '@/lib/dbp-proxy';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ fileset_id: string; book: string; chapter: string }> }
) {
  const { fileset_id, book, chapter } = await context.params;
  return proxyDbpGet(req, ['timestamps', fileset_id, book, chapter]);
}
