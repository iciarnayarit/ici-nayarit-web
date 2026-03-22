'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Megaphone, FileText, Building2, HelpCircle, Menu, X, Compass } from 'lucide-react';
import { Show, SignInButton } from '@clerk/nextjs';
import Footer from '@/app/components/footer';

const sidebarLinks = [
  { name: 'Biblia', href: '/dashboard/biblia', icon: BookOpen },
  { name: 'Planes', href: '/dashboard/planes', icon: Compass },
  { name: 'Avisos', href: '/dashboard/avisos', icon: Megaphone },
  { name: 'Recursos', href: '/dashboard/recursos', icon: FileText },
  { name: 'Templos', href: '/dashboard/templos', icon: Building2 },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on navigation in mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

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
        <div className="lg:hidden bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between sticky top-[64px] sm:top-[80px] z-30 shadow-sm w-full">
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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white lg:bg-[#B88A44]/5 border-r border-gray-200 lg:border-[#B88A44]/20 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] overflow-y-auto shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div>
            {/* Mobile Sidebar Header Branding */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 lg:hidden">
              <span className="font-bold text-lg text-[#B88A44]">Menú</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="px-5 space-y-1.5 pt-6 lg:pt-10">
              {sidebarLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive ? 'bg-[#B88A44]/10 text-[#B88A44] shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#B88A44]' : 'text-gray-400'}`} />
                    {link.name}
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
