'use client';

import Image from 'next/image';
import { BookOpen, Heart, Sparkles, X } from 'lucide-react';

const COMMUNITY_IMAGE_SRC = '/images/bible/huichol-comunidad-banner.png';

const BANNER_ALT =
  'Ilustración que evoca el paisaje y la comunidad wixárika; invitación a leer la Biblia en huichol';

type Props = {
  /** Oculta el banner en esta visita; al volver a elegir Huichol u otra versión y regresar, puede mostrarse de nuevo (lo controla el padre). */
  onDismiss?: () => void;
};

/**
 * Bloque informativo encima de la barra de herramientas (versión, libro, capítulo) cuando la lectura es Huichol (Wixárika).
 */
export function HuicholReaderInviteBanner({ onDismiss }: Props) {
  return (
    <div className="relative bg-gradient-to-br from-orange-50/95 via-amber-50/50 to-white px-3 py-3.5 pr-11 pt-3 sm:px-4 sm:py-4 sm:pr-12 sm:pt-3.5">
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-1.5 top-1.5 z-10 inline-flex h-9 min-h-9 w-9 min-w-9 items-center justify-center rounded-full border border-orange-200/80 bg-white/95 text-gray-600 shadow-sm transition-colors hover:border-orange-300 hover:bg-white hover:text-gray-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#B88A44]/40 sm:right-2 sm:top-2"
          aria-label="Ocultar invitación"
        >
          <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
      )}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
        <div className="relative mx-auto flex w-full max-w-md shrink-0 overflow-hidden rounded-xl bg-orange-100/60 ring-1 ring-orange-200/60 sm:mx-0 sm:h-[7.5rem] sm:w-[11.5rem] sm:max-w-none md:h-[8.25rem] md:w-[13rem]">
          <Image
            src={COMMUNITY_IMAGE_SRC}
            alt={BANNER_ALT}
            width={520}
            height={290}
            className="h-auto min-h-[7rem] w-full object-cover object-center sm:min-h-0 sm:h-full"
            sizes="(max-width: 640px) 100vw, 208px"
            loading="lazy"
            quality={85}
          />
        </div>
        <div className="flex w-full min-w-0 max-w-xl flex-col items-center justify-center gap-2 text-center sm:max-w-md sm:items-center md:max-w-lg">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-700/90">Wixárika · Huichol</p>
          <h3 className="text-sm font-bold leading-snug text-gray-900 sm:text-base">
            Te invitamos a leer la Palabra en la lengua de la comunidad
          </h3>
          <p className="text-xs leading-relaxed text-gray-600 sm:text-[13px]">
            La Biblia en wixárika (huichol) acerca el mensaje de Dios a familias y pueblos del occidente de México.
            Elige libro y capítulo, escucha el audio por capítulo y comparte el enlace con quien
            quieras.
          </p>
          <ul className="mt-0.5 flex w-full max-w-lg flex-col items-center gap-2.5 text-[11px] font-medium text-gray-700 sm:text-xs">
            <li className="flex flex-col items-center gap-1 text-center sm:max-w-md">
              <BookOpen className="h-4 w-4 shrink-0 text-[#B88A44]" aria-hidden />
              <span>Lee en voz alta o en silencio; el texto sigue la numeración que conoces en español.</span>
            </li>
            <li className="flex flex-col items-center gap-1 text-center sm:max-w-md">
              <Sparkles className="h-4 w-4 shrink-0 text-[#B88A44]" aria-hidden />
              <span>Usa el audio para acompañar la lectura y familiarizarte con la pronunciación.</span>
            </li>
            <li className="flex flex-col items-center gap-1 text-center sm:max-w-md">
              <Heart className="h-4 w-4 shrink-0 text-[#B88A44]" aria-hidden />
              <span>Comparte capítulos desde el botón rojo para que más personas descubran esta versión.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
