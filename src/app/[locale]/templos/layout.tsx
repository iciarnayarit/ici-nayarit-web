import Header from '@/app/[locale]/components/header';
import Footer from '@/app/[locale]/components/footer';

export default function TemplosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">{children}</main>
      <Footer />
    </div>
  );
}
