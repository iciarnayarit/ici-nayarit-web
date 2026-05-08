import React from 'react';
import type { Metadata } from 'next';
import DoctrinaClientPage from './DoctrinaClientPage';
import Footer from '@/app/components/footer';
import EngagementPageTracker from '@/app/components/engagement-page-tracker';

export const metadata: Metadata = {
  title: 'Doctrina de la Iglesia - ICIAR Nayarit',
  description: 'Conoce los fundamentos de nuestra Fe.',
};

const DoctrinaPage = () => {
  return (
    <>
      <EngagementPageTracker dedupeKey="doctrina-read" />
      <DoctrinaClientPage />
      <Footer />
    </>
  );
};

export default DoctrinaPage;
