'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Show, SignInButton } from '@clerk/nextjs';
import Footer from '@/app/components/footer';
import { DASHBOARD_NAV_ITEMS } from '@/lib/dashboard-nav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on navigation in mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <div
        className="min-h-[calc(100vh-80px)] bg-[#F4F7F6]"
        aria-busy="true"
        aria-label="Cargando panel"
      />
    );
  }

  return (
    <Show 
      when="signed-in"
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F7F6]">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Acceso Restringido</h2>
          <p className="text-gray-500 mb-6 text-sm">Debes iniciar sesión para ver tu dashboard.</p>
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-colors">
              Iniciar Sesión
            </button>
          </SignInButton>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row bg-[#F4F7F6] min-h-[calc(100vh-80px)] text-gray-900 font-sans relative">
        
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between sticky top-16 sm:top-20 z-40 shadow-sm w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#B88A44] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Dashboard</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-[#B88A44] bg-[#B88A44]/10 rounded-md hover:bg-[#B88A44]/20 transition-colors"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Backdrop overlay for mobile strictly */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-[100] flex w-[min(100vw-3rem,280px)] flex-col justify-between overflow-y-auto border-r border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl transition-[transform,width] duration-300 ease-in-out lg:z-auto lg:max-w-none lg:border-[#B88A44]/20 lg:bg-[#B88A44]/5 lg:pb-0 lg:shadow-none ${isDesktopSidebarCollapsed ? 'lg:w-20' : 'lg:w-[280px]'} lg:static lg:translate-x-0 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        >
          <div>
            {/* Mobile: cabecera del drawer */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6 lg:hidden">
              <span className="text-lg font-bold text-[#B88A44]">Menú</span>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Escritorio: hamburguesa para contraer / expandir */}
            <div
              className={`hidden border-b border-[#B88A44]/15 lg:flex ${isDesktopSidebarCollapsed ? 'justify-center px-2 py-3' : 'items-center justify-between px-4 py-3'}`}
            >
              {!isDesktopSidebarCollapsed ? (
                <span className="text-xs font-bold uppercase tracking-widest text-[#B88A44]/80"></span>
              ) : (
                <span className="sr-only">Menú del panel</span>
              )}
              <button
                type="button"
                onClick={() => setIsDesktopSidebarCollapsed(v => !v)}
                className="rounded-lg p-2 text-[#B88A44] transition-colors hover:bg-[#B88A44]/10"
                aria-expanded={!isDesktopSidebarCollapsed}
                aria-label={isDesktopSidebarCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <nav className={`space-y-1.5 px-5 pt-4 lg:pt-6 ${isDesktopSidebarCollapsed ? 'lg:px-2 lg:pt-4' : ''}`}>
              {DASHBOARD_NAV_ITEMS.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={isDesktopSidebarCollapsed ? link.name : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all lg:min-h-0 lg:py-3.5 ${
                      isDesktopSidebarCollapsed ? 'lg:justify-center lg:px-2' : ''
                    } ${
                      isActive ? 'bg-[#B88A44]/10 text-[#B88A44] shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#B88A44]' : 'text-gray-400'}`} />
                    <span className={isDesktopSidebarCollapsed ? 'lg:sr-only' : ''}>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 w-full mx-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </Show>
  );
}
