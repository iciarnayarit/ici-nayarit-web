'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  CircleHelp,
  Compass,
  Flame,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Printer,
  Search,
  Share2,
  StickyNote,
  UserPlus,
} from 'lucide-react';
import { useCallback } from 'react';
import { useToast } from '@/app/hooks/use-toast';

function ToolbarSep() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-slate-200" aria-hidden />;
}

function ToolbarBtn({
  href,
  onClick,
  label,
  children,
  active = false,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  children: ReactNode;
  active?: boolean;
}) {
  const className =
    `inline-flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:h-10 sm:w-10 ${
      active
        ? 'bg-slate-100 text-slate-900'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label} title={label} aria-current={active ? 'page' : undefined}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

export type DashboardToolbarSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  'aria-label'?: string;
};

type DashboardBibliaReadingToolbarProps = {
  toolbarSearch?: DashboardToolbarSearchProps;
};

export default function DashboardBibliaReadingToolbar({ toolbarSearch }: DashboardBibliaReadingToolbarProps) {
  const { toast } = useToast();
  const pathname = usePathname();
  const isActiveRoute = useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  const handlePrint = useCallback(() => {
    try {
      window.print();
    } catch {
      toast({ title: 'No se pudo abrir la impresión', variant: 'destructive' });
    }
  }, [toast]);

  const handleShare = useCallback(async () => {
    const title = 'Versículos guardados — ICIAR Nayarit';
    const text = 'Revisa tus versículos guardados en el panel de Biblia.';
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        toast({ title: 'Compartido' });
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        try {
          await navigator.clipboard.writeText(`${text} ${url}`);
          toast({ title: 'Copiado', description: 'Enlace copiado al portapapeles.' });
        } catch {
          toast({ title: 'No se pudo compartir', variant: 'destructive' });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast({ title: 'Copiado', description: 'Enlace copiado al portapapeles.' });
      } catch {
        toast({ title: 'No se pudo copiar', variant: 'destructive' });
      }
    }
  }, [toast]);

  return (
    <div className="mb-6 flex w-full justify-center px-2 sm:mb-8 sm:px-3">
      <nav
        className="inline-flex max-w-full flex-nowrap items-center gap-0.5 overflow-x-auto overscroll-x-contain rounded-full border border-slate-200/90 bg-white px-1.5 py-1.5 shadow-md shadow-slate-900/5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-x-visible [&::-webkit-scrollbar]:hidden"
        aria-label="Panel y accesos rápidos de lectura"
      >
        <ToolbarBtn href="/dashboard/miembros" label="Personal" active={isActiveRoute('/dashboard/miembros')}>
          <UserPlus className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>
        <ToolbarBtn href="/dashboard/insignias" label="Insignias" active={isActiveRoute('/dashboard/insignias')}>
          <Flame className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>
        <ToolbarBtn href="/dashboard/trivia" label="Trivia" active={isActiveRoute('/dashboard/trivia')}>
          <CircleHelp className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>
        <ToolbarBtn href="/dashboard/notas" label="Notas" active={isActiveRoute('/dashboard/notas')}>
          <StickyNote className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>
        <ToolbarBtn href="/dashboard/planes" label="Planes" active={isActiveRoute('/dashboard/planes')}>
          <Compass className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>
        <ToolbarBtn href="/dashboard/avisos" label="Avisos" active={isActiveRoute('/dashboard/avisos')}>
          <Megaphone className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>
        <ToolbarBtn href="/dashboard/recursos" label="Recursos" active={isActiveRoute('/dashboard/recursos')}>
          <FileText className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>
        <ToolbarBtn href="/dashboard/templos" label="Templos" active={isActiveRoute('/dashboard/templos')}>
          <Building2 className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>

        <ToolbarBtn href="/dashboard/imagenes" label="Imágenes" active={isActiveRoute('/dashboard/imagenes')}>
          <ImageIcon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>

        <ToolbarSep />

        <ToolbarBtn onClick={handlePrint} label="Imprimir página">
          <Printer className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => void handleShare()} label="Compartir">
          <Share2 className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
        </ToolbarBtn>

        {toolbarSearch ? (
          <>
            <ToolbarSep />
            <div className="relative mx-0.5 flex min-w-[9.5rem] max-w-[min(100vw-8rem,16rem)] shrink-0 items-center sm:min-w-[11rem] sm:max-w-[18rem]">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:left-3 sm:h-4 sm:w-4"
                aria-hidden
              />
              <input
                type="search"
                value={toolbarSearch.value}
                onChange={e => toolbarSearch.onChange(e.target.value)}
                placeholder={toolbarSearch.placeholder ?? 'Buscar…'}
                aria-label={toolbarSearch['aria-label'] ?? 'Buscar borradores'}
                className="h-8 w-full touch-manipulation rounded-lg border border-slate-200/90 bg-slate-50 py-1 pl-8 pr-2 text-xs font-medium text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 sm:h-9 sm:pl-9 sm:pr-2.5 sm:text-[13px]"
              />
            </div>
          </>
        ) : null}
      </nav>
    </div>
  );
}
