'use client';

import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import AddMemberForm from '@/app/dashboard/miembros/add-member-form';

export default function DashboardMiembrosPage() {
  return (
    <div className="min-h-screen bg-[#F4F7F6] pb-6 sm:pb-14">
      <div
        className="mx-auto w-full max-w-4xl space-y-5 px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:space-y-8 sm:px-6 sm:pt-4 md:px-8 md:pt-6 lg:px-10"
        lang="es"
      >
        <DashboardBibliaReadingToolbar />
        <AddMemberForm />
      </div>
    </div>
  );
}
