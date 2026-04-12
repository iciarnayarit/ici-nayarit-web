import type { Metadata } from 'next';
import { Suspense } from 'react';
import BibleVersionComparator from '@/app/comparador/bible-version-comparator';

export const metadata: Metadata = {
  title: 'Comparador de versiones — ICIAR Nayarit',
  description: 'Compara el mismo pasaje en varias traducciones de la Biblia, lado a lado.',
};

export default function ComparadorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-[#F4F6F8] text-sm text-gray-400">
          Cargando comparador…
        </div>
      }
    >
      <BibleVersionComparator />
    </Suspense>
  );
}
