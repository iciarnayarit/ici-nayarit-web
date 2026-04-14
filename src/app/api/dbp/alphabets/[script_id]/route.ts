import { NextRequest } from 'next/server';
import { proxyDbpGet } from '@/lib/dbp-proxy';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ script_id: string }> }
) {
  const { script_id } = await context.params;
  return proxyDbpGet(req, ['alphabets', script_id]);
}
