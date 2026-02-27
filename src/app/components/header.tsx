'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/biblia', label: 'Biblia' },
  { href: '/doctrina', label: 'Doctrina' },
  { href: '/radio', label: 'Radio' },
  //{ href: '/comunidad', label: 'Comunidad' },
  { href: '/templos', label: 'Templos' },
  //{ href: '/avisos', label: 'Avisos' },
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
  const currentPath = usePathname();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="font-display font-bold text-2xl text-gray-900 tracking-wide">
              ICIAR <span className="text-[#B88A44]">Nayarit</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} currentPath={currentPath} />
            ))}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`block px-3 py-2 rounded-md text-base font-medium ${link.href === currentPath ? 'text-[#B88A44] bg-yellow-50' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
                  {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;