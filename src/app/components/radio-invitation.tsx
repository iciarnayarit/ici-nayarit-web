'use client';
import { Button } from '@/app/components/ui/button';
import { MessageSquareHeart } from 'lucide-react';
import Image from 'next/image';

export default function RadioInvitation() {

  const handleWhatsAppClick = () => {
    const whatsappUrl = `/radio`;
    window.location.href = whatsappUrl;
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
        <h2 className="text-3xl font-bold font-headline mb-4">Sintoniza nuestra radio en vivo y edifícate con las predicaciones diarias.</h2>
        <h1 className="text-3xl font-bold font-headline mb-4">¡Conéctate ahora!</h1>
        <p className="text-lg mb-8">
        Horario de Predicaciones <br />
        </p>
        <ul>
          <li>Mañana: 07:00 a.m. | 11:00 a.m.</li>
          <li>Tarde: 03:00 p.m. | 07:00 p.m.</li>
          <li>Noche: 11:00 p.m.</li>
        </ul><br />
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
