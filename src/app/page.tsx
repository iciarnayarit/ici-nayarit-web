'use client';

import Bible from '@/app/components/bible';
import CenteredImage from '@/app/components/centered-image';
import Contact from '@/app/components/contact-section';
import DailyVerse from '@/app/components/daily-verse';
import Definiciones from '@/app/components/definiciones-ici';
import DownloadApp from '@/app/components/download-app';
import PrayerGroupInvitation from '@/app/components/prayer-group-invitation';
import RadioInvitation from '@/app/components/radio-invitation';
import ReadingPlans from '@/app/components/reading-plans';
import RegisterInvitation from '@/app/components/register-invitation';
import TextBible from '@/app/components/text-bible';
import Header from './components/header';
import Footer from './components/footer';

export default function Page() {
  return (
    <main className="flex-1">
      <Header />
      <RadioInvitation />
      <DailyVerse />
      <Bible />
      <PrayerGroupInvitation />
      <ReadingPlans />
      <DownloadApp />
      <CenteredImage imageUrl="https://i.imgur.com/ma3EXHG.png" altText="Wycliffe" width={48} height={48} />
      <Footer />
    </main>
  );
}
