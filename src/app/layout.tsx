
import { Toaster } from '@/app/components/ui/toaster';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from 'next';
import './globals.css';
import { AudioProvider } from './context/AudioContext';
 
type Props = {
  children: React.ReactNode;
};

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

export default async function RootLayout({children}: Props) {

  return (
      <html className="scroll-smooth">
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
          </head>
          <body className="font-body antialiased">
            <AudioProvider>
              {children}
            </AudioProvider>
            <Toaster />
            <SpeedInsights />
            <Analytics />
          </body>
        </html>
  );
}
