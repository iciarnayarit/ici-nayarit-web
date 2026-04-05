'use client';

import DashboardImageDrafts from '@/app/dashboard/imagenes/dashboard-image-drafts';

export default function DashboardImagenesPage() {
  return (
    <div className="bg-[#F4F7F6] min-h-screen pb-12">
      <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8 md:px-10" lang="es">
        <DashboardImageDrafts />
      </div>
    </div>
  );
}
