'use client';

import Link from 'next/link';
import { Image as ImageIcon, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  STUDIO_PUBLICATION_DRAFTS_CHANGED_EVENT,
  STUDIO_PUBLICATION_DRAFTS_STORAGE_KEY,
  listStudioPublicationDrafts,
  removeStudioPublicationDraft,
  type StudioPublicationDraftRecord,
} from '@/lib/studio-publication-drafts';
import { useToast } from '@/app/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';

function formatSavedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function DashboardImageDrafts() {
  const [drafts, setDrafts] = useState<StudioPublicationDraftRecord[]>([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StudioPublicationDraftRecord | null>(null);
  const { toast } = useToast();

  const refresh = useCallback(() => {
    setDrafts(listStudioPublicationDrafts());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STUDIO_PUBLICATION_DRAFTS_STORAGE_KEY) refresh();
    };
    const onLocal = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(STUDIO_PUBLICATION_DRAFTS_CHANGED_EVENT, onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(STUDIO_PUBLICATION_DRAFTS_CHANGED_EVENT, onLocal);
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drafts;
    return drafts.filter(
      d =>
        d.referenceLabel.toLowerCase().includes(q) ||
        (d.versePreview ?? '').toLowerCase().includes(q)
    );
  }, [drafts, search]);

  const handleRemove = (id: string) => {
    removeStudioPublicationDraft(id);
    setDrafts(listStudioPublicationDrafts());
    toast({ title: 'Borrador eliminado' });
    setDeleteTarget(null);
  };

  const continueHref = (d: StudioPublicationDraftRecord) => {
    const book = encodeURIComponent(d.payload.book);
    const ch = d.payload.chapter;
    return `/biblia?book=${book}&chapter=${ch}&studioDraft=${encodeURIComponent(d.id)}`;
  };

  return (
    <div className="mb-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1.5 font-display tracking-tight">
          Imágenes
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Borradores del editor de publicación guardados en este navegador
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por referencia o texto…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/biblia"
          className="rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center min-h-[220px] p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors group"
        >
          <div className="text-gray-400 mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-[15px] mb-1.5">Nueva imagen</h3>
          <p className="text-[11px] text-gray-500 font-medium tracking-wide">
            Abre la Biblia, elige versículos y usa Vista previa de publicación para diseñar y guardar borradores.
          </p>
        </Link>

        {filtered.map(d => (
          <div
            key={d.id}
            className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4 gap-2">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-violet-600" />
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(d)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                aria-label="Eliminar borrador"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Borrador
              </span>
              <span className="text-[10px] text-gray-400 font-medium">{formatSavedAt(d.savedAt)}</span>
            </div>

            {d.versePreview ? (
              <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed mb-4 line-clamp-4">
                &ldquo;{d.versePreview}
                {d.versePreview.length >= 280 ? '…' : ''}&rdquo;
              </p>
            ) : (
              <p className="text-sm text-gray-400 mb-4 italic">Sin vista previa de texto</p>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <Link
                href={continueHref(d)}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 w-fit"
              >
                {d.referenceLabel}
              </Link>
              <span className="text-[11px] font-semibold text-gray-500">Continuar en el editor</span>
            </div>
          </div>
        ))}
      </div>

      {drafts.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-10">
          Aún no hay borradores. En la{' '}
          <Link href="/biblia" className="text-blue-600 font-semibold hover:underline">
            Biblia
          </Link>
          , abre <strong className="text-gray-700">Vista previa de publicación</strong> y pulsa{' '}
          <strong className="text-gray-700">Guardar borrador</strong>.
        </p>
      )}

      {drafts.length > 0 && filtered.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-10">
          Ningún borrador coincide con la búsqueda.
        </p>
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este borrador?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Se eliminará el diseño guardado para{' '}
                  <span className="font-semibold text-foreground">{deleteTarget?.referenceLabel}</span>.
                </p>
                <p>Esta acción no se puede deshacer.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              onClick={() => deleteTarget && handleRemove(deleteTarget.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
