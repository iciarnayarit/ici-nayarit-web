import { redirect } from 'next/navigation';

export default function DashboardRootPage() {
  // Redirigir el root del dashboard directamente a la sección de biblia
  redirect('/dashboard/biblia');
}
