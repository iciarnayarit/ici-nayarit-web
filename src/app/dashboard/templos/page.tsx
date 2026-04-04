'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import DashboardSavedTemples from '@/app/dashboard/templos/dashboard-saved-temples';

export default function TemplosDirectoryPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#F8F9FA] pb-20 font-sans">
      <div className="mx-auto mb-10 block max-w-7xl px-6 pt-8 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2.5 font-display text-3xl font-bold tracking-tight text-gray-900 md:text-[32px]">
              Templos
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Aquí aparecen los templos que guardes con el icono de marcador. Explora el listado completo en el sitio
              público y añade los que quieras.
            </p>
          </div>
          <Link
            href="/templos"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#B88A44]/30 bg-white px-5 py-3 text-sm font-bold text-[#7a5c2e] shadow-sm transition-colors hover:bg-[#FDF8EF]"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            Ver templos ICIAR
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <DashboardSavedTemples />
      </div>
    </div>
  );
}
