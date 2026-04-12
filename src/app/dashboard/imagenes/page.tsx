'use client';

import { useState } from 'react';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import DashboardImageDrafts from '@/app/dashboard/imagenes/dashboard-image-drafts';

export default function DashboardImagenesPage() {
  const [draftSearch, setDraftSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#F4F7F6] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div
        className="mx-auto max-w-7xl space-y-5 px-4 pb-6 pt-4 sm:space-y-6 sm:p-6 md:p-8 md:px-10"
        lang="es"
      >
        <DashboardBibliaReadingToolbar
          toolbarSearch={{
            value: draftSearch,
            onChange: setDraftSearch,
            placeholder: 'Buscar por referencia o texto…',
            'aria-label': 'Buscar borradores de imágenes',
          }}
        />
        <DashboardImageDrafts searchQuery={draftSearch} />
      </div>
    </div>
  );
}
