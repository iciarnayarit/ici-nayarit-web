'use client';

import AddMemberForm from '@/app/dashboard/miembros/add-member-form';

export default function DashboardMiembrosPage() {
  return (
    <div className="bg-[#F4F7F6] min-h-screen pb-14">
      <div className="mx-auto max-w-4xl p-6 md:p-8 md:px-10 space-y-8" lang="es">
        <AddMemberForm />
      </div>
    </div>
  );
}
