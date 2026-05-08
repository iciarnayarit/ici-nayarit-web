'use client';

import {
  Bold,
  Clock,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  PlusCircle,
  Quote,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { useToast } from '@/app/hooks/use-toast';
import { prependPersonalReflection } from '@/lib/personal-reflections';

const REFLECTION_DRAFT_STORAGE_KEY = 'dashboardBibliaReflectionDraft';

type ReflectionSaveStatus = 'local' | 'saving' | 'saved';

function parseReflectionDraft(raw: string | null): { title: string; body: string } {
  if (raw == null || raw === '') return { title: '', body: '' };
  try {
    const o = JSON.parse(raw) as unknown;
    if (o && typeof o === 'object' && 'body' in o && typeof (o as { body: unknown }).body === 'string') {
      const rec = o as { title?: unknown; body: string };
      return {
        title: typeof rec.title === 'string' ? rec.title : '',
        body: rec.body,
      };
    }
  } catch {
    /* texto plano heredado */
  }
  return { title: '', body: raw };
}

function serializeReflectionDraft(title: string, body: string): string {
  return JSON.stringify({ title, body });
}

function isEditorEmpty(html: string): boolean {
  const stripped = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<div><\/div>/gi, '')
    .replace(/<p><\/p>/gi, '')
    .replace(/&nbsp;/gi, ' ');
  const text = stripped.replace(/<[^>]+>/g, '').trim();
  return text === '';
}

function htmlWordCount(html: string): number {
  if (typeof document === 'undefined') {
    const text = html.replace(/<[^>]+>/g, ' ').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }
  const d = document.createElement('div');
  d.innerHTML = html;
  const text = (d.textContent || '').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export type PersonalReflectionsCardProps = {
  verseReference: string | null;
};

export default function PersonalReflectionsCard({ verseReference }: PersonalReflectionsCardProps) {
  const [reflectionTitle, setReflectionTitle] = useState('');
  const [reflectionBodyHtml, setReflectionBodyHtml] = useState('');
  const [reflectionSaveStatus, setReflectionSaveStatus] = useState<ReflectionSaveStatus>('local');
  const [mounted, setMounted] = useState(false);
  const [clockLabel, setClockLabel] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  const reflectionSaveSkipFirst = useRef(true);
  /** `window.setTimeout` devuelve `number` en el navegador (no `NodeJS.Timeout`). */
  const reflectionSavedTimer = useRef<number | null>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tick = () => {
      setClockLabel(
        new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REFLECTION_DRAFT_STORAGE_KEY);
      const { title, body } = parseReflectionDraft(raw);
      setReflectionTitle(title);
      setReflectionBodyHtml(body);
      requestAnimationFrame(() => {
        if (contentEditableRef.current) contentEditableRef.current.innerHTML = body;
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (reflectionSaveSkipFirst.current) {
      reflectionSaveSkipFirst.current = false;
      return;
    }
    setReflectionSaveStatus('saving');
    const debounceId = window.setTimeout(() => {
      try {
        localStorage.setItem(
          REFLECTION_DRAFT_STORAGE_KEY,
          serializeReflectionDraft(reflectionTitle, reflectionBodyHtml)
        );
        setReflectionSaveStatus('saved');
        if (reflectionSavedTimer.current) window.clearTimeout(reflectionSavedTimer.current);
        reflectionSavedTimer.current = window.setTimeout(() => {
          setReflectionSaveStatus('local');
          reflectionSavedTimer.current = null;
        }, 2200);
      } catch {
        setReflectionSaveStatus('local');
      }
    }, 450);
    return () => window.clearTimeout(debounceId);
  }, [reflectionTitle, reflectionBodyHtml]);

  useEffect(() => {
    return () => {
      if (reflectionSavedTimer.current) window.clearTimeout(reflectionSavedTimer.current);
    };
  }, []);

  const palabraCount = useMemo(() => htmlWordCount(reflectionBodyHtml), [reflectionBodyHtml]);

  const palabrasLabel =
    palabraCount === 0 ? '0 palabras' : palabraCount === 1 ? '1 palabra' : `${palabraCount} palabras`;

  const reflectionStatusLabel =
    reflectionSaveStatus === 'saving'
      ? 'Guardando…'
      : reflectionSaveStatus === 'saved'
        ? 'Guardado'
        : 'Borrador local';

  const syncHtmlFromEditor = useCallback(() => {
    if (contentEditableRef.current) {
      setReflectionBodyHtml(contentEditableRef.current.innerHTML);
    }
  }, []);

  const handleFormat = useCallback(
    (command: string, value: string = '') => {
      contentEditableRef.current?.focus();
      document.execCommand(command, false, value);
      syncHtmlFromEditor();
      contentEditableRef.current?.focus();
    },
    [syncHtmlFromEditor]
  );

  const saveCurrentSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0).cloneRange());
    } else {
      setSavedSelection(null);
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (!savedSelection) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedSelection);
  }, [savedSelection]);

  const confirmLink = useCallback(() => {
    const trimmed = linkInput.trim();
    if (!trimmed) {
      setLinkPopoverOpen(false);
      return;
    }
    restoreSelection();
    document.execCommand('createLink', false, trimmed);
    syncHtmlFromEditor();
    setLinkPopoverOpen(false);
    setLinkInput('');
    contentEditableRef.current?.focus();
  }, [linkInput, restoreSelection, syncHtmlFromEditor]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        const base64 = event.target?.result as string;
        restoreSelection();
        document.execCommand('insertImage', false, base64);
        syncHtmlFromEditor();
        contentEditableRef.current?.focus();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [restoreSelection, syncHtmlFromEditor]
  );

  const saveReflectionAndNew = useCallback(() => {
    const titleTrim = reflectionTitle.trim();
    if (!titleTrim) {
      toast({
        title: 'Falta el título',
        description: 'Añade un título a la reflexión.',
        variant: 'destructive',
      });
      return;
    }
    if (isEditorEmpty(reflectionBodyHtml)) {
      toast({
        title: 'Falta el contenido',
        description: 'Escribe el cuerpo de tu reflexión antes de guardar.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      prependPersonalReflection({
        id,
        title: titleTrim,
        body: reflectionBodyHtml,
        category: 'devocional',
        verseReference,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(REFLECTION_DRAFT_STORAGE_KEY, serializeReflectionDraft('', ''));
      setReflectionTitle('');
      setReflectionBodyHtml('');
      if (contentEditableRef.current) contentEditableRef.current.innerHTML = '';
      setReflectionSaveStatus('saved');
      if (reflectionSavedTimer.current) window.clearTimeout(reflectionSavedTimer.current);
      reflectionSavedTimer.current = window.setTimeout(() => {
        setReflectionSaveStatus('local');
        reflectionSavedTimer.current = null;
      }, 2200);
      toast({ title: 'Reflexión guardada', description: 'Ya puedes escribir una nueva reflexión.' });
      queueMicrotask(() => contentEditableRef.current?.focus());
    } catch {
      toast({ title: 'No se pudo guardar', variant: 'destructive' });
    }
  }, [reflectionTitle, reflectionBodyHtml, verseReference, toast]);

  const canSave = reflectionTitle.trim().length > 0 && !isEditorEmpty(reflectionBodyHtml);

  return (
    <div
      className="flex flex-col rounded-2xl border border-gray-100 bg-[#FAFAFA] p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8"
      onMouseDown={e => {
        const t = e.target as HTMLElement;
        if (t.closest('[data-reflection-toolbar]')) e.preventDefault();
      }}
    >
      <style>{`
        .reflection-wysiwyg ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .reflection-wysiwyg ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .reflection-wysiwyg blockquote { border-left: 4px solid #E5E7EB; padding-left: 1rem; color: #6B7280; font-style: italic; margin: 0.5rem 0; }
        .reflection-wysiwyg img { max-width: 100%; border-radius: 0.75rem; margin-top: 0.5rem; }
        .reflection-wysiwyg a { color: #2563eb; text-decoration: underline; }
        .reflection-wysiwyg p { min-height: 1.5em; margin: 0 0 0.25em; }
        .reflection-wysiwyg p:last-child { margin-bottom: 0; }
      `}</style>

      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900">Reflexiones personales</h3>
          <span
            className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
              reflectionSaveStatus === 'saved'
                ? 'text-emerald-600'
                : reflectionSaveStatus === 'saving'
                  ? 'text-amber-600'
                  : 'text-gray-400'
            }`}
            aria-live="polite"
          >
            {reflectionStatusLabel}
          </span>
        </div>

        <div>
          <label
            htmlFor="reflection-title-input"
            className="mb-2 block text-[9px] font-black uppercase tracking-widest text-gray-400"
          >
            Título de la reflexión
          </label>
          <input
            id="reflection-title-input"
            type="text"
            value={reflectionTitle}
            onChange={e => setReflectionTitle(e.target.value)}
            placeholder="Ej: El poder de la palabra creadora…"
            className="w-full border-0 border-b-2 border-gray-200 bg-transparent pb-3 text-xl font-bold text-gray-900 placeholder:text-gray-200 transition-colors focus:border-blue-500 focus:outline-none focus:ring-0 sm:text-2xl"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div
            data-reflection-toolbar
            className="-mx-px flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-2 sm:overflow-x-visible sm:px-5 sm:py-3 md:gap-3 [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              title="Negrita"
              className="shrink-0 touch-manipulation rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:p-1.5"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleFormat('bold')}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Cursiva"
              className="shrink-0 touch-manipulation rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:p-1.5"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleFormat('italic')}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Lista"
              className="shrink-0 touch-manipulation rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:p-1.5"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleFormat('insertUnorderedList')}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Cita"
              className="shrink-0 touch-manipulation rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:p-1.5"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleFormat('formatBlock', 'blockquote')}
            >
              <Quote className="h-4 w-4" />
            </button>
            <div className="mx-0.5 hidden h-5 w-px bg-gray-200 sm:block" aria-hidden />
            <Popover
              open={linkPopoverOpen}
              onOpenChange={open => {
                setLinkPopoverOpen(open);
                if (open) {
                  saveCurrentSelection();
                  setLinkInput('https://');
                } else setLinkInput('');
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="Enlace"
                  className="shrink-0 touch-manipulation rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:p-1.5"
                  onMouseDown={e => {
                    e.preventDefault();
                    saveCurrentSelection();
                  }}
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-xl border-gray-100 p-4 shadow-xl"
                sideOffset={12}
              >
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Añadir enlace</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="url"
                      value={linkInput}
                      onChange={e => setLinkInput(e.target.value)}
                      placeholder="https://..."
                      className="min-h-[40px] min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          confirmLink();
                        } else if (e.key === 'Escape') setLinkPopoverOpen(false);
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={confirmLink}
                      className="min-h-[40px] shrink-0 touch-manipulation rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 sm:py-1.5"
                    >
                      Insertar
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              title="Imagen"
              className="shrink-0 touch-manipulation rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:p-1.5"
              onMouseDown={e => {
                e.preventDefault();
                saveCurrentSelection();
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-1 text-gray-400">
              <Clock className="h-3 w-3 shrink-0" aria-hidden />
              <span className="max-w-[5.5rem] truncate text-[10px] font-medium tabular-nums sm:max-w-none sm:text-[11px]">
                {mounted ? clockLabel : ''}
              </span>
            </div>
          </div>

          <div className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            {isEditorEmpty(reflectionBodyHtml) && (
              <p className="pointer-events-none absolute left-6 top-6 z-0 select-none text-base font-medium text-gray-300">
                Escribe lo que Dios puso en tu corazón…
              </p>
            )}
            <div
              ref={contentEditableRef}
              role="textbox"
              tabIndex={0}
              contentEditable
              suppressContentEditableWarning
              onInput={syncHtmlFromEditor}
              onBlur={syncHtmlFromEditor}
              className="reflection-wysiwyg relative z-[1] min-h-[10rem] w-full overflow-x-hidden bg-transparent text-base font-medium leading-relaxed text-gray-700 outline-none sm:min-h-[12rem]"
              lang="es"
              aria-label="Cuerpo de la reflexión"
            />
          </div>

          <div
            data-reflection-toolbar
            className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/80 pt-4"
          >
            <button
              type="button"
              onClick={saveReflectionAndNew}
              disabled={!canSave}
              title="Guarda en este dispositivo y empieza una reflexión nueva"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-45"
            >
              <PlusCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="hidden min-[380px]:inline">Guardar y nueva reflexión</span>
              <span className="min-[380px]:hidden">Guardar y nueva</span>
            </button>
            <span className="text-xs font-medium text-gray-400">{palabrasLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
