'use client';

import { Suspense } from 'react';
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
import NextImage from 'next/image';

export default function Page() {
  return (
    <main className="flex-1">
      <RadioInvitation />
      <DailyVerse />
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Bible />
      </Suspense>
      <DownloadApp />
      <section className="w-full bg-white py-12 md:py-24 lg:py-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 sm:px-6">
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Partners</p>
        <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-8">
          {
            /**
            <a href="https://www.faithcomesbyhearing.com/" target="_blank" rel="noopener noreferrer">
            <NextImage
              src="https://i.imgur.com/2zDkgqq.png"
              alt="Wycliffe"
              width={220}
              height={120}
              className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
            />
          </a>
             */
          }
          <a href="https://www.iciar.app" target="_blank" rel="noopener noreferrer">
            <NextImage
              src="https://i.imgur.com/iVQq3Zg.jpeg"
              alt="ICIAR"
              width={220}
              height={120}
              className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
            />
          </a>
          <a href="https://www.iciarpacifico.com/" target="_blank" rel="noopener noreferrer">
            <NextImage
              src="https://i.imgur.com/rPl7VI5.png"
              alt="ICIAR Pacifico Norte"
              width={220}
              height={120}
              className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
            />
          </a>
          <a href="https://icipdrgdl.com/" target="_blank" rel="noopener noreferrer">
            <NextImage
              src="https://i.imgur.com/Q06gpuP.png"
              alt="PDR Radio"
              width={220}
              height={120}
              className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
            />
          </a>
          <a
            href="https://www.scriptureearth.org/00spa.php?idx=60&language=Huichol&iso_code=hch"
            target="_blank"
            rel="noopener noreferrer"
          >
            <NextImage
              src="https://i.imgur.com/1W1jQw3.png"
              alt="Scripture Earth Huichol"
              width={220}
              height={120}
              className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
            />
          </a>
        </div>
        </div>
      </section>
      <PrayerGroupInvitation />
      <Footer />
    </main>
  );
}
