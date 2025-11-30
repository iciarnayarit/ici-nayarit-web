import Header from '@/app/[locale]/components/header';
import Footer from '@/app/[locale]/components/footer';
import DailyVerse from '@/app/[locale]/components/daily-verse';
import DownloadApp from '@/app/[locale]/components/download-app';
import ReadingPlans from '@/app/[locale]/components/reading-plans';
import PrayerGroupInvitation from "@/app/[locale]/components/prayer-group-invitation";
import CenteredImage from '@/app/[locale]/components/centered-image'; // Import the new component

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <DailyVerse />
        <PrayerGroupInvitation />
        <ReadingPlans />
        <DownloadApp />
        <CenteredImage imageUrl="https://i.imgur.com/ma3EXHG.png" altText="Wycliffe" />
      </main>
      <Footer />
    </div>
  );
}
