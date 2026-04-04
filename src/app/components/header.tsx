'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import { Show, UserButton, SignOutButton, SignInButton, SignUpButton } from '@clerk/nextjs';
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

const NavLink = ({ href, label, currentPath }: { href: string; label: string; currentPath: string }) => {
  const isActive = href === currentPath;
  return (
    <Link href={href} className={`text-sm font-semibold transition-colors ${isActive ? 'text-[#B88A44]' : 'text-gray-600 hover:text-black'}`}>
      {label}
    </Link>
  );
};

const Header = () => {
  const [isOpen, setIsOpen]             = useState(false);
  const [nosotrosOpen, setNosotrosOpen] = useState(false);
  const [bibliaOpen, setBibliaOpen]     = useState(false);
  const [historiaOpen, setHistoriaOpen] = useState(false);
  const [mounted, setMounted]           = useState(false);
  const currentPath = usePathname();

  const nosotrosActive = nosotrosLinks.some(l => l.href === currentPath);
  const bibliaActive   = bibliaLinks.some(l => l.href === currentPath);
  const historiaActive = historiaLinks.some(l => l.href === currentPath);

  useEffect(() => { setMounted(true); }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); setNosotrosOpen(false); setBibliaOpen(false); setHistoriaOpen(false); }, [currentPath]);

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
                <NavLink href="/dashboard" label="Dashboard" currentPath={currentPath} />
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

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && <Show when="signed-in"><UserButton /></Show>}
            <button onClick={() => setIsOpen(p => !p)} className="p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200/50">
          <div className="px-4 pt-3 pb-2">
            <GlobalSearch />
          </div>
          <div className="px-2 pt-1 pb-3 space-y-1 sm:px-3">
            {mainLinks.map(link => (
              <Link key={link.href} href={link.href} className={`block px-3 py-2 rounded-md text-base font-medium ${link.href === currentPath ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}

            {/* Biblia collapsible */}
            <button
              onClick={() => setBibliaOpen(p => !p)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors ${bibliaActive ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
            >
              Biblia
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${bibliaOpen ? 'rotate-180' : ''}`} />
            </button>
            {bibliaOpen && (
              <div className="pl-3 space-y-1 border-l-2 border-gray-100 ml-3">
                {bibliaLinks.map(link => (
                  <Link key={link.href} href={link.href} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${link.href === currentPath ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>
                    <span>{link.icon}</span> {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Historia collapsible */}
            <button
              onClick={() => setHistoriaOpen(p => !p)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors ${historiaActive ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
            >
              Historia
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${historiaOpen ? 'rotate-180' : ''}`} />
            </button>
            {historiaOpen && (
              <div className="pl-3 space-y-1 border-l-2 border-gray-100 ml-3">
                {historiaLinks.map(link => (
                  <Link key={link.href} href={link.href} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${link.href === currentPath ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>
                    <span>{link.icon}</span> {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Nosotros collapsible */}
            <button
              onClick={() => setNosotrosOpen(p => !p)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors ${nosotrosActive ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
            >
              Nosotros
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${nosotrosOpen ? 'rotate-180' : ''}`} />
            </button>
            {nosotrosOpen && (
              <div className="pl-3 space-y-1 border-l-2 border-gray-100 ml-3">
                {nosotrosLinks.map(link => (
                  <Link key={link.href} href={link.href} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${link.href === currentPath ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>
                    <span>{link.icon}</span> {link.label}
                  </Link>
                ))}
              </div>
            )}

            {mounted && (
              <Show when="signed-in">
                <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${'/dashboard' === currentPath ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
                  Dashboard
                </Link>
              </Show>
            )}

            <div className="border-t border-gray-200 my-2" />

            {mounted && (
              <Show
                when="signed-in"
                fallback={
                  <>
                    <SignUpButton mode="modal">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-left text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-black"
                      >
                        <UserPlus className="h-4 w-4 shrink-0" /> Crear Cuenta
                      </button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-left text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-black"
                      >
                        <LogIn className="h-4 w-4 shrink-0" /> Iniciar Sesión
                      </button>
                    </SignInButton>
                  </>
                }
              >
                <SignOutButton>
                  <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 cursor-pointer">
                    Cerrar Sesión
                  </span>
                </SignOutButton>
              </Show>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
