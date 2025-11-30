import Bible from '@/app/[locale]/components/bible';
import ReadingPlans from '@/app/[locale]/components/reading-plans';
import DailyVerse from '@/app/[locale]/components/daily-verse';

export default function BibliaPage() {
  return (
    <>
      <Bible />
      <DailyVerse />
      <ReadingPlans />
    </>
  );
}
