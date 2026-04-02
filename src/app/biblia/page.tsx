import { Suspense } from 'react';
import Bible from '@/app/components/bible';
import DailyVerse from '@/app/components/daily-verse';
import ReadingPlans from '@/app/components/reading-plans';

export default function BibliaPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Cargando Biblia…</div>}>
        <Bible />
      </Suspense>
      <DailyVerse />
      <ReadingPlans />
    </>
  );
}
