import { Toaster } from '@/app/[locale]/components/ui/toaster';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from 'next';
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import '../globals.css';

export const metadata: Metadata = {
  title: 'ICIAR Nayarit',
  description: 'Somos una Iglesia Cristiana Interdenominacional comprometida con compartir el amor de Cristo en Nayarit.',
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

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
      <NextIntlClientProvider locale={locale} messages={messages}>
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
      </NextIntlClientProvider>
  );
}
