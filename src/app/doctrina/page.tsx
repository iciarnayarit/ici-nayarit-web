import React from 'react';
import type { Metadata } from 'next';
import DoctrinaClientPage from './DoctrinaClientPage';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';

export const metadata: Metadata = {
  title: 'Doctrina de la Iglesia - ICIAR Nayarit',
  description: 'Conoce los fundamentos de nuestra Fe.',
};

const DoctrinaPage = () => {
  return (
    <>
      <Header />
      <DoctrinaClientPage />
      <Footer />
    </>
  );
};

export default DoctrinaPage;
