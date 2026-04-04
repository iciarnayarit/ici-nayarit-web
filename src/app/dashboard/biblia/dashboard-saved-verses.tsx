'use client';

import Link from 'next/link';
import {
  Book,
  BookMarked,
  ListTodo,
  Plus,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SAVED_VERSES_STORAGE_KEY,
  SAVED_VERSES_CHANGED_EVENT,
  stashPendingReturnAfterVerseSave,
  type StoredSavedVerse,
  parseBookFromReference,
  parseReferenceParts,
  loadSavedVersesFromStorage,
} from '@/lib/saved-verses';
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

type OriginFilter = 'todos' | 'biblia' | 'plan';

function isBibliaSource(v: StoredSavedVerse) {
  return v.source !== 'plan';
}

export default function DashboardSavedVerses() {
  const [savedVerses, setSavedVerses] = useState<StoredSavedVerse[]>([]);
  const [search, setSearch] = useState('');
  const [origin, setOrigin] = useState<OriginFilter>('todos');
  const [bookFilter, setBookFilter] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoredSavedVerse | null>(null);
  const { toast } = useToast();

  const refresh = useCallback(() => {
    setSavedVerses(loadSavedVersesFromStorage());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_VERSES_STORAGE_KEY) refresh();
    };
    const onLocalChange = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(SAVED_VERSES_CHANGED_EVENT, onLocalChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SAVED_VERSES_CHANGED_EVENT, onLocalChange);
    };
  }, [refresh]);

  const byOrigin = useMemo(() => {
    if (origin === 'biblia') return savedVerses.filter(isBibliaSource);
    if (origin === 'plan') return savedVerses.filter(v => v.source === 'plan');
    return savedVerses;
  }, [savedVerses, origin]);

  const uniqueBooks = useMemo(() => {
    const set = new Set<string>();
    for (const v of byOrigin) {
      set.add(parseBookFromReference(v.reference));
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  }, [byOrigin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return byOrigin.filter(v => {
      if (bookFilter && parseBookFromReference(v.reference) !== bookFilter) return false;
      if (!q) return true;
      return (
        v.text.toLowerCase().includes(q) ||
        v.reference.toLowerCase().includes(q) ||
        (v.planTitle?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [byOrigin, bookFilter, search]);

  const persist = (next: StoredSavedVerse[]) => {
    setSavedVerses(next);
    localStorage.setItem(SAVED_VERSES_STORAGE_KEY, JSON.stringify(next));
  };

  const handleRemove = (reference: string) => {
    persist(savedVerses.filter(v => v.reference !== reference));
    toast({ title: 'Versículo eliminado', description: 'Se quitó de tus guardados.' });
    setDeleteTarget(null);
  };

  const handleShare = async (v: StoredSavedVerse) => {
    const textToShare = `"${v.text}" — ${v.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Versículo de la Biblia', text: textToShare });
        toast({ title: 'Compartido' });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '';
        if (msg !== 'Share canceled') toast({ title: 'No se pudo compartir', variant: 'destructive' });
      }
    } else {
      await navigator.clipboard.writeText(textToShare);
      toast({ title: 'Copiado al portapapeles' });
    }
  };

  const bibliaHref = (reference: string) => {
    const parts = parseReferenceParts(reference);
    if (!parts) return '/biblia';
    const book = encodeURIComponent(parts.book);
    return `/biblia?book=${book}&chapter=${parts.chapter}`;
  };

  return (
    <div className="mb-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1.5 font-display tracking-tight">
          Versículos Guardados
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Tus pasajes favoritos desde la Biblia y desde los planes de lectura
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar en mis versículos..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-full sm:w-auto sm:mr-1">
            Origen
          </span>
          {(
            [
              { id: 'todos' as const, label: 'Todos' },
              { id: 'biblia' as const, label: 'Biblia' },
              { id: 'plan' as const, label: 'Planes' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setOrigin(id);
                setBookFilter(null);
              }}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold shadow-sm transition-colors ${
                origin === id
                  ? 'bg-[#B88A44] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-full sm:w-auto sm:mr-1">
            Libro
          </span>
          <button
            type="button"
            onClick={() => setBookFilter(null)}
            className={`px-5 py-2 rounded-full text-[13px] font-semibold shadow-sm transition-colors ${
              bookFilter === null
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            Todos los libros
          </button>
          {uniqueBooks.slice(0, 12).map(book => (
            <button
              key={book}
              type="button"
              onClick={() => setBookFilter(book)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                bookFilter === book
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              {book}
            </button>
          ))}
          {uniqueBooks.length > 12 && (
            <span className="text-xs text-gray-400 px-2">+{uniqueBooks.length - 12} más (usa la búsqueda)</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/biblia"
          onClick={() => stashPendingReturnAfterVerseSave('/dashboard/biblia')}
          className="rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center min-h-[220px] p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors group"
        >
          <div className="text-gray-400 mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-[15px] mb-1.5">Guardar un nuevo versículo</h3>
          <p className="text-[11px] text-gray-500 font-medium tracking-wide">
            Abre la Biblia y marca versículos; también puedes guardarlos dentro de cada plan.
          </p>
        </Link>

        {filtered.map(v => {
          const fromPlan = v.source === 'plan';
          return (
            <div
              key={`${v.reference}-${v.text.slice(0, 24)}`}
              className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  {fromPlan ? (
                    <ListTodo className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Book className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleShare(v)}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    aria-label="Compartir"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(v)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    fromPlan ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {fromPlan ? 'Plan' : 'Biblia'}
                </span>
                {fromPlan && v.planTitle && (
                  <span className="text-[10px] font-semibold text-gray-500 truncate max-w-[180px]" title={v.planTitle}>
                    {v.planTitle}
                  </span>
                )}
              </div>

              <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed mb-6 flex-1">
                &ldquo;{v.text}&rdquo;
              </p>

              <div className="mt-auto flex flex-col gap-2">
                <Link
                  href={bibliaHref(v.reference)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 w-fit"
                >
                  {v.reference}
                </Link>
                {fromPlan && v.planSlug && (
                  <Link
                    href={`/planes/${encodeURIComponent(v.planSlug)}`}
                    className="text-[11px] font-semibold text-[#B88A44] hover:underline inline-flex items-center gap-1 w-fit"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    Ver plan
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {savedVerses.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-10">
          Aún no tienes versículos guardados. Entra a la{' '}
          <Link href="/biblia" className="text-blue-600 font-semibold hover:underline">
            Biblia
          </Link>{' '}
          o a un{' '}
          <Link href="/planes" className="text-blue-600 font-semibold hover:underline">
            plan de lectura
          </Link>{' '}
          y pulsa el ícono de guardar en un versículo.
        </p>
      )}

      {savedVerses.length > 0 && filtered.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-10">
          Ningún versículo coincide con los filtros. Prueba otra búsqueda o quita filtros.
        </p>
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este versículo?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Se quitará de tus guardados la referencia{' '}
                  <span className="font-semibold text-foreground">{deleteTarget?.reference}</span>.
                </p>
                {deleteTarget?.text && (
                  <p className="italic text-foreground/80 line-clamp-3">&ldquo;{deleteTarget.text}&rdquo;</p>
                )}
                <p>Esta acción no se puede deshacer.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              onClick={() => deleteTarget && handleRemove(deleteTarget.reference)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
