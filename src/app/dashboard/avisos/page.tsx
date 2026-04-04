'use client';

import Link from 'next/link';
import DashboardSavedAvisos from '@/app/dashboard/avisos/dashboard-saved-avisos';

export default function AvisosGuardadosPage() {
  return (
    <div className="min-h-screen w-full bg-[#F4F7F6] pb-12">
      <header className="mx-auto mt-4 w-full max-w-7xl px-6 py-5 md:px-10">
        <nav className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
          <Link href="/avisos" className="text-gray-400 transition-colors hover:text-gray-600">
            Avisos
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-blue-600">Guardados</span>
        </nav>
        <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">Avisos guardados</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Gestiona y revisa los avisos importantes que hayas marcado como favoritos.
        </p>
      </header>

      <DashboardSavedAvisos />
    </div>
  );
}
