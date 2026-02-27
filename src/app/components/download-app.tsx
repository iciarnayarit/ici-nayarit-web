'use client';
import { AppleIcon, GooglePlayIcon } from '@/app/components/icons';
import { Button } from '@/app/components/ui/button';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import Image from 'next/image';

export default function DownloadApp() {
  const bgImage = PlaceHolderImages.find(p => p.id === 'download-bg');

  return (
    <section id="download" className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
      <div className="relative container mx-auto px-4 md:px-6 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white mb-2">
            Lee, Escucha y Ora en Cualquier Lugar
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Lleva la Biblia contigo a donde vayas. Descarga la aplicación gratis.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" className="bg-[#B88A44] hover:bg-[#a07939] text-white font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm w-full sm:w-auto" disabled>
              <AppleIcon className="mr-2 h-6 w-6" />
              Descargar en la App Store
            </Button>
            <Button size="lg" className="bg-[#B88A44] hover:bg-[#a07939] text-white font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm w-full sm:w-auto" disabled>
              <GooglePlayIcon className="mr-2 h-6 w-6" />
              Consíguelo en Google Play
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
