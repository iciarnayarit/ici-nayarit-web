'use client';

import dynamic from 'next/dynamic';
import { Share2, Copy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import DailyVerseHero from '@/app/dashboard/biblia/daily-verse-hero';
import { useToast } from '@/app/hooks/use-toast';
import { getDailyVerseEs, type DailyVerseEs } from '@/lib/daily-verse-es';

const DashboardSavedVerses = dynamic(() => import('@/app/dashboard/biblia/dashboard-saved-verses'), {
  loading: () => <div className="min-h-[160px] animate-pulse rounded-2xl bg-white shadow-sm" />,
});

const PersonalReflectionsCard = dynamic(() => import('@/app/dashboard/biblia/personal-reflections-card'), {
  loading: () => <div className="min-h-[180px] animate-pulse rounded-2xl bg-white shadow-sm" />,
});

const DashboardSavedPersonalReflections = dynamic(
  () => import('@/app/dashboard/biblia/dashboard-saved-personal-reflections'),
  {
    loading: () => <div className="min-h-[220px] animate-pulse rounded-2xl bg-white shadow-sm" />,
  }
);

const CONTEXT_TAGS_STORAGE_KEY = 'dashboardBibliaContextTags';
const DEFAULT_CONTEXT_TAGS = ['Esperanza', 'Futuro', 'Promesa', 'Confianza'];

function normalizeTagInput(raw: string): string {
  return raw.trim().replace(/^#+/u, '');
}

export default function DashboardPage() {
  const [contextTags, setContextTags] = useState<string[]>(DEFAULT_CONTEXT_TAGS);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [activeHeroVerse, setActiveHeroVerse] = useState<DailyVerseEs | null>(null);
  const skipNextPersist = useRef(true);
  const newTagInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setActiveHeroVerse(getDailyVerseEs(new Date()));
  }, []);

  const verseShareText = useCallback((v: DailyVerseEs) => `"${v.text}" — ${v.reference}`, []);

  const handleShareVerse = useCallback(async () => {
    if (!activeHeroVerse) return;
    const text = verseShareText(activeHeroVerse);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Versículo — ICIAR Nayarit', text });
        toast({ title: 'Compartido' });
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        const msg = e instanceof Error ? e.message : '';
        if (msg === 'Share canceled') return;
        toast({ title: 'No se pudo compartir', variant: 'destructive' });
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast({ title: 'Copiado al portapapeles', description: 'Tu navegador no permite compartir desde aquí.' });
      } catch {
        toast({ title: 'No se pudo copiar', variant: 'destructive' });
      }
    }
  }, [activeHeroVerse, toast, verseShareText]);

  const handleCopyVerse = useCallback(async () => {
    if (!activeHeroVerse) return;
    try {
      await navigator.clipboard.writeText(verseShareText(activeHeroVerse));
      toast({ title: 'Copiado', description: 'Versículo en el portapapeles.' });
    } catch {
      toast({ title: 'No se pudo copiar', variant: 'destructive' });
    }
  }, [activeHeroVerse, toast, verseShareText]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONTEXT_TAGS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every((x): x is string => typeof x === 'string')) {
        setContextTags(parsed.length ? parsed : DEFAULT_CONTEXT_TAGS);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(CONTEXT_TAGS_STORAGE_KEY, JSON.stringify(contextTags));
    } catch {
      /* ignore */
    }
  }, [contextTags]);

  useEffect(() => {
    if (addingTag) newTagInputRef.current?.focus();
  }, [addingTag]);

  const commitNewTag = () => {
    const label = normalizeTagInput(newTagValue);
    if (!label) {
      setNewTagValue('');
      setAddingTag(false);
      return;
    }
    const exists = contextTags.some(t => t.toLowerCase() === label.toLowerCase());
    setNewTagValue('');
    setAddingTag(false);
    if (exists) return;
    setContextTags(prev => [...prev, label]);
  };

  const cancelAddTag = () => {
    setNewTagValue('');
    setAddingTag(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] pb-12">

      <div
        className="mx-auto max-w-7xl space-y-5 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:space-y-6 sm:px-6 sm:pt-6 md:p-8 md:px-10"
        lang="es"
      >
        <DashboardBibliaReadingToolbar />

        <DashboardSavedVerses />

        <DailyVerseHero onActiveVerseChange={setActiveHeroVerse} />

        <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            disabled={!activeHeroVerse}
            onClick={() => void handleShareVerse()}
            className="flex min-h-[44px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 sm:flex-none"
          >
            <Share2 className="w-4 h-4" /> Compartir
          </button>
          <button
            type="button"
            disabled={!activeHeroVerse}
            onClick={() => void handleCopyVerse()}
            className="flex min-h-[44px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 sm:flex-none"
          >
            <Copy className="w-4 h-4" /> Copiar
          </button>
        </div>

        <PersonalReflectionsCard verseReference={activeHeroVerse?.reference ?? null} />

        <DashboardSavedPersonalReflections />

        <section>
            <button
              type="button"
              onClick={() => setAddingTag(true)}
              className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 hover:text-gray-600 transition-colors w-full"
            >
              Etiquetas contextuales
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {contextTags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm"
                >
                  #{tag}
                </span>
              ))}
              {addingTag ? (
                <span className="inline-flex items-center gap-1 border border-gray-200 bg-white rounded-full pl-3 pr-1 py-1 shadow-sm">
                  <span className="text-blue-600 text-xs font-bold">#</span>
                  <input
                    ref={newTagInputRef}
                    type="text"
                    value={newTagValue}
                    onChange={e => setNewTagValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitNewTag();
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelAddTag();
                      }
                    }}
                    placeholder="Pulsa Enter"
                    className="w-28 sm:w-36 text-xs font-semibold text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
                    maxLength={32}
                    aria-label="Nueva etiqueta"
                  />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingTag(true)}
                  className="border border-gray-200 bg-white text-gray-500 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  + Añadir etiqueta
                </button>
              )}
            </div>
        </section>
      </div>
    </div>
  );
}
