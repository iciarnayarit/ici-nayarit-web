'use client';

import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { MessageSquareHeart } from 'lucide-react';
import Image from 'next/image';
import {
  trackLandingVariantCtaClick,
  type LandingBucket,
} from '@/lib/landing-analytics';

type Props = {
  heroText?: string;
  titleText?: string;
  ctaLabel?: string;
  /** Si viene de la home con A/B, registra clics para CTR por variante. */
  landingBucket?: LandingBucket;
};

export default function RadioInvitation({
  heroText = 'Sintoniza nuestra radio en vivo y edifícate con las predicaciones diarias.',
  titleText = '¡Conéctate ahora!',
  ctaLabel = 'Radio en Vivo',
  landingBucket,
}: Props) {

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <Image
        src="https://i.imgur.com/L21cWDK.jpeg" // Re-using image for now
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-gray-900/60 z-10"></div>
      <div className="relative container mx-auto px-4 md:px-6 text-center text-white z-20">
        <h2 className="font-display text-4xl font-bold text-white mb-2">{heroText}</h2>
        <h1 className="font-display text-4xl font-bold text-[#E5C573] mb-4 italic">{titleText}</h1>
        <p className="text-lg mb-8 text-gray-300">
        Horario de Predicaciones <br />
        </p>
        <ul className="text-gray-300">
          <li>Mañana: 07:00 a.m. | 11:00 a.m.</li>
          <li>Tarde: 03:00 p.m. | 07:00 p.m.</li>
          <li>Noche: 11:00 p.m.</li>
        </ul><br />
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-[#B88A44] hover:bg-[#a07939] text-white font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm">
            <Link
              href="/radio"
              onClick={() => {
                if (landingBucket) {
                  trackLandingVariantCtaClick(landingBucket, ctaLabel);
                }
              }}
            >
              <MessageSquareHeart className="mr-2 h-4 w-4" />
              {ctaLabel}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
