'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import { Show, UserButton, SignOutButton, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { CHURCH_ADMIN_MEMBERS_PORTAL_URL } from '@/lib/church-admin';
import { DASHBOARD_NAV_ITEMS, isDashboardPath } from '@/lib/dashboard-nav';
import GlobalSearch from '@/app/components/global-search';

const mainLinks = [
  { href: '/', label: 'Inicio' },
];

const bibliaLinks = [
  { href: '/biblia',  label: 'Biblia',  desc: 'Lee la Palabra de Dios',      icon: '📖' },
  { href: '/planes',  label: 'Planes',  desc: 'Planes de lectura bíblica',   icon: '📅' },
];

const nosotrosLinks = [
  { href: '/templos',  label: 'Templos',  desc: 'Nuestras congregaciones',    icon: '🏛️' },
  { href: '/radio',    label: 'Radio',    desc: 'Transmisión en vivo',        icon: '📻' },
  { href: '/recursos', label: 'Recursos', desc: 'Material de estudio',        icon: '🗂️' },
  { href: '/avisos',   label: 'Avisos',   desc: 'Anuncios y eventos',         icon: '📢' },
];

const historiaLinks = [
  { href: '/historia',          label: 'Historia',  desc: 'Crónica y origen de ICIAR',        icon: '📜' },
  { href: '/historia/legado',   label: 'Legado',    desc: 'Línea de tiempo desde 1920',        icon: '🕰️' },
  { href: '/doctrina',          label: 'Doctrina',  desc: '8 puntos fundamentales de la fe',   icon: '✝️' },
  { href: '/historia/regiones', label: 'Regiones',  desc: 'Presencia en 3 continentes',        icon: '🌎' },
];

const NavLink = ({
  href,
  label,
  currentPath,
  matchChildRoutes,
}: {
  href: string;
  label: string;
  currentPath: string;
  /** Si true, activo también en rutas bajo `href/` (p. ej. subrutas de perfil). */
  matchChildRoutes?: boolean;
}) => {
  const isActive = matchChildRoutes
    ? currentPath === href || currentPath.startsWith(`${href}/`)
    : href === currentPath;
  return (
    <Link href={href} className={`text-sm font-semibold transition-colors ${isActive ? 'text-[#B88A44]' : 'text-gray-600 hover:text-black'}`}>
      {label}
    </Link>
  );
};

const Header = () => {
  const [mounted, setMounted]           = useState(false);
  const [hasSavedMemberInfo, setHasSavedMemberInfo] = useState(false);
  const currentPath = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const nosotrosActive = nosotrosLinks.some(l => l.href === currentPath);
  const bibliaActive   = bibliaLinks.some(l => l.href === currentPath);
  const historiaActive = historiaLinks.some(l => l.href === currentPath);
  const dashboardActive = isDashboardPath(currentPath);

  useEffect(() => { setMounted(true); }, []);

  const refreshChurchMenuAccess = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setHasSavedMemberInfo(false);
      return;
    }
    try {
      const res = await fetch('/api/members', { cache: 'no-store' });
      const data = (await res.json().catch(() => ({}))) as { member?: { id?: string } | null };
      setHasSavedMemberInfo(!!(res.ok && data.member?.id));
    } catch {
      setHasSavedMemberInfo(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    void refreshChurchMenuAccess();
  }, [refreshChurchMenuAccess, currentPath]);

  useEffect(() => {
    const onMemberSaved = () => {
      void refreshChurchMenuAccess();
    };
    window.addEventListener('member-profile-saved', onMemberSaved);
    return () => {
      window.removeEventListener('member-profile-saved', onMemberSaved);
    };
  }, [refreshChurchMenuAccess]);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-display font-bold text-2xl text-gray-900 tracking-wide">
              ICIAR <span className="text-[#B88A44]">Nayarit</span>
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <GlobalSearch />
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-7">
            {mainLinks.map(link => (
              <NavLink key={link.href} {...link} currentPath={currentPath} />
            ))}

            {/* Biblia dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1 text-sm font-semibold transition-colors focus:outline-none ${bibliaActive ? 'text-[#B88A44]' : 'text-gray-600 hover:text-black'}`}>
                  Biblia <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 pb-2 pt-1">Estudio bíblico</p>
                {bibliaLinks.map(link => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${link.href === currentPath ? 'bg-amber-50 text-[#B88A44]' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-lg leading-none mt-0.5">{link.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold leading-tight">{link.label}</span>
                        <span className="text-[11px] text-gray-400 font-normal">{link.desc}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Historia dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1 text-sm font-semibold transition-colors focus:outline-none ${historiaActive ? 'text-[#B88A44]' : 'text-gray-600 hover:text-black'}`}>
                  Historia <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl shadow-xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 pb-2 pt-1">Nuestra historia</p>
                {historiaLinks.map(link => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${link.href === currentPath ? 'bg-amber-50 text-[#B88A44]' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-lg leading-none mt-0.5">{link.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold leading-tight">{link.label}</span>
                        <span className="text-[11px] text-gray-400 font-normal">{link.desc}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Nosotros dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1 text-sm font-semibold transition-colors focus:outline-none ${nosotrosActive ? 'text-[#B88A44]' : 'text-gray-600 hover:text-black'}`}>
                  Nosotros <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 pb-2 pt-1">Secciones</p>
                {nosotrosLinks.map(link => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${link.href === currentPath ? 'bg-amber-50 text-[#B88A44]' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-lg leading-none mt-0.5">{link.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold leading-tight">{link.label}</span>
                        <span className="text-[11px] text-gray-400 font-normal">{link.desc}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {mounted && (
              <Show when="signed-in">
                <>
                  {hasSavedMemberInfo && (
                    <a
                      href={CHURCH_ADMIN_MEMBERS_PORTAL_URL}
                      className="text-sm font-semibold text-gray-600 transition-colors hover:text-black"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Iglesia
                    </a>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1 text-sm font-semibold transition-colors focus:outline-none ${
                          dashboardActive ? 'text-gray-900' : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        Dashboard <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-60 p-2 rounded-2xl shadow-xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 pb-2 pt-1">Panel</p>
                      {DASHBOARD_NAV_ITEMS.map(item => {
                        const Icon = item.icon;
                        const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                        return (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                                active ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <Icon className="h-4 w-4 shrink-0 opacity-90" />
                              <span className="text-sm font-bold leading-tight">{item.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              </Show>
            )}

            {/* User button */}
            {mounted && (
              <Show
                when="signed-in"
                fallback={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <SignUpButton mode="modal">
                        <DropdownMenuItem className="cursor-pointer">
                          <UserPlus className="h-4 w-4 mr-2" /> Crear Cuenta
                        </DropdownMenuItem>
                      </SignUpButton>
                      <SignInButton mode="modal">
                        <DropdownMenuItem className="cursor-pointer">
                          <LogIn className="h-4 w-4 mr-2" /> Iniciar Sesión
                        </DropdownMenuItem>
                      </SignInButton>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              >
                <UserButton />
              </Show>
            )}
          </div>

          {/* Mobile user button */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && <Show when="signed-in"><UserButton /></Show>}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
