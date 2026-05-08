'use client';

import { ChevronDown, Library } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReflectionMarkdownPreview } from '@/app/dashboard/biblia/reflection-markdown-preview';
import {
  loadPersonalReflectionsFromStorage,
  PERSONAL_REFLECTIONS_CHANGED_EVENT,
  type StoredPersonalReflection,
} from '@/lib/personal-reflections';

function isProbablyHtml(s: string): boolean {
  const t = s.trim();
  if (!t.startsWith('<')) return false;
  return /<\/?[a-z][\s\S]*>/i.test(t);
}

function htmlToPlainText(html: string): string {
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent || '').replace(/\s+/g, ' ').trim();
}

function plainMarkdownPreview(body: string, max = 140): string {
  const t = body
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function bodyPlainPreview(body: string, max = 140): string {
  if (isProbablyHtml(body)) {
    const t = htmlToPlainText(body);
    if (t.length <= max) return t;
    return `${t.slice(0, max)}…`;
  }
  return plainMarkdownPreview(body, max);
}

function relativeSavedLabel(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

function SanitizedReflectionHtml({ html, className }: { html: string; className?: string }) {
  const [safe, setSafe] = useState('');

  useEffect(() => {
    setSafe(DOMPurify.sanitize(html));
  }, [html]);

  if (!safe) return <div className={className} />;

  return (
    <div
      className={`reflection-saved-html text-sm leading-relaxed text-gray-800 ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

function StoredReflectionBody({ body }: { body: string }) {
  if (isProbablyHtml(body)) {
    return <SanitizedReflectionHtml html={body} />;
  }
  return <ReflectionMarkdownPreview markdown={body} />;
}

export default function DashboardSavedPersonalReflections() {
  const [items, setItems] = useState<StoredPersonalReflection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const refresh = useCallback(() => {
    setItems(loadPersonalReflectionsFromStorage());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(PERSONAL_REFLECTIONS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(PERSONAL_REFLECTIONS_CHANGED_EVENT, onChange);
  }, [refresh]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      const cat = item.category?.trim();
      if (!cat) continue;
      set.add(cat);
    }
    return ['Todas', ...[...set].sort((a, b) => a.localeCompare(b, 'es'))];
  }, [items]);

  const visibleItems = useMemo(() => {
    if (selectedCategory === 'Todas') return items;
    return items.filter(r => (r.category?.trim() ?? '') === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
      <style>{`
        .reflection-saved-html ul { list-style-type: disc; padding-left: 1.25rem; margin: 0.35rem 0; }
        .reflection-saved-html ol { list-style-type: decimal; padding-left: 1.25rem; margin: 0.35rem 0; }
        .reflection-saved-html blockquote { border-left: 4px solid #E5E7EB; padding-left: 0.75rem; color: #6B7280; font-style: italic; margin: 0.35rem 0; }
        .reflection-saved-html img { max-width: 100%; border-radius: 0.5rem; margin-top: 0.35rem; }
        .reflection-saved-html a { color: #2563eb; text-decoration: underline; }
        .reflection-saved-html p { margin: 0 0 0.35em; }
      `}</style>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Library className="h-4 w-4 text-gray-400" aria-hidden />
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Reflexiones guardadas</h2>
      </div>

      {categories.length > 1 ? (
        <div className="mb-4">
          <label htmlFor="saved-reflections-category" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Filtrar por categoría
          </label>
          <select
            id="saved-reflections-category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#B88A44]/50 focus:ring-2 focus:ring-[#B88A44]/20 sm:w-auto"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'Todas' ? 'Todas las categorías' : cat}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {visibleItems.length === 0 ? (
        <p className="text-sm text-gray-400">
          {items.length === 0
            ? 'Aún no hay reflexiones guardadas. Escribe título y contenido, luego usa el botón de guardar en el panel de Biblia o en Notas.'
            : 'No hay reflexiones para la categoría seleccionada.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleItems.map(r => {
            const title = r.title?.trim() || 'Sin título';
            const whenLabel = relativeSavedLabel(r.savedAt);
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 transition-colors hover:bg-white hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 gap-y-1">
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                  {r.verseReference ? (
                    <span className="rounded-full bg-blue-50 px-3 py-0.5 text-[10px] font-bold text-blue-600 shadow-sm">
                      {r.verseReference}
                    </span>
                  ) : null}
                  {r.category ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                      {r.category}
                    </span>
                  ) : null}
                  {r.tags?.length
                    ? r.tags.map((tag, ti) => (
                        <span
                          key={`${r.id}-tag-${ti}`}
                          className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600"
                        >
                          {tag}
                        </span>
                      ))
                    : null}
                </div>
                {whenLabel ? <p className="mt-1 text-[11px] text-gray-400">{whenLabel}</p> : null}
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{bodyPlainPreview(r.body)}</p>
                <details className="group mt-3">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 [&::-webkit-details-marker]:hidden">
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" />
                    Ver reflexión completa
                  </summary>
                  <div className="mt-3 border-t border-gray-100 pt-3 text-left">
                    <StoredReflectionBody body={r.body} />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
