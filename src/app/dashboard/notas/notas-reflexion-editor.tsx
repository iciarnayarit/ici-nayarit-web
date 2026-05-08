'use client';

import {
  Bold,
  Clock,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Plus,
  Quote,
  Save,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { useToast } from '@/app/hooks/use-toast';
import { prependPersonalReflection } from '@/lib/personal-reflections';
import { stripHtmlToText, type NlpClassification } from '@/lib/nlp-classifier';

const NOTAS_DRAFT_STORAGE_KEY = 'dashboardNotasReflectionDraft';

type DraftShape = { title: string; body: string; tags: string[] };
type ClassificationState = {
  loading: boolean;
  data: NlpClassification | null;
};
type SaveUiState = 'idle' | 'saving' | 'saved' | 'error';

function parseDraft(raw: string | null): DraftShape {
  if (raw == null || raw === '') return { title: '', body: '', tags: [] };
  try {
    const o = JSON.parse(raw) as unknown;
    if (o && typeof o === 'object' && 'body' in o && typeof (o as { body: unknown }).body === 'string') {
      const rec = o as { title?: unknown; body: string; tags?: unknown };
      const tags =
        Array.isArray(rec.tags) && rec.tags.every((t): t is string => typeof t === 'string') ? rec.tags : [];
      return {
        title: typeof rec.title === 'string' ? rec.title : '',
        body: rec.body,
        tags,
      };
    }
  } catch {
    /* ignore */
  }
  return { title: '', body: '', tags: [] };
}

function serializeDraft(title: string, body: string, tags: string[]): string {
  return JSON.stringify({ title, body, tags });
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

export default function NotasReflexionEditor() {
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagInputVisible, setTagInputVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [clockLabel, setClockLabel] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [classification, setClassification] = useState<ClassificationState>({
    loading: false,
    data: null,
  });
  const [saveUiState, setSaveUiState] = useState<SaveUiState>('idle');

  const draftSkipFirst = useRef(true);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tick = () => {
      const t = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
      setClockLabel(`Ahora ${t}`);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTAS_DRAFT_STORAGE_KEY);
      const { title: t, body, tags: tg } = parseDraft(raw);
      setTitle(t);
      setBodyHtml(body);
      setTags(tg);
      requestAnimationFrame(() => {
        if (contentEditableRef.current) contentEditableRef.current.innerHTML = body;
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (draftSkipFirst.current) {
      draftSkipFirst.current = false;
      return;
    }
    const debounceId = window.setTimeout(() => {
      try {
        localStorage.setItem(NOTAS_DRAFT_STORAGE_KEY, serializeDraft(title, bodyHtml, tags));
      } catch {
        /* ignore */
      }
    }, 450);
    return () => window.clearTimeout(debounceId);
  }, [title, bodyHtml, tags]);

  useEffect(() => {
    if (tagInputVisible) tagInputRef.current?.focus();
  }, [tagInputVisible]);

  useEffect(() => {
    const plainBody = stripHtmlToText(bodyHtml);
    const combined = `${title.trim()} ${plainBody}`.trim();
    if (combined.length < 24) {
      setClassification(prev => ({ ...prev, loading: false }));
      return;
    }

    let cancelled = false;
    const id = window.setTimeout(async () => {
      setClassification(prev => ({ ...prev, loading: true }));
      try {
        const res = await fetch('/api/nlp/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body: bodyHtml, maxTags: 4 }),
        });
        if (!res.ok || cancelled) {
          setClassification(prev => ({ ...prev, loading: false }));
          return;
        }
        const data = (await res.json()) as { ok?: boolean; classification?: NlpClassification };
        if (!data.ok || !data.classification || cancelled) {
          setClassification(prev => ({ ...prev, loading: false }));
          return;
        }
        setClassification({ loading: false, data: data.classification });
      } catch {
        if (!cancelled) {
          setClassification(prev => ({ ...prev, loading: false }));
        }
      }
    }, 480);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [title, bodyHtml]);

  const syncHtmlFromEditor = useCallback(() => {
    if (contentEditableRef.current) setBodyHtml(contentEditableRef.current.innerHTML);
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

  const limpiar = useCallback(() => {
    setTitle('');
    setBodyHtml('');
    setTags([]);
    setTagInput('');
    setTagInputVisible(false);
    if (contentEditableRef.current) contentEditableRef.current.innerHTML = '';
    try {
      localStorage.removeItem(NOTAS_DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    toast({ title: 'Borrador limpiado' });
  }, [toast]);

  const guardarNota = useCallback(() => {
    const titleTrim = title.trim();
    if (!titleTrim) {
      toast({ title: 'Falta el título', description: 'Añade un título a la reflexión.', variant: 'destructive' });
      return;
    }
    if (isEditorEmpty(bodyHtml)) {
      toast({
        title: 'Falta el contenido',
        description: 'Escribe el cuerpo de tu nota antes de guardar.',
        variant: 'destructive',
      });
      return;
    }
    const previousDraft: DraftShape = {
      title,
      body: bodyHtml,
      tags: [...tags],
    };
    const previousStoredReflections = localStorage.getItem('dashboardBibliaPersonalReflections');
    setSaveUiState('saving');
    // Optimistic UI: limpia editor y muestra "guardado" inmediatamente.
    setTitle('');
    setBodyHtml('');
    setTags([]);
    setTagInput('');
    setTagInputVisible(false);
    if (contentEditableRef.current) contentEditableRef.current.innerHTML = '';
    try {
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      prependPersonalReflection({
        id,
        title: titleTrim,
        body: bodyHtml,
        verseReference: null,
        savedAt: new Date().toISOString(),
        category: classification.data?.category ?? 'devocional',
        tags: tags.length ? tags : undefined,
      });
      localStorage.removeItem(NOTAS_DRAFT_STORAGE_KEY);
      setSaveUiState('saved');
      toast({ title: 'Nota guardada', description: 'Tu nota quedó guardada en este dispositivo.' });
      queueMicrotask(() => contentEditableRef.current?.focus());
      window.setTimeout(() => {
        setSaveUiState((state) => (state === 'saved' ? 'idle' : state));
      }, 1800);
    } catch {
      // Rollback visual + de almacenamiento si falla persistencia.
      if (previousStoredReflections === null) {
        localStorage.removeItem('dashboardBibliaPersonalReflections');
      } else {
        localStorage.setItem('dashboardBibliaPersonalReflections', previousStoredReflections);
      }
      setTitle(previousDraft.title);
      setBodyHtml(previousDraft.body);
      setTags(previousDraft.tags);
      if (contentEditableRef.current) contentEditableRef.current.innerHTML = previousDraft.body;
      setSaveUiState('error');
      toast({ title: 'No se pudo guardar', variant: 'destructive' });
      window.setTimeout(() => {
        setSaveUiState((state) => (state === 'error' ? 'idle' : state));
      }, 2200);
    }
  }, [title, bodyHtml, tags, classification.data?.category, toast]);

  const canSave = title.trim().length > 0 && !isEditorEmpty(bodyHtml) && saveUiState !== 'saving';

  const commitTag = useCallback(() => {
    const label = tagInput.trim().replace(/^#+/u, '');
    setTagInput('');
    if (!label) {
      setTagInputVisible(false);
      return;
    }
    if (tags.some(t => t.toLowerCase() === label.toLowerCase())) {
      setTagInputVisible(false);
      return;
    }
    setTags(prev => [...prev, label]);
    setTagInputVisible(false);
  }, [tagInput, tags]);

  const removeTag = useCallback((index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  }, []);

  const applySuggestedTags = useCallback(() => {
    const suggestions = classification.data?.suggestedTags ?? [];
    if (suggestions.length === 0) return;
    setTags(prev => {
      const existing = new Set(prev.map(t => t.toLowerCase()));
      const merged = [...prev];
      for (const tag of suggestions) {
        const normalized = tag.trim();
        if (!normalized) continue;
        if (existing.has(normalized.toLowerCase())) continue;
        merged.push(normalized);
        existing.add(normalized.toLowerCase());
      }
      return merged.slice(0, 12);
    });
  }, [classification.data]);

  const toolbarBtn =
    'shrink-0 touch-manipulation rounded-lg p-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A44]/30 sm:p-2';

  const wysiwygStyles = useMemo(
    () => `
    .notas-wysiwyg ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
    .notas-wysiwyg ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5rem; }
    .notas-wysiwyg blockquote { border-left: 4px solid #E5E7EB; padding-left: 1rem; color: #6B7280; font-style: italic; margin: 0.5rem 0; }
    .notas-wysiwyg img { max-width: 100%; border-radius: 0.75rem; margin-top: 0.5rem; }
    .notas-wysiwyg a { color: #2563eb; text-decoration: underline; }
    .notas-wysiwyg p { min-height: 1.5em; margin: 0 0 0.25em; }
    .notas-wysiwyg p:last-child { margin-bottom: 0; }
  `,
    []
  );

  return (
    <div
      className="w-full"
      onMouseDown={e => {
        const t = e.target as HTMLElement;
        if (t.closest('[data-notas-toolbar]')) e.preventDefault();
      }}
    >
      <style>{wysiwygStyles}</style>

      <div className="mb-6 flex w-full flex-col-reverse gap-2 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={limpiar}
          className="min-h-[44px] w-full touch-manipulation rounded-xl border border-red-400 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 sm:w-auto"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={guardarNota}
          disabled={!canSave}
          className={`inline-flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-45 sm:w-auto ${
            saveUiState === 'saved'
              ? 'bg-emerald-600 hover:bg-emerald-600'
              : saveUiState === 'error'
                ? 'bg-red-600 hover:bg-red-600'
                : 'bg-[#B88A44] hover:bg-[#a67c3c]'
          }`}
        >
          <Save className="h-4 w-4 shrink-0" aria-hidden />
          {saveUiState === 'saving'
            ? 'Guardando...'
            : saveUiState === 'saved'
              ? 'Guardado'
              : saveUiState === 'error'
                ? 'Reintentable'
                : 'Guardar nota'}
        </button>
      </div>

      <div className="mb-6">
        <label
          htmlFor="notas-titulo"
          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500"
        >
          Título de la reflexión
        </label>
        <input
          id="notas-titulo"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: El poder de la palabra creadora…"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-shadow focus:border-[#B88A44]/50 focus:ring-2 focus:ring-[#B88A44]/20"
          autoComplete="off"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div
          data-notas-toolbar
          className="-mx-px flex max-w-full flex-nowrap items-center gap-0.5 overflow-x-auto border-b border-gray-200 bg-gray-50/80 px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-1 sm:overflow-x-visible sm:px-4 sm:py-2.5 [&::-webkit-scrollbar]:hidden"
        >
          <span className="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-500">Formato</span>
          <button type="button" title="Negrita" className={toolbarBtn} onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('bold')}>
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" title="Cursiva" className={toolbarBtn} onMouseDown={e => e.preventDefault()} onClick={() => handleFormat('italic')}>
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Lista"
            className={toolbarBtn}
            onMouseDown={e => e.preventDefault()}
            onClick={() => handleFormat('insertUnorderedList')}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Cita"
            className={toolbarBtn}
            onMouseDown={e => e.preventDefault()}
            onClick={() => handleFormat('formatBlock', 'blockquote')}
          >
            <Quote className="h-4 w-4" />
          </button>
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
                className={toolbarBtn}
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
                    className="min-h-[40px] min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#B88A44] focus:outline-none focus:ring-1 focus:ring-[#B88A44]/30"
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
                    className="min-h-[40px] shrink-0 touch-manipulation rounded-lg bg-[#B88A44] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#a67c3c] sm:py-1.5"
                  >
                    Insertar
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            type="button"
            title="Imagen"
            className={toolbarBtn}
            onMouseDown={e => {
              e.preventDefault();
              saveCurrentSelection();
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-1 text-gray-500">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            <span className="max-w-[9rem] truncate text-xs font-medium tabular-nums sm:max-w-none">
              {mounted ? clockLabel : ''}
            </span>
          </div>
        </div>

        <div className="relative min-h-[240px] bg-white p-4 sm:min-h-[280px] sm:p-6">
          {isEditorEmpty(bodyHtml) && (
            <p className="pointer-events-none absolute left-4 top-4 z-0 select-none text-base text-gray-400 sm:left-6 sm:top-6">
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
            className="notas-wysiwyg relative z-[1] max-h-[min(50vh,24rem)] min-h-[200px] w-full overflow-y-auto overflow-x-hidden bg-transparent text-base leading-relaxed text-gray-800 outline-none sm:max-h-[min(55vh,28rem)] sm:min-h-[220px]"
            lang="es"
            aria-label="Cuerpo de la nota"
          />
        </div>
      </div>

      <div className="mt-8">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Etiquetas</label>
        {classification.data ? (
          <div className="mb-2 rounded-xl border border-[#E7D9BD] bg-[#FCF7ED] px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#7A5A24]">
                NLP: <span className="uppercase">{classification.data.category}</span> ({Math.round(classification.data.confidence * 100)}%)
              </p>
              <button
                type="button"
                onClick={applySuggestedTags}
                className="rounded-md bg-[#B88A44] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#a67c3c]"
              >
                Aplicar etiquetas sugeridas
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#7A5A24]">{classification.data.reason}</p>
          </div>
        ) : null}
        {classification.loading ? <p className="mb-2 text-[11px] text-gray-500">Analizando contenido con NLP...</p> : null}
        <div className="flex min-h-[3.25rem] flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                aria-label={`Quitar etiqueta ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {tagInputVisible ? (
            <input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitTag();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setTagInput('');
                  setTagInputVisible(false);
                }
              }}
              onBlur={() => {
                if (tagInput.trim()) commitTag();
                else setTagInputVisible(false);
              }}
              placeholder="Nueva etiqueta"
              className="min-w-[8rem] flex-1 rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:border-[#B88A44]/50"
              maxLength={40}
            />
          ) : (
            <button
              type="button"
              onClick={() => setTagInputVisible(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-transparent px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Añadir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
