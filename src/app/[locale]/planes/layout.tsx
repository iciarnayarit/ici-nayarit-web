import Footer from '@/app/[locale]/components/footer';
import Header from '@/app/[locale]/components/header';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

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

export default async function PlanesLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </NextIntlClientProvider>
    </div>
  );
}
