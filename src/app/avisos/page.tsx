import { Suspense } from 'react';
import AvisosClient from './avisos-client';

export default function AvisosPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#F9FAFB] min-h-[60vh] flex items-center justify-center font-sans text-gray-500">
          Cargando…
        </div>
      }
    >
      <AvisosClient />
    </Suspense>
  );
}
