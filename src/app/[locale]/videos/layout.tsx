import Footer from '@/app/[locale]/components/footer';
import Header from '@/app/[locale]/components/header';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

export default async function VideosLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
   params: {locale: string};
}) {
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
