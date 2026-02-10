import CenteredImage from '@/app/components/centered-image'; // Import the new component
import DailyVerse from '@/app/components/daily-verse';
import DownloadApp from '@/app/components/download-app';
import Footer from '@/app/components/footer';
import Header from '@/app/components/header';
import PrayerGroupInvitation from "@/app/components/prayer-group-invitation";
import ReadingPlans from '@/app/components/reading-plans';
import RadioInvitation from './components/radio-invitation';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <RadioInvitation />
        <ReadingPlans />
        <PrayerGroupInvitation />
        <DailyVerse />
        <DownloadApp />
        <CenteredImage imageUrl="https://i.imgur.com/ma3EXHG.png" altText="Wycliffe" />
      </main>
      <Footer />
    </div>
  );
}
