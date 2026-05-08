'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import { MountOnView } from '@/app/components/mount-on-view';

const AvisosRecommendationsPanel = dynamic(() => import('./avisos-recommendations-panel'), {
  loading: () => (
    <div className="mx-auto mb-6 w-full max-w-7xl px-4 sm:px-6 md:px-10">
      <div className="min-h-[160px] animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm" />
    </div>
  ),
});

const DashboardSavedAvisos = dynamic(() => import('./dashboard-saved-avisos'), {
  loading: () => (
    <div className="mx-auto mt-4 max-w-7xl px-4 sm:mt-6 sm:px-6 md:px-10">
      <div className="mb-4 h-11 animate-pulse rounded-xl bg-white/80 shadow-sm sm:max-w-xs" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={`avisos-saved-skel-${i}`}
            className="min-h-[320px] animate-pulse rounded-[20px] border border-gray-100 bg-white shadow-sm"
          />
        ))}
      </div>
    </div>
  ),
});

export default function AvisosGuardadosPage() {
  return (
    <div className="min-h-screen w-full bg-[#F4F7F6] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 md:px-10">
        <DashboardBibliaReadingToolbar />
      </div>
      <header className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 md:px-10">
        <nav className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
          <Link href="/avisos" className="text-gray-400 transition-colors hover:text-gray-600">
            Avisos
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-blue-600">Guardados</span>
        </nav>
        <h1 className="font-display text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Avisos guardados</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Gestiona y revisa los avisos importantes que hayas marcado como favoritos.
        </p>
      </header>

      <MountOnView
        fallback={
          <div className="mx-auto mt-4 max-w-7xl px-4 sm:mt-6 sm:px-6 md:px-10">
            <div className="mb-4 h-11 animate-pulse rounded-xl bg-white/80 shadow-sm sm:max-w-xs" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={`avisos-saved-view-skel-${i}`}
                  className="min-h-[320px] animate-pulse rounded-[20px] border border-gray-100 bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        }
      >
        <DashboardSavedAvisos />
      </MountOnView>

      <MountOnView
        fallback={
          <div className="mx-auto mb-6 w-full max-w-7xl px-4 sm:px-6 md:px-10">
            <div className="min-h-[160px] animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm" />
          </div>
        }
      >
        <AvisosRecommendationsPanel />
      </MountOnView>
    </div>
  );
}
