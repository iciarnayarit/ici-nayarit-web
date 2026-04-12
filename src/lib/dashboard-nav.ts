import type { LucideIcon } from 'lucide-react';
import { BookOpen, Church, UserPlus } from 'lucide-react';

export type DashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

/** Enlaces del panel (sidebar del dashboard y menú móvil del sitio). */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { name: 'Personal', href: '/dashboard/miembros', icon: UserPlus },
  { name: 'Biblia', href: '/dashboard/biblia', icon: BookOpen },
  { name: 'Iglesia', href: 'https://churches.iciarnayarit.com/', icon: Church, external: true },
];

export function isDashboardPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}
