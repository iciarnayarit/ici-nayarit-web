'use client';

import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import DashboardSavedPersonalReflections from '@/app/dashboard/biblia/dashboard-saved-personal-reflections';
import NotasReflexionEditor from '@/app/dashboard/notas/notas-reflexion-editor';

export default function NotasPage() {
  return (
    <div className="min-h-screen w-full bg-white pb-[max(4rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-5 sm:pt-10 md:px-8 md:pt-12" lang="es">
        <DashboardBibliaReadingToolbar />
        <NotasReflexionEditor />
      </div>

      <div className="mx-auto mt-10 w-full max-w-3xl px-4 sm:mt-14 sm:px-5 md:px-8">
        <DashboardSavedPersonalReflections />
      </div>
    </div>
  );
}
