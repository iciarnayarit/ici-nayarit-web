import Header from '@/components/header';
import Footer from '@/components/footer';
import DailyVerse from '@/components/daily-verse';
import DownloadApp from '@/components/download-app';
import ReadingPlans from '@/components/reading-plans';
import RegisterInvitation from '@/components/register-invitation';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <DailyVerse />
          <RegisterInvitation />
        <ReadingPlans />
        <DownloadApp />
      </main>
      <Footer />
    </div>
  );
}
