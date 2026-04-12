'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import DashboardSavedTemples from '@/app/dashboard/templos/dashboard-saved-temples';

export default function TemplosDirectoryPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#F8F9FA] pb-[max(5rem,env(safe-area-inset-bottom))] font-sans">
      <div className="mx-auto mb-8 block max-w-7xl px-4 pt-6 sm:mb-10 sm:px-6 sm:pt-8 md:px-10">
        <DashboardBibliaReadingToolbar />
        <div className="flex flex-col justify-between gap-5 sm:gap-6 md:flex-row md:items-end">
          <div className="min-w-0">
            <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-gray-900 sm:mb-2.5 sm:text-3xl md:text-[32px]">
              Templos
            </h1>
            <p className="text-sm font-medium leading-relaxed text-gray-500">
              Aquí aparecen los templos que guardes con el icono de marcador. Explora el listado completo en el sitio
              público y añade los que quieras.
            </p>
          </div>
          <Link
            href="/templos"
            className="inline-flex min-h-[44px] w-full shrink-0 touch-manipulation items-center justify-center gap-2 rounded-xl border border-[#B88A44]/30 bg-white px-5 py-3 text-sm font-bold text-[#7a5c2e] shadow-sm transition-colors hover:bg-[#FDF8EF] md:w-auto"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            Ver templos ICIAR
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <DashboardSavedTemples />
      </div>
    </div>
  );
}
