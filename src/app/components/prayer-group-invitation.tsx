'use client';
import { Button } from '@/app/components/ui/button';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';

export default function PrayerGroupInvitation() {

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
      <div className="absolute inset-0 bg-gray-900/60 z-10"></div>
      <div className="relative container mx-auto px-4 md:px-6 text-center text-white z-20">
        <h2 className="font-display text-4xl font-bold text-white mb-2">Únete a nuestro Grupo de Oración y Lectura Bíblica</h2>
        <p className="text-lg mb-8 text-gray-300">
          Te invitamos a unirte a nuestro grupo de oración y lectura de la Biblia, de lunes a sábado de 5:30 a.m. a 6:00 a.m. ¡Comienza tu día con fe y comunidad!
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleWhatsAppClick} className="bg-[#B88A44] hover:bg-[#a07939] text-white font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
