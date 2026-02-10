import Footer from '@/app/components/footer';
import Header from '@/app/components/header';

type Props = {
  children: React.ReactNode;
};

export default async function VideosLayout({children}: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
  );
}
