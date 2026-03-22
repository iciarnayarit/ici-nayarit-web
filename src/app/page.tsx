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
import Footer from './components/footer';

export default function Page() {
  return (
    <main className="flex-1">
      <RadioInvitation />
      <DailyVerse />
      <Bible />
      <PrayerGroupInvitation />
      <ReadingPlans />
      <DownloadApp />
      <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center items-center bg-white">
        <div className="flex items-center justify-center gap-8">
          <a href="https://www.iciar.app" target="_blank" rel="noopener noreferrer"><img src="https://i.imgur.com/qdJZ8ei.png" alt="Wycliffe" className="h-24 w-auto object-contain hover:opacity-80 transition-opacity" /></a>
          <a href="https://www.iciar.app" target="_blank" rel="noopener noreferrer"><img src="https://i.imgur.com/iVQq3Zg.jpeg" alt="ICIAR" className="h-24 w-auto object-contain hover:opacity-80 transition-opacity" /></a>
          <a href="https://www.iciarpacifico.com/" target="_blank" rel="noopener noreferrer"><img src="https://i.imgur.com/rPl7VI5.png" alt="ICIAR Pacifico Norte" className="h-24 w-auto object-contain hover:opacity-80 transition-opacity" /></a>
          <a href="https://icipdrgdl.com/" target="_blank" rel="noopener noreferrer"><img src="https://i.imgur.com/Q06gpuP.png" alt="PDR Radio" className="h-24 w-auto object-contain hover:opacity-80 transition-opacity" /></a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
