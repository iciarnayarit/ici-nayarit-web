'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { recentAnnouncements, slugify } from '@/app/lib/announcements';
import {
  loadSavedAnnouncementTitles,
  SAVED_ANNOUNCEMENTS_CHANGED_EVENT,
  SAVED_ANNOUNCEMENTS_STORAGE_KEY,
} from '@/lib/saved-announcements';
import { toVisualLabel } from '@/lib/visual-labels';

const DASH_REC_AVISOS_FETCH = 12;
const DASH_REC_AVISOS_SHOW = 3;

type AvisoRecommendation = {
  type: 'aviso';
  slug: string;
  title: string;
  category: string;
  score: number;
  reason: string;
};

export default function AvisosRecommendationsPanel() {
  const [recommendedAvisos, setRecommendedAvisos] = useState<(typeof recentAnnouncements)[number][]>([]);
  const [savedTitles, setSavedTitles] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setSavedTitles(loadSavedAnnouncementTitles());
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_ANNOUNCEMENTS_STORAGE_KEY || e.key === null) refresh();
    };
    window.addEventListener(SAVED_ANNOUNCEMENTS_CHANGED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_ANNOUNCEMENTS_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/content-recommendations?type=avisos&limit=${DASH_REC_AVISOS_FETCH}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; recommendations?: AvisoRecommendation[] };
        if (!data.ok || !Array.isArray(data.recommendations)) return;
        const bySlug = new Map(recentAnnouncements.map((a) => [slugify(a.title), a]));
        const mapped = data.recommendations
          .map((rec) => bySlug.get(rec.slug))
          .filter((x): x is (typeof recentAnnouncements)[number] => Boolean(x));
        if (!cancelled) setRecommendedAvisos(mapped.slice(0, DASH_REC_AVISOS_FETCH));
      } catch {
        // mantener UI estable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const savedSet = useMemo(() => new Set(savedTitles), [savedTitles]);

  const uniqueRecommendedAvisos = useMemo(() => {
    const deduped = [...new Map(recommendedAvisos.map((item) => [item.title, item])).values()];
    return deduped.filter((item) => !savedSet.has(item.title)).slice(0, DASH_REC_AVISOS_SHOW);
  }, [recommendedAvisos, savedSet]);

  if (uniqueRecommendedAvisos.length === 0) return null;

  return (
    <section className="mx-auto mb-6 w-full max-w-7xl px-4 sm:px-6 md:px-10">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-600">Recomendado para ti</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {uniqueRecommendedAvisos.map((item) => (
            <Link
              key={`dashboard-rec-${item.title}`}
              href={`/avisos/${slugify(item.title)}`}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-white"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B88A44]">{toVisualLabel(item.category)}</p>
              <p className="mt-1 text-sm font-bold text-gray-900">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
