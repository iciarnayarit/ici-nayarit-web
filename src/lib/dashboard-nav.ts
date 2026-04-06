import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Building2,
  Compass,
  FileText,
  Image as ImageIcon,
  Megaphone,
  UserPlus,
} from 'lucide-react';

export type DashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

/** Enlaces del panel (sidebar del dashboard y menú móvil del sitio). */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { name: 'Personal', href: '/dashboard/miembros', icon: UserPlus },
  { name: 'Biblia', href: '/dashboard/biblia', icon: BookOpen },
  { name: 'Imágenes', href: '/dashboard/imagenes', icon: ImageIcon },
  { name: 'Planes', href: '/dashboard/planes', icon: Compass },
  { name: 'Avisos', href: '/dashboard/avisos', icon: Megaphone },
  { name: 'Recursos', href: '/dashboard/recursos', icon: FileText },
  { name: 'Templos', href: '/dashboard/templos', icon: Building2 },
];

export function isDashboardPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}
