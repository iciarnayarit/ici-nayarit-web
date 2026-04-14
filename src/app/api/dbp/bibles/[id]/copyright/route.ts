import { NextRequest } from 'next/server';
import { proxyDbpGet } from '@/lib/dbp-proxy';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyDbpGet(req, ['bibles', id, 'copyright']);
}
