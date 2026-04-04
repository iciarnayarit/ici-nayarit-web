'use client';

import { allAnnouncements, slugify } from '@/app/lib/announcements';
import {
  announcementCategoryPillClass,
  loadSavedAnnouncementTitles,
  persistSavedAnnouncementTitles,
  SAVED_ANNOUNCEMENTS_CHANGED_EVENT,
  SAVED_ANNOUNCEMENTS_STORAGE_KEY,
} from '@/lib/saved-announcements';
import { Calendar, Filter, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/app/hooks/use-toast';

type ResolvedItem = {
  title: string;
  announcement: (typeof allAnnouncements)[number] | null;
};

export default function DashboardSavedAvisos() {
  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const refresh = useCallback(() => {
    setSavedTitles(loadSavedAnnouncementTitles());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_ANNOUNCEMENTS_STORAGE_KEY) refresh();
    };
    window.addEventListener(SAVED_ANNOUNCEMENTS_CHANGED_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_ANNOUNCEMENTS_CHANGED_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  const resolved: ResolvedItem[] = useMemo(
    () => savedTitles.map(title => ({ title, announcement: allAnnouncements.find(a => a.title === title) ?? null })),
    [savedTitles]
  );

  const categoriesInSaved = useMemo(() => {
    const set = new Set<string>();
    for (const { announcement } of resolved) {
      if (announcement) set.add(announcement.category);
    }
    return ['Todos', ...Array.from(set).sort()];
  }, [resolved]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resolved.filter(({ title, announcement }) => {
      if (categoryFilter !== 'Todos' && announcement && announcement.category !== categoryFilter) return false;
      if (!q) return true;
      if (title.toLowerCase().includes(q)) return true;
      if (!announcement) return false;
      return (
        announcement.description.toLowerCase().includes(q) ||
        announcement.location.toLowerCase().includes(q) ||
        announcement.category.toLowerCase().includes(q) ||
        announcement.date.toLowerCase().includes(q)
      );
    });
  }, [resolved, search, categoryFilter]);

  const removeSaved = (title: string) => {
    const next = savedTitles.filter(t => t !== title);
    persistSavedAnnouncementTitles(next);
    setSavedTitles(next);
    toast({ title: 'Quitado de guardados', description: 'Ya no aparecerá en tu lista.' });
  };

  return (
    <div className="px-6 md:px-10 max-w-7xl mx-auto mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="relative w-full sm:max-w-xs sm:flex-1 md:max-w-sm md:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar en guardados…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Buscar en avisos guardados"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(s => !s)}
            aria-expanded={showFilters}
            aria-label={showFilters ? 'Ocultar filtros por categoría' : 'Mostrar filtros por categoría'}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
              showFilters ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filtros
          </button>
        </div>

        {showFilters && categoriesInSaved.length > 1 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {categoriesInSaved.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  categoryFilter === cat ? 'bg-[#B88A44] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ title, announcement }) => (
            <article
              key={title}
              className="group flex flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-48 w-full bg-gray-50">
                {announcement ? (
                  <Image src={announcement.imageUrl} alt={title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">Sin imagen</div>
                )}
                <div className="absolute left-4 top-4 z-10">
                  <span
                    className={`rounded-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm ${announcementCategoryPillClass(
                      announcement?.category ?? 'Aviso'
                    )}`}
                  >
                    {(announcement?.category ?? 'Aviso').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
                <p className="mb-6 line-clamp-2 text-sm font-medium leading-relaxed text-gray-500">
                  {announcement?.description ?? 'Este aviso ya no está en el listado público, pero sigue en tus guardados.'}
                </p>

                <div className="mb-6 mt-auto space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-gray-500">
                    <MapPin className="h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                    <span>{announcement?.location ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-500">
                    <Calendar className="h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                    <span>
                      {announcement ? `${announcement.date}, ${announcement.time}` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-5">
                  {announcement ? (
                    <Link
                      href={`/avisos/${slugify(title)}`}
                      className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-800"
                    >
                      Ver detalles
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-gray-400">Sin enlace</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSaved(title)}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={`Quitar ${title} de guardados`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}

          <Link
            href="/avisos"
            className="flex min-h-[400px] flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-blue-200 bg-blue-50/30 p-8 text-center transition-colors hover:bg-blue-50/50"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-transform group-hover:scale-110">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-blue-600">Explorar más avisos</h3>
            <p className="text-sm font-medium text-blue-500/80">
              Descubre nuevos eventos y avisos de tu congregación
            </p>
          </Link>
        </div>

        {savedTitles.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">
            No tienes avisos guardados. Entra en{' '}
            <Link href="/avisos" className="font-semibold text-blue-600 underline hover:text-blue-700">
              Avisos
            </Link>{' '}
            y pulsa el icono del marcador en un aviso.
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">Ningún resultado con esta búsqueda o filtro.</p>
        ) : null}
    </div>
  );
}
