import { NextRequest } from 'next/server';
import { proxyDbpGet } from '@/lib/dbp-proxy';

export async function GET(req: NextRequest) {
  return proxyDbpGet(req, ['bibles']);
}
