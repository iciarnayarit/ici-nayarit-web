'use client';

import Bible from '@/app/components/bible';
import DailyVerse from '@/app/components/daily-verse';
import RadioInvitation from '@/app/components/radio-invitation';
import ReadingPlans from '@/app/components/reading-plans';
import Header from './components/header';
import Footer from './components/footer';
import ContactSection from '@/app/components/contact-section';

export default function Page() {
  return (
    <main className="flex-1">
      <Header />
      <RadioInvitation />
      <DailyVerse />
      <Bible />
      <ContactSection />
      <ReadingPlans />
      <Footer />
    </main>
  );
}
