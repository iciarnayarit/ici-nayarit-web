'use client';
import { Button } from '@/app/components/ui/button';
import { MessageSquareHeart } from 'lucide-react';
import Image from 'next/image';

export default function RadioInvitation() {

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://icipdrgdl.com/`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <Image
        src="https://i.imgur.com/L21cWDK.jpeg" // Re-using image for now
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative container mx-auto px-4 md:px-6 text-center text-white z-20">
        <h2 className="text-3xl font-bold font-headline mb-4">Les invitamos a escuchar la radio y las predicaciones todos los días.</h2>
        <p className="text-lg mb-8">
          Los horarios programados de las predicaciones son: 7:00 a.m., 11:00 a.m., 3:00 p.m., 7:00 p.m. y 11:00 p.m. ¡Será de gran bendición para todos! 
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleWhatsAppClick} style={{ backgroundColor: 'purple', color: 'white' }}>
            <MessageSquareHeart className="mr-2 h-4 w-4" />
            Radio en Vivo
          </Button>
        </div>
      </div>
    </section>
  );
}
