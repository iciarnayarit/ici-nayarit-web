import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AB_COOKIE_NAME = 'iciar_ab_landing_v1';
const REGION_COOKIE_NAME = 'iciar_geo_region_v1';
const REGION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días
const AB_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 días

type LandingBucket = 'a' | 'b';

function assignLandingBucket(req: NextRequest): LandingBucket {
  const existing = req.cookies.get(AB_COOKIE_NAME)?.value;
  if (existing === 'a' || existing === 'b') return existing;
  return Math.random() < 0.5 ? 'a' : 'b';
}

function detectGeo(req: NextRequest) {
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const region = (req.headers.get('x-vercel-ip-country-region') || '').toUpperCase();
  const city = (req.headers.get('x-vercel-ip-city') || '').toLowerCase();
  const regionLabel = (req.headers.get('x-vercel-ip-country-region-name') || '').toUpperCase();

  const isMexico = country === 'MX';
  const isNayarit =
    isMexico &&
    (region === 'NAY' ||
      region === '18' ||
      regionLabel.includes('NAYARIT') ||
      city.includes('tepic') ||
      city.includes('bahia de banderas'));

  const normalizedRegion = isNayarit ? 'mx-nayarit' : isMexico ? 'mx-other' : 'global';
  return { country, region, city, isNayarit, normalizedRegion };
}

function buildNextWithContext(req: NextRequest, bucket: LandingBucket, normalizedRegion: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-iciar-ab-landing', bucket);
  requestHeaders.set('x-iciar-geo-region', normalizedRegion);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export default clerkMiddleware((auth, req) => {
  const bucket = assignLandingBucket(req);
  const geo = detectGeo(req);

  // Geofencing temprano: ruta local para audiencia de Nayarit.
  if (req.nextUrl.pathname === '/church' && geo.isNayarit) {
    const url = req.nextUrl.clone();
    url.pathname = '/templos';
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(AB_COOKIE_NAME, bucket, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: AB_COOKIE_MAX_AGE_SECONDS,
    });
    redirect.cookies.set(REGION_COOKIE_NAME, geo.normalizedRegion, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: REGION_COOKIE_MAX_AGE_SECONDS,
    });
    redirect.headers.set('x-iciar-ab-landing', bucket);
    redirect.headers.set('x-iciar-geo-region', geo.normalizedRegion);
    return redirect;
  }

  const res = buildNextWithContext(req, bucket, geo.normalizedRegion);
  res.cookies.set(AB_COOKIE_NAME, bucket, {
    httpOnly: false,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: AB_COOKIE_MAX_AGE_SECONDS,
  });
  res.cookies.set(REGION_COOKIE_NAME, geo.normalizedRegion, {
    httpOnly: false,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: REGION_COOKIE_MAX_AGE_SECONDS,
  });
  res.headers.set('x-iciar-ab-landing', bucket);
  res.headers.set('x-iciar-geo-region', geo.normalizedRegion);
  return res;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
