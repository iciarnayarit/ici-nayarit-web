'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogIn, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import { Show, UserButton, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/biblia', label: 'Biblia' },
  { href: '/planes', label: 'Planes' },
  { href: '/doctrina', label: 'Doctrina' },
  { href: '/templos', label: 'Templos' },
  { href: '/radio', label: 'Radio' },
  { href: '/avisos', label: 'Avisos' },
  { href: '/recursos', label: 'Recursos' },
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
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="font-display font-bold text-2xl text-gray-900 tracking-wide">
              ICIAR <span className="text-[#B88A44]">Nayarit</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} currentPath={currentPath} />
            ))}
            <Show when="signed-in">
              <NavLink href="/dashboard" label="Dashboard" currentPath={currentPath} />
            </Show>
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
                    <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Crear Cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
                      <LogIn className="h-4 w-4 mr-2" />
                      Iniciar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            >
              <UserButton />
            </Show>
          </div>
          <div className="md:hidden flex items-center">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>
      {isOpen && (
        <div className="md:hidden border-t border-gray-200/50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`block px-3 py-2 rounded-md text-base font-medium ${link.href === currentPath ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}
            <Show when="signed-in">
              <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${'/dashboard' === currentPath ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
                Dashboard
              </Link>
            </Show>
            <div className="border-t border-gray-200 my-2"></div>
            <Show
              when="signed-in"
              fallback={
                <>
                  <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 pointer-events-none cursor-not-allowed select-none">
                    Crear Cuenta
                  </span>
                  <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 pointer-events-none cursor-not-allowed select-none">
                    Iniciar Sesión
                  </span>
                </>
              }
            >
              <SignOutButton>
                <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 cursor-pointer">
                  Cerrar Sesión
                </span>
              </SignOutButton>
            </Show>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
