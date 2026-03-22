import Footer from '@/app/components/footer';

type Props = {
  children: React.ReactNode;
};

export default async function RadioLayout({children}: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
  );
}
