'use client';
import { Button } from '@/app/[locale]/components/ui/button';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function PrayerGroupInvitation() {
  const t = useTranslations('PrayerGroupInvitation');

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://chat.whatsapp.com/IILR1rvNCw03bOg7xjWw7b`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <Image
        src="https://i.imgur.com/21A3dqQ.png" // Re-using image for now
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative container mx-auto px-4 md:px-6 text-center text-white z-20">
        <h2 className="text-3xl font-bold font-headline mb-4">{t('title')}</h2>
        <p className="text-lg mb-8">
          {t('description')}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleWhatsAppClick} style={{ backgroundColor: 'purple', color: 'white' }}>
            <MessageCircle className="mr-2 h-4 w-4" />
            {t('whatsapp_button')}
          </Button>
        </div>
      </div>
    </section>
  );
}
