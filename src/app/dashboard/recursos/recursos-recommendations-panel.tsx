'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { resourceItems, slugify } from '@/app/lib/resources-data';
import {
  loadSavedResourceTitles,
  SAVED_RESOURCES_CHANGED_EVENT,
  SAVED_RESOURCES_STORAGE_KEY,
} from '@/lib/saved-resources';
import { toVisualLabel } from '@/lib/visual-labels';

const DASH_REC_RECURSOS_FETCH = 12;
const DASH_REC_RECURSOS_SHOW = 3;

type CatalogItem = (typeof resourceItems)[number];

type ResourceRecommendation = {
  type: 'recurso';
  slug: string;
  title: string;
  category: string;
  badge: string | null;
  link: string;
  score: number;
  reason: string;
};

export default function RecursosRecommendationsPanel() {
  const [recommendedResources, setRecommendedResources] = useState<CatalogItem[]>([]);
  const [savedTitles, setSavedTitles] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setSavedTitles(loadSavedResourceTitles());
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_RESOURCES_STORAGE_KEY || e.key === null) refresh();
    };
    window.addEventListener(SAVED_RESOURCES_CHANGED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_RESOURCES_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/content-recommendations?type=recursos&limit=${DASH_REC_RECURSOS_FETCH}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; recommendations?: ResourceRecommendation[] };
        if (!data.ok || !Array.isArray(data.recommendations)) return;
        const bySlug = new Map(resourceItems.map((r) => [slugify(r.title), r]));
        const mapped = data.recommendations
          .map((rec) => bySlug.get(rec.slug))
          .filter((x): x is CatalogItem => Boolean(x));
        if (!cancelled) setRecommendedResources(mapped.slice(0, DASH_REC_RECURSOS_FETCH));
      } catch {
        // mantener UI estable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const savedSet = useMemo(() => new Set(savedTitles), [savedTitles]);

  const visibleRecommendedResources = useMemo(
    () => recommendedResources.filter((r) => !savedSet.has(r.title)).slice(0, DASH_REC_RECURSOS_SHOW),
    [recommendedResources, savedSet]
  );

  if (visibleRecommendedResources.length === 0) return null;

  return (
    <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-600">Recomendado para ti</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {visibleRecommendedResources.map((item) => (
          <Link
            key={`dashboard-rec-resource-${item.title}`}
            href={`/recursos/${slugify(item.title)}`}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-white"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-[#B88A44]">
              {toVisualLabel(item.badge || item.category)}
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
