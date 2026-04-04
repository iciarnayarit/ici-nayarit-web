'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, MapPin, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/app/hooks/use-toast';
import { templeDirectory } from '@/lib/temple-directory';
import { templeLocations } from '@/app/lib/temples-data';
import {
  loadSavedLocalTempleNames,
  loadSavedTempleSlugs,
  persistSavedLocalTempleNames,
  persistSavedTempleSlugs,
  SAVED_LOCAL_TEMPLE_NAMES_KEY,
  SAVED_TEMPLES_CHANGED_EVENT,
  SAVED_TEMPLES_STORAGE_KEY,
} from '@/lib/saved-temples';

function AddTempleDirectoryCard() {
  return (
    <Link
      href="/templos"
      className="group flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A44]/40"
    >
      <div className="mb-4 text-gray-400 transition-transform group-hover:scale-110">
        <Plus className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="mb-1.5 text-sm font-bold text-gray-800">Añadir templo</h3>
      <p className="max-w-[240px] text-[11px] font-medium leading-relaxed tracking-wide text-gray-400">
        Explora el directorio y guarda tus templos favoritos
      </p>
    </Link>
  );
}

export default function DashboardSavedTemples() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [localNames, setLocalNames] = useState<string[]>([]);
  const { toast } = useToast();

  const refresh = useCallback(() => {
    setSlugs(loadSavedTempleSlugs());
    setLocalNames(loadSavedLocalTempleNames());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_TEMPLES_STORAGE_KEY || e.key === SAVED_LOCAL_TEMPLE_NAMES_KEY) refresh();
    };
    window.addEventListener(SAVED_TEMPLES_CHANGED_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_TEMPLES_CHANGED_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  const resolved = useMemo(() => {
    const map = new Map(templeDirectory.map(t => [t.slug, t]));
    return slugs.map(s => map.get(s)).filter((t): t is NonNullable<typeof t> => t != null);
  }, [slugs]);

  const resolvedLocal = useMemo(() => {
    const map = new Map(templeLocations.map(t => [t.nameKey, t]));
    return localNames.map(n => map.get(n)).filter((t): t is NonNullable<typeof t> => t != null);
  }, [localNames]);

  const totalCount = resolved.length + resolvedLocal.length;

  const removeSlug = (slug: string) => {
    const next = slugs.filter(s => s !== slug);
    persistSavedTempleSlugs(next);
    setSlugs(next);
    toast({ title: 'Templo quitado', description: 'Se eliminó de tus guardados.' });
  };

  const removeLocalName = (nameKey: string) => {
    const next = localNames.filter(n => n !== nameKey);
    persistSavedLocalTempleNames(next);
    setLocalNames(next);
    toast({ title: 'Templo quitado', description: 'Se eliminó de tus guardados.' });
  };

  if (totalCount === 0) {
    return (
      <section id="templos-guardados-dashboard" className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-gray-400">
          <Bookmark className="h-4 w-4 shrink-0" aria-hidden />
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Templos guardados</h2>
        </div>
        <p className="text-sm text-gray-500">
          Aún no tienes templos guardados. Pulsa el icono del marcador en el directorio público para añadirlos aquí.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AddTempleDirectoryCard />
        </div>
      </section>
    );
  }

  return (
    <section id="templos-guardados-dashboard" className="mb-10 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Bookmark className="h-4 w-4 text-[#B88A44]" aria-hidden />
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Templos guardados</h2>
        <span className="rounded-full bg-[#B88A44]/10 px-2.5 py-0.5 text-xs font-bold text-[#B88A44]">
          {totalCount}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resolvedLocal.map(temple => (
          <article
            key={`local-${temple.nameKey}`}
            className="flex flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <Link
              href={temple.shareMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex h-40 w-full shrink-0 items-center justify-center bg-gradient-to-br from-[#B88A44]/15 to-amber-50"
            >
              <MapPin className="h-12 w-12 text-[#B88A44]/35" aria-hidden />
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#B88A44]/80">ICIAR Nayarit</p>
              <h3 className="text-lg font-bold tracking-tight text-gray-900">{temple.nameKey}</h3>
              <div className="mt-2 flex items-start gap-2 text-[13px] font-medium leading-snug text-gray-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <span>{temple.addressKey}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                <Link
                  href="/templos"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Ver en directorio
                </Link>
                <button
                  type="button"
                  onClick={() => removeLocalName(temple.nameKey)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`Quitar ${temple.nameKey} de guardados`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
        {resolved.map(temple => (
          <article
            key={temple.slug}
            className="flex flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={`/dashboard/templos/${temple.slug}`} className="relative block h-40 w-full shrink-0 bg-gray-100">
              <Image
                src={temple.image}
                alt={temple.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-bold tracking-tight text-gray-900">{temple.name}</h3>
              <div className="mt-2 flex items-start gap-2 text-[13px] font-medium leading-snug text-gray-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <span>{temple.location}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${temple.statusColor}`} />
                  <span className="text-[11px] font-semibold text-gray-600">{temple.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/templos/${temple.slug}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Ver detalles
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeSlug(temple.slug)}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={`Quitar ${temple.name} de guardados`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        <AddTempleDirectoryCard />
      </div>

      {slugs.length > resolved.length || localNames.length > resolvedLocal.length ? (
        <p className="text-center text-xs text-gray-400">
          Algunos templos guardados ya no están en el directorio y no se muestran.
        </p>
      ) : null}
    </section>
  );
}
