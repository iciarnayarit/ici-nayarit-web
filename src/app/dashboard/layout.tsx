'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutDashboard } from 'lucide-react';
import { Show, SignInButton } from '@clerk/nextjs';
import Footer from '@/app/components/footer';
import { DASHBOARD_NAV_ITEMS } from '@/lib/dashboard-nav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [dashboardGroupOpen, setDashboardGroupOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDashboardGroupOpen(true);
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
        {/* Sidebar */}

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
