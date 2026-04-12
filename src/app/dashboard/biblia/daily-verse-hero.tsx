'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/app/components/ui/carousel';
import { getDailySliderVerses, type DailyVerseEs } from '@/lib/daily-verse-es';
import { parseReferenceParts } from '@/lib/saved-verses';

type DailyVerseHeroProps = {
  /** Versículo visible en el carrusel (para compartir / copiar fuera del héroe). */
  onActiveVerseChange?: (verse: DailyVerseEs) => void;
};

function bibliaHref(reference: string) {
  const parts = parseReferenceParts(reference);
  if (!parts) return '/biblia';
  return `/biblia?book=${encodeURIComponent(parts.book)}&chapter=${parts.chapter}`;
}

export default function DailyVerseHero({ onActiveVerseChange }: DailyVerseHeroProps) {
  const [slides, setSlides] = useState<DailyVerseEs[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);

  useEffect(() => {
    setSlides(getDailySliderVerses(new Date()));
  }, []);

  useEffect(() => {
    if (slides.length === 0 || !onActiveVerseChange) return;
    const v = slides[active % slides.length];
    if (v) onActiveVerseChange(v);
  }, [slides, active, onActiveVerseChange]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActive(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const len = slides.length;
  const goPrev = useCallback(() => api?.scrollPrev(), [api]);
  const goNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <div className="relative w-full min-h-[240px] overflow-hidden rounded-2xl shadow-sm sm:min-h-[280px] sm:rounded-3xl md:min-h-[320px]">
      <Image
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
        alt="Paisaje de montañas"
        fill
        className="object-cover"
        sizes="(max-width: 1152px) 100vw, 1152px"
        priority
      />
      <div className="absolute inset-0 bg-black/45 flex flex-col justify-center">
        <div className="relative px-3 py-6 sm:px-8 sm:py-8 md:px-12 md:py-12">
          <p className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-[0.2em] mb-3 text-center">
            Versículo del día
          </p>

          {len > 0 ? (
            <>
              <Carousel
                setApi={setApi}
                opts={{
                  loop: true,
                  align: 'start',
                  dragFree: false,
                  watchDrag: true,
                }}
                className="w-full cursor-grab select-none active:cursor-grabbing"
                aria-roledescription="carrusel"
              >
                <CarouselContent className="-ml-0">
                  {slides.map((verse, i) => (
                    <CarouselItem
                      key={`${verse.reference}-${i}`}
                      className="pl-0 basis-full min-w-0 shrink-0 grow-0"
                      aria-roledescription="diapositiva"
                    >
                      <div
                        className="flex w-full max-w-full flex-col items-center overflow-hidden px-4 text-center sm:px-11 md:px-14"
                        aria-hidden={i !== active}
                      >
                        <h2 className="mx-auto max-w-3xl font-display text-xl font-bold leading-snug text-white sm:text-2xl sm:leading-tight md:text-4xl lg:text-5xl">
                          &ldquo;{verse.text}&rdquo;
                        </h2>
                        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                          <div className="w-8 h-0.5 bg-[#B88A44] shrink-0" />
                          <Link
                            href={bibliaHref(verse.reference)}
                            className="text-white font-semibold tracking-wide hover:text-amber-200 transition-colors z-10 relative"
                            onClick={e => e.stopPropagation()}
                            onPointerDown={e => e.stopPropagation()}
                          >
                            {verse.reference}
                          </Link>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <button
                type="button"
                onClick={goPrev}
                className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm border border-white/25 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-colors"
                aria-label="Versículo anterior"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm border border-white/25 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-colors"
                aria-label="Versículo siguiente"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
              </button>

              <div
                className="flex justify-center gap-1.5 mt-6 md:mt-8"
                role="tablist"
                aria-label="Posición en el carrusel"
              >
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Ir al versículo ${i + 1} de ${len}`}
                    onClick={() => api?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? 'w-6 bg-[#B88A44]' : 'w-1.5 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-3xl space-y-4 animate-pulse" aria-hidden>
              <div className="h-8 md:h-12 bg-white/20 rounded-lg w-full" />
              <div className="h-8 md:h-12 bg-white/15 rounded-lg w-5/6" />
              <div className="h-6 bg-white/15 rounded w-40 mt-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
