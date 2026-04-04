'use client';

import { Bookmark } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  loadSavedReadingPlansFromStorage,
  SAVED_PLANS_CHANGED_EVENT,
  savedPlanDescription,
  savedPlanTitle,
  type StoredSavedReadingPlan,
} from '@/lib/saved-reading-plans';

export default function DashboardSavedPlans() {
  const [plans, setPlans] = useState<StoredSavedReadingPlan[]>([]);

  const refresh = useCallback(() => {
    setPlans(loadSavedReadingPlansFromStorage());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onCustom = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'savedPlans') refresh();
    };
    window.addEventListener(SAVED_PLANS_CHANGED_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_PLANS_CHANGED_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  if (plans.length === 0) {
    return (
      <div
        id="planes-guardados-dashboard"
        className="rounded-3xl border border-dashed border-gray-200 bg-white/80 p-6 shadow-sm md:p-8"
      >
        <div className="flex flex-wrap items-center gap-2 text-gray-400">
          <Bookmark className="h-4 w-4 shrink-0" aria-hidden />
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Planes guardados</h2>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Aún no has guardado ningún plan. En la página{' '}
          <Link href="/planes" className="font-semibold text-blue-600 underline hover:text-blue-700">
            Planes
          </Link>
          , pulsa el icono del marcador en un plan para guardarlo aquí.
        </p>
      </div>
    );
  }

  return (
    <section id="planes-guardados-dashboard" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Bookmark className="h-4 w-4 text-[#B88A44]" aria-hidden />
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Planes guardados</h2>
        <span className="rounded-full bg-[#B88A44]/10 px-2.5 py-0.5 text-xs font-bold text-[#B88A44]">
          {plans.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => {
          const title = savedPlanTitle(plan);
          const description = savedPlanDescription(plan);
          return (
            <article
              key={plan.id}
              className="flex flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/planes/${plan.slug}`} className="relative block h-40 w-full shrink-0 bg-gray-100">
                <Image
                  src={plan.imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold tracking-tight text-gray-900">{title}</h3>
                {description ? (
                  <p className="mt-2 line-clamp-3 flex-1 text-[13px] font-medium leading-relaxed text-gray-500">
                    {description}
                  </p>
                ) : null}
                <Link
                  href={`/planes/${plan.slug}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-50 py-3 text-center text-[13px] font-bold text-blue-600 transition-colors hover:bg-blue-100"
                >
                  Continuar plan
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
