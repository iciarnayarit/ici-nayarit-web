'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import RadioInvitation from '@/app/components/radio-invitation';
import NextImage from 'next/image';
import { IMAGE_BLUR_PLACEHOLDERS } from '@/lib/image-placeholders';
import {
  trackLandingVariantImpression,
  type LandingBucket,
} from '@/lib/landing-analytics';

const DailyVerse = dynamic(() => import('@/app/components/daily-verse'), {
  loading: () => <div className="min-h-[120px] animate-pulse bg-white" />,
});
const Bible = dynamic(() => import('@/app/components/bible'), {
  loading: () => <div className="min-h-[220px] animate-pulse bg-white" />,
});
const DownloadApp = dynamic(() => import('@/app/components/download-app'), {
  loading: () => <div className="min-h-[120px] animate-pulse bg-white" />,
});
const PrayerGroupInvitation = dynamic(() => import('@/app/components/prayer-group-invitation'), {
  loading: () => <div className="min-h-[120px] animate-pulse bg-white" />,
});
const Footer = dynamic(() => import('./components/footer'), {
  loading: () => <div className="min-h-[90px] animate-pulse bg-white" />,
});

function LazyOnView({
  children,
  fallback,
  rootMargin = '240px 0px',
}: {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setIsVisible(true);
          observer.disconnect();
          break;
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
}

const LANDING_COPY: Record<
  LandingBucket,
  { hero: string; title: string; cta: string }
> = {
  a: {
    hero: 'Sintoniza nuestra radio en vivo y edifícate con las predicaciones diarias.',
    title: 'Conectate ahora',
    cta: 'Radio en Vivo',
  },
  b: {
    hero: 'Escucha palabra y alabanza en vivo para fortalecer tu fe cada dia.',
    title: 'Escuchar ahora',
    cta: 'Comenzar transmision',
  },
};

type Props = {
  bucket: LandingBucket;
};

export default function HomeClient({ bucket }: Props) {
  const copy = LANDING_COPY[bucket] ?? LANDING_COPY.a;
  const impressionOnceRef = useRef(false);

  useEffect(() => {
    if (impressionOnceRef.current) return;
    impressionOnceRef.current = true;
    trackLandingVariantImpression(bucket);
  }, [bucket]);

  return (
    <main className="flex-1">
      <RadioInvitation
        heroText={copy.hero}
        titleText={copy.title}
        ctaLabel={copy.cta}
        landingBucket={bucket}
      />
      <LazyOnView fallback={<div className="min-h-[120px] animate-pulse bg-white" />}>
        <DailyVerse />
      </LazyOnView>
      <LazyOnView fallback={<div className="min-h-[220px] animate-pulse bg-white" />}>
        <Bible />
      </LazyOnView>
      <LazyOnView fallback={<div className="min-h-[120px] animate-pulse bg-white" />}>
        <DownloadApp />
      </LazyOnView>
      <section className="w-full bg-white py-12 md:py-24 lg:py-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 sm:px-6">
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Partners</p>
          <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-8">
            <a href="https://www.iciar.app" target="_blank" rel="noopener noreferrer">
              <NextImage
                src="https://i.imgur.com/iVQq3Zg.jpeg"
                alt="ICIAR"
                width={220}
                height={120}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_PLACEHOLDERS.iciarLogo}
                loading="lazy"
                fetchPriority="low"
                className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
              />
            </a>
            <a href="https://www.iciarpacifico.com/" target="_blank" rel="noopener noreferrer">
              <NextImage
                src="https://i.imgur.com/rPl7VI5.png"
                alt="ICIAR Pacifico Norte"
                width={220}
                height={120}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_PLACEHOLDERS.pacificoLogo}
                loading="lazy"
                fetchPriority="low"
                className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
              />
            </a>
            <a href="https://icipdrgdl.com/" target="_blank" rel="noopener noreferrer">
              <NextImage
                src="https://i.imgur.com/Q06gpuP.png"
                alt="PDR Radio"
                width={220}
                height={120}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_PLACEHOLDERS.pdrLogo}
                loading="lazy"
                fetchPriority="low"
                className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
              />
            </a>
            <a
              href="https://www.scriptureearth.org/00spa.php?idx=60&language=Huichol&iso_code=hch"
              target="_blank"
              rel="noopener noreferrer"
            >
              <NextImage
                src="https://i.imgur.com/1W1jQw3.png"
                alt="Scripture Earth Huichol"
                width={220}
                height={120}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_PLACEHOLDERS.scriptureEarthLogo}
                loading="lazy"
                fetchPriority="low"
                className="mx-auto h-14 w-auto object-contain opacity-95 transition-opacity hover:opacity-80 sm:h-16"
              />
            </a>
          </div>
        </div>
      </section>
      <LazyOnView fallback={<div className="min-h-[120px] animate-pulse bg-white" />}>
        <PrayerGroupInvitation />
      </LazyOnView>
      <LazyOnView fallback={<div className="min-h-[90px] animate-pulse bg-white" />}>
        <Footer />
      </LazyOnView>
    </main>
  );
}
