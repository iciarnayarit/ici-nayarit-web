import { headers } from 'next/headers';
import HomeClient from '@/app/home-client';

type LandingBucket = 'a' | 'b';

function normalizeLandingBucket(input: string | null): LandingBucket {
  return input === 'b' ? 'b' : 'a';
}

export default async function Page() {
  const requestHeaders = await headers();
  const bucket = normalizeLandingBucket(requestHeaders.get('x-iciar-ab-landing'));
  return <HomeClient bucket={bucket} />;
}
