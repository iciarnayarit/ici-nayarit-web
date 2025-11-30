import { locales } from '../i18n';
import createMiddleware from 'next-intl/middleware';

export const middleware = createMiddleware({
  locales,
  defaultLocale: 'es'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};