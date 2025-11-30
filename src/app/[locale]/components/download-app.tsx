'use client';
import Image from 'next/image';
import { AppleIcon, GooglePlayIcon } from '@/app/[locale]/components/icons';
import { PlaceHolderImages } from '@/app/[locale]/lib/placeholder-images';
import { Button } from '@/app/[locale]/components/ui/button';
import { useTranslations } from 'next-intl';

export default function DownloadApp() {
  const bgImage = PlaceHolderImages.find(p => p.id === 'download-bg');
  const t = useTranslations('DownloadApp');

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative container mx-auto px-4 md:px-6 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg md:text-xl">
            {t('description')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto" disabled>
              <AppleIcon className="mr-2 h-6 w-6" />
              {t('download_apple')}
            </Button>
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto" disabled>
              <GooglePlayIcon className="mr-2 h-6 w-6" />
              {t('download_google')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
