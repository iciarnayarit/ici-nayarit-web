import { Toaster } from '@/app/components/ui/toaster';
import { esES } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Alegreya, PT_Sans } from 'next/font/google';
import Header from './components/header';
import { AudioProvider } from './context/AudioContext';
import './globals.css';

type Props = {
  children: React.ReactNode;
};

const bodyFont = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-body',
});

const headlineFont = Alegreya({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'ICIAR Nayarit',
  description: 'Somos una Iglesia Cristiana Interdenominacional comprometida con compartir el amor de Cristo en Nayarit.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  keywords: [
    'Cristianismo',
    'ICIAR Iglesia Central - Portales',
    'Doctrina',
    'Himno',
    'Logotipo',
    'Himnario',
    'Dios',
    'Oración',
    'Escuela dominical',
    'Iglesia',
    'Vida',
    'Biblia',
    'Himnario ICIAR',
    'Rector',
    'RISING',
    'iglesia iciar',
    'iciar portales',
    'tabernáculo la mansión iciar',
    'puntos doctrinales iciar',
    'ici makis',
    'ici hot',
    'ici puebla',
    'ici radio canada',
    'ici tou tv',
    'ici rdi',
    'ici tout tv',
    'bryan adams ma place est ici',
    'ici première',
    'cici',
    'ici tele',
    'ici rdi en direct',
    'ici télé',
    'ici tout.tv',
  ],
};

export default async function RootLayout({ children }: Props) {
  return (
    <ClerkProvider
      localization={esES}
      signInForceRedirectUrl="/dashboard/miembros"
      signUpForceRedirectUrl="/dashboard/miembros"
    >
      <html lang="es" className="scroll-smooth" suppressHydrationWarning>
        <body className={`${bodyFont.variable} ${headlineFont.variable} font-body antialiased`} suppressHydrationWarning>
          <AudioProvider>
            <Header />
            {children}
            <Toaster />
            <SpeedInsights />
            <Analytics />
          </AudioProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
