'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import DashboardSavedPlans from '@/app/dashboard/planes/dashboard-saved-plans';
import { allPlanData, plans } from '@/lib/reading-plan-data';

const INITIAL_VISIBLE = 6;
const LOAD_MORE_COUNT = 6;

/** Plan de lectura por capítulos de Proverbios (alineado con el banner «Creciendo en Sabiduría»). */
const FEATURED_PROVERBS_PLAN_SLUG = 'proverbios-sabiduria-diaria';

const ACCENT_COLORS = [
  'bg-red-500',
  'bg-blue-400',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-blue-600',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
] as const;

const CATEGORY_LABELS = [
  'LECTURA',
  'DEVOCIONAL',
  'ESTUDIO',
  'TEMPORADA',
  'CRECIMIENTO',
  'COMUNIDAD',
] as const;

function daysLabel(slug: string): string {
  const data = allPlanData[slug];
  if (Array.isArray(data) && data.length > 0) {
    const n = data.length;
    return n === 1 ? '1 DÍA' : `${n} DÍAS`;
  }
  return 'GUÍA';
}

export default function PlanesPage() {
  const total = plans.length;
  const [visibleCount, setVisibleCount] = useState(() => Math.min(INITIAL_VISIBLE, total));

  const visiblePlans = useMemo(() => plans.slice(0, visibleCount), [visibleCount]);
  const hasMore = visibleCount < total;
  const showing = Math.min(visibleCount, total);

  const loadMore = () => {
    if (!hasMore) return;
    setVisibleCount(c => Math.min(c + LOAD_MORE_COUNT, total));
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8F9FA] pb-20 font-sans">
      <div className="mx-auto max-w-7xl space-y-10 p-6 md:p-10">
        {/* Banner destacado */}
        <div className="relative flex h-[380px] w-full items-center overflow-hidden rounded-3xl shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
            alt="Paisaje montañoso"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent" />

          <div className="relative z-10 max-w-2xl p-8 md:p-14">
            <span className="mb-6 inline-block rounded-full border border-blue-500/30 bg-blue-600/20 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-300">
              Plan destacado del día
            </span>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              Creciendo en Sabiduría
            </h1>
            <p className="mb-10 max-w-md text-sm font-medium leading-relaxed text-gray-300 md:text-base">
              Un viaje de 21 días a través de los Proverbios para encontrar claridad en un mundo complejo.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/planes/${FEATURED_PROVERBS_PLAN_SLUG}`}
                className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-500"
              >
                Comenzar plan
              </Link>
            </div>
          </div>
        </div>

        <DashboardSavedPlans />

        <div className="pt-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Explorar planes de lectura</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Descubre itinerarios seleccionados para tu crecimiento espiritual.
          </p>
        </div>

        {/* Cuadrícula de planes */}
        <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
          {visiblePlans.map((plan, index) => (
            <div
              key={plan.id}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <Image
                  src={plan.imageUrl}
                  alt={plan.titleKey}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute right-4 top-4 z-10">
                  <span className="rounded-md bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-800 shadow-sm">
                    {daysLabel(plan.slug)}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-7">
                <div className="mb-3 mt-1 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${ACCENT_COLORS[index % ACCENT_COLORS.length]}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                    {CATEGORY_LABELS[index % CATEGORY_LABELS.length]}
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-bold tracking-tight text-gray-900">{plan.titleKey}</h3>
                <p className="mb-8 flex-1 text-[13px] font-medium leading-relaxed text-gray-500 line-clamp-4">
                  {plan.descriptionKey}
                </p>

                <Link
                  href={`/planes/${plan.slug}`}
                  className="w-full rounded-xl bg-blue-50 py-3.5 text-center text-[13px] font-bold text-blue-600 transition-colors hover:bg-blue-100"
                >
                  Comenzar plan
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Cargar más */}
        <div className="flex flex-col items-center justify-center gap-4 border-t border-gray-100 pt-10">
          <p className="text-center text-[11px] font-medium text-gray-400">
            Mostrando {showing} de {total} planes
          </p>
          {hasMore ? (
            <button
              type="button"
              onClick={loadMore}
              className="w-full max-w-xl rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-[13px] font-bold text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
            >
              Cargar más planes
            </button>
          ) : total > 0 ? (
            <p className="text-center text-[12px] font-medium text-gray-400">
              No hay más planes que mostrar.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
