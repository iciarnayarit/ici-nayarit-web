import { Suspense } from 'react';
import AvisosClient from './avisos-client';
import EngagementPageTracker from '@/app/components/engagement-page-tracker';

export default function AvisosPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#F9FAFB] min-h-[60vh] flex items-center justify-center font-sans text-gray-500">
          Cargando…
        </div>
      }
    >
      <EngagementPageTracker dedupeKey="avisos-read" />
      <AvisosClient />
    </Suspense>
  );
}
