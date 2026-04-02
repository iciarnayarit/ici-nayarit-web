'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, BookOpen, LayoutGrid, Clock, ArrowRight, Keyboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BIBLE_BOOKS = [
    "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio", "Josué",
    "Jueces", "Rut", "1 Samuel", "2 Samuel", "1 Reyes", "2 Reyes",
    "1 Crónicas", "2 Crónicas", "Esdras", "Nehemías", "Ester", "Job",
    "Salmos", "Proverbios", "Eclesiastés", "Cantares", "Isaías",
    "Jeremías", "Lamentaciones", "Ezequiel", "Daniel", "Oseas", "Joel",
    "Amós", "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc", "Sofonías",
    "Hageo", "Zacarías", "Malaquías", "Mateo", "Marcos", "Lucas", "Juan",
    "Hechos", "Romanos", "1 Corintios", "2 Corintios", "Gálatas",
    "Efesios", "Filipenses", "Colosenses", "1 Tesalonicenses",
    "2 Tesalonicenses", "1 Timoteo", "2 Timoteo", "Tito", "Filemón",
    "Hebreos", "Santiago", "1 Pedro", "2 Pedro", "1 Juan", "2 Juan",
    "3 Juan", "Judas", "Apocalipsis",
];

const SECTIONS = [
    {
        label: 'Biblia', href: '/biblia', desc: 'Explora la Palabra de Dios',
        icon: '📖', color: 'text-amber-600  bg-amber-50',
        keywords: ['biblia', 'palabra', 'escritura', 'versiculo', 'versiculos', 'capitulo', 'capitulos',
                   'testamento', 'nuevo testamento', 'antiguo testamento', 'reina valera', 'lectura',
                   'libro', 'libros', 'texto', 'buscar', 'texto biblico', 'sagradas escrituras'],
    },
    {
        label: 'Planes', href: '/planes', desc: 'Planes de lectura bíblica',
        icon: '📅', color: 'text-blue-600   bg-blue-50',
        keywords: ['planes', 'plan', 'lectura', 'devocional', 'devocionales', 'guardados', 'guardado',
                   'guardar', 'mis planes', 'planes guardados', 'planes de lectura', 'semana', 'dias',
                   'calendario', 'progreso', 'continuar', 'retomar', 'seguimiento', 'leer', 'diario',
                   'semana santa', 'resurreccion', 'navidad', 'cuaresma', 'pascua'],
    },
    {
        label: 'Doctrina', href: '/doctrina', desc: 'Fundamentos de la fe cristiana',
        icon: '✝️', color: 'text-purple-600 bg-purple-50',
        keywords: ['doctrina', 'fe', 'cristiana', 'fundamentos', 'creencias', 'credo', 'teologia',
                   'ensenanza', 'ensenanzas', 'principios', 'bases', 'declaracion', 'articulos de fe',
                   'statement of faith', 'que creemos', 'lo que creemos', 'trinidad', 'salvacion',
                   'bautismo', 'espiritu santo'],
    },
    {
        label: 'Templos', href: '/templos', desc: 'Ubica nuestras congregaciones',
        icon: '🏛️', color: 'text-emerald-600 bg-emerald-50',
        keywords: ['templos', 'templo', 'iglesia', 'iglesias', 'congregacion', 'congregaciones',
                   'ubicacion', 'ubicaciones', 'direccion', 'mapa', 'lugar', 'lugares', 'sede',
                   'horario', 'horarios', 'culto', 'servicio', 'nayarit', 'como llegar', 'donde',
                   'sucursal', 'locales'],
    },
    {
        label: 'Radio', href: '/radio', desc: 'Transmisión en vivo',
        icon: '📻', color: 'text-red-600    bg-red-50',
        keywords: ['radio', 'transmision', 'vivo', 'en vivo', 'live', 'streaming', 'escuchar',
                   'audio', 'podcast', 'musica', 'alabanza', 'adoracion', 'predica', 'predicacion',
                   'sermon', 'sermones', 'sintonizar', 'frecuencia', 'online', 'directo'],
    },
    {
        label: 'Avisos', href: '/avisos', desc: 'Anuncios y eventos',
        icon: '📢', color: 'text-orange-600 bg-orange-50',
        keywords: ['avisos', 'aviso', 'anuncios', 'anuncio', 'eventos', 'evento', 'noticias',
                   'noticia', 'actividades', 'actividad', 'agenda', 'proximo', 'proximos', 'retiro',
                   'conferencia', 'boletin', 'comunicado', 'informacion', 'novedad', 'novedades',
                   'publicaciones', 'publicacion'],
    },
    {
        label: 'Recursos', href: '/recursos', desc: 'Material de estudio y descarga',
        icon: '🗂️', color: 'text-indigo-600 bg-indigo-50',
        keywords: ['recursos', 'material', 'materiales', 'estudio', 'descarga', 'descargar',
                   'pdf', 'documentos', 'documento', 'guias', 'guia', 'notas', 'predicas',
                   'sermones', 'archivos', 'archivo', 'multimedia', 'presentacion', 'presentaciones',
                   'manual', 'manuales', 'curso', 'cursos', 'clase', 'clases'],
    },
];

type Filter = 'Todo' | 'Biblia' | 'Secciones';
const FILTERS: Filter[] = ['Todo', 'Biblia', 'Secciones'];

const QUICK_SUGGESTIONS = [
    { label: 'Juan 3:16', href: '/biblia?book=Juan&chapter=3&verse=16', icon: '📖' },
    { label: 'Salmos 23', href: '/biblia?book=Salmos&chapter=23', icon: '📖' },
    { label: 'Planes de lectura', href: '/planes', icon: '📅' },
    { label: 'Radio en vivo', href: '/radio', icon: '📻' },
];

const RECENT_KEY   = 'globalSearchRecent';
const LEARNED_KEY  = 'globalSearchLearned';

interface LearnedMapping {
    query: string;      // normalized query that returned no results
    href:  string;      // section inferred as most related
    count: number;      // how many times this query was searched
}

interface Result {
    label: string;
    sub: string;
    href: string;
    type: 'bible-ref' | 'bible-book' | 'section';
    icon: string;
    color?: string;
}

// ── Learned mappings helpers ─────────────────────────────────────────────────
function getLearnedMappings(): LearnedMapping[] {
    try { return JSON.parse(localStorage.getItem(LEARNED_KEY) ?? '[]'); } catch { return []; }
}

function saveLearnedMapping(query: string, href: string) {
    try {
        const current = getLearnedMappings();
        const existing = current.find(m => m.query === query);
        let next: LearnedMapping[];
        if (existing) {
            next = current.map(m => m.query === query ? { ...m, count: m.count + 1 } : m);
        } else {
            next = [{ query, href, count: 1 }, ...current].slice(0, 100);
        }
        localStorage.setItem(LEARNED_KEY, JSON.stringify(next));
    } catch {}
}

// ── Fuzzy inference ──────────────────────────────────────────────────────────

/** Length of the longest common substring between two strings. */
function lcs(a: string, b: string): number {
    let max = 0;
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            let len = 0;
            while (i + len < a.length && j + len < b.length && a[i + len] === b[j + len]) len++;
            if (len > max) max = len;
        }
    }
    return max;
}

/**
 * Tries to find the most related section for a query that returned no results.
 * Returns null if no section scored above the minimum threshold.
 */
function inferSection(words: string[]): typeof SECTIONS[0] | null {
    let bestSection: typeof SECTIONS[0] | null = null;
    let bestScore = 0;

    for (const section of SECTIONS) {
        const allKeywords = [
            normalize(section.label),
            normalize(section.desc),
            ...(section.keywords ?? []).map(normalize),
        ];

        let score = 0;
        for (const word of words) {
            if (word.length < 3) continue;
            for (const kw of allKeywords) {
                // Direct containment — strongest signal
                if (kw.includes(word) || word.includes(kw)) { score += 2; continue; }
                // LCS ratio — partial similarity (e.g. "guardad" → "guardado")
                const ratio = lcs(word, kw) / word.length;
                if (ratio >= 0.7) score += ratio;
            }
        }

        if (score > bestScore) { bestScore = score; bestSection = section; }
    }

    // Only infer if there's a meaningful signal
    return bestScore >= 0.5 ? bestSection : null;
}

function normalize(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Normalize AND strip spaces so "1samuel" matches "1 Samuel"
function normFlat(s: string): string {
    return normalize(s).replace(/\s+/g, '');
}

function findBook(part: string): string | undefined {
    const p = normFlat(part);
    if (!p) return undefined;
    // 1. exact start match (flat, no spaces)
    let found = BIBLE_BOOKS.find(b => normFlat(b).startsWith(p));
    // 2. fallback: includes match (handles mid-word searches)
    if (!found) found = BIBLE_BOOKS.find(b => normFlat(b).includes(p));
    return found;
}

function parseBibleRef(q: string): { book: string; chapter: number; verse?: number } | null {
    const cleaned = q.trim().replace(/\s+/g, ' ');
    // Match: [book name] [chapter] or [book name] [chapter]:[verse]
    const match = cleaned.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
    if (!match) return null;
    const chapter = parseInt(match[2]);
    const verse   = match[3] ? parseInt(match[3]) : undefined;
    if (isNaN(chapter) || chapter < 1) return null;
    const book = findBook(match[1].trim());
    if (!book) return null;
    return { book, chapter, verse };
}

function getStoredRecent(): string[] {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function addRecent(label: string) {
    try {
        const prev = getStoredRecent().filter(l => l !== label);
        localStorage.setItem(RECENT_KEY, JSON.stringify([label, ...prev].slice(0, 5)));
    } catch {}
}

export default function GlobalSearch() {
    const [query, setQuery]           = useState('');
    const [filter, setFilter]         = useState<Filter>('Todo');
    const [filterOpen, setFilterOpen] = useState(false);
    const [open, setOpen]             = useState(false);
    const [activeIdx, setActiveIdx]   = useState(-1);
    const [recent, setRecent]         = useState<string[]>([]);
    const [inferred, setInferred]     = useState<typeof SECTIONS[0] | null>(null);
    const router        = useRouter();
    const containerRef  = useRef<HTMLDivElement>(null);
    const inputRef      = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
                setFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // ⌘K / Ctrl+K shortcut
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
                setRecent(getStoredRecent());
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const getResults = useCallback((): Result[] => {
        const q = query.trim();
        if (!q) return [];
        const ql = normalize(q);
        // Individual words for multi-word matching
        const words = ql.split(/\s+/).filter(Boolean);
        const results: Result[] = [];

        if (filter === 'Todo' || filter === 'Biblia') {
            // Exact Bible reference (e.g. "Juan 3:16")
            const ref = parseBibleRef(q);
            if (ref) {
                const params = `book=${encodeURIComponent(ref.book)}&chapter=${ref.chapter}${ref.verse ? `&verse=${ref.verse}` : ''}`;
                results.push({
                    label: `${ref.book} ${ref.chapter}${ref.verse ? `:${ref.verse}` : ''}`,
                    sub: ref.verse ? `Ir al versículo ${ref.verse}` : `Ir al capítulo ${ref.chapter}`,
                    href: `/biblia?${params}`,
                    type: 'bible-ref',
                    icon: '📖',
                    color: 'bg-amber-50 text-amber-700',
                });
            }

            // Book-only suggestions (no digits in query)
            if (!/\d/.test(q)) {
                BIBLE_BOOKS
                    .map(book => {
                        const bn = normFlat(book);
                        let score = 0;
                        for (const w of words) {
                            const wf = normFlat(w);
                            if (bn === wf) score += 4;
                            else if (bn.startsWith(wf)) score += 2;
                            else if (bn.includes(wf)) score += 1;
                        }
                        return { book, score };
                    })
                    .filter(({ score }) => score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, filter === 'Biblia' ? 7 : 4)
                    .forEach(({ book }) => results.push({
                        label: book,
                        sub: 'Libro de la Biblia — ir al capítulo 1',
                        href: `/biblia?book=${encodeURIComponent(book)}`,
                        type: 'bible-book',
                        icon: '📖',
                    }));
            }
        }

        if (filter === 'Todo' || filter === 'Secciones') {
            // Load learned mappings to boost sections that were previously inferred
            const learned = getLearnedMappings();

            SECTIONS
                .map(s => {
                    const allFields = [
                        normalize(s.label),
                        normalize(s.desc),
                        ...(s.keywords ?? []).map(normalize),
                    ];
                    const fullText = allFields.join(' ');

                    let score = 0;
                    for (const w of words) {
                        if (normalize(s.label) === w) score += 8;
                        else if (normalize(s.label).startsWith(w)) score += 5;
                        else if (normalize(s.label).includes(w)) score += 4;
                        else if (normalize(s.desc).includes(w)) score += 2;
                        else if (fullText.includes(w)) score += 1;
                        else if ((s.keywords ?? []).some(k => normalize(k).includes(w))) score += 1;
                    }

                    // Boost score using learned mappings for this section
                    for (const w of words) {
                        const match = learned.find(
                            m => m.href === s.href &&
                            (normalize(m.query).includes(w) || w.includes(normalize(m.query)))
                        );
                        if (match) score += 3 + Math.log1p(match.count); // more searches = stronger boost
                    }

                    return { s, score };
                })
                .filter(({ score }) => score > 0)
                .sort((a, b) => b.score - a.score)
                .forEach(({ s }) => results.push({
                    label: s.label,
                    sub: s.desc,
                    href: s.href,
                    type: 'section',
                    icon: s.icon,
                    color: s.color,
                }));
        }

        return results.slice(0, 9);
    }, [query, filter]);

    const results = getResults();

    // When there are no results, infer closest section and save the mapping
    useEffect(() => {
        const q = query.trim();
        if (!q || results.length > 0) { setInferred(null); return; }
        const words = normalize(q).split(/\s+/).filter(Boolean);
        const section = inferSection(words);
        setInferred(section);
        if (section) saveLearnedMapping(normalize(q), section.href);
    }, [query, results.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelect = (href: string, label: string) => {
        addRecent(label);
        setRecent(getStoredRecent());
        router.push(href);
        setQuery('');
        setOpen(false);
        setActiveIdx(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
        if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(results[activeIdx].href, results[activeIdx].label); }
        if (e.key === 'Enter' && activeIdx === -1 && results.length === 1) { e.preventDefault(); handleSelect(results[0].href, results[0].label); }
        if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    };

    const showResults  = open && query.trim().length > 0 && results.length > 0;
    const showEmpty    = open && query.trim().length > 0 && results.length === 0;
    const showDefault  = open && query.trim().length === 0;

    const bibleResults   = results.filter(r => r.type !== 'section');
    const sectionResults = results.filter(r => r.type === 'section');

    return (
        <div ref={containerRef} className="relative w-full max-w-sm lg:max-w-md xl:max-w-lg">
            {/* Input bar */}
            <div className={`flex items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-200 ${open ? 'bg-white border border-gray-300 shadow-lg shadow-gray-100' : 'bg-gray-100 border border-transparent hover:bg-gray-100/80 hover:border-gray-200'}`}>
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); }}
                    onFocus={() => { setOpen(true); setRecent(getStoredRecent()); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar versículo, sección…"
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
                />

                {/* Filter pill */}
                <div className="relative shrink-0">
                    <button
                        onMouseDown={e => { e.preventDefault(); setFilterOpen(f => !f); }}
                        className={`flex items-center gap-1 text-[10px] font-black rounded-full px-2.5 py-1 border transition-colors ${filter !== 'Todo' ? 'bg-[#B88A44] text-white border-[#B88A44]' : 'text-gray-400 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'}`}
                    >
                        {filter} <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                    {filterOpen && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60] min-w-[120px] py-1">
                            {FILTERS.map(f => (
                                <button
                                    key={f}
                                    onMouseDown={e => { e.preventDefault(); setFilter(f); setFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center gap-2 ${filter === f ? 'bg-[#B88A44]/10 text-[#B88A44]' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {f === 'Todo' ? '🔍' : f === 'Biblia' ? '📖' : '🗂️'} {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {query ? (
                    <button onMouseDown={e => { e.preventDefault(); setQuery(''); setOpen(true); }} className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <span className="hidden lg:flex items-center gap-0.5 text-[10px] text-gray-300 shrink-0 select-none">
                        <Keyboard className="w-3 h-3" />⌘K
                    </span>
                )}
            </div>

            {/* Dropdown panel */}
            {(showResults || showEmpty || showDefault) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                    {/* ── Default state: recent + quick suggestions ── */}
                    {showDefault && (
                        <div className="p-3">
                            {recent.length > 0 && (
                                <>
                                    <div className="flex items-center gap-1.5 px-1 pb-1.5 pt-0.5">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Recientes</span>
                                    </div>
                                    {recent.map((label, i) => (
                                        <button
                                            key={i}
                                            onMouseDown={e => { e.preventDefault(); setQuery(label); setActiveIdx(-1); }}
                                            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                            <span className="text-sm text-gray-600 font-medium">{label}</span>
                                        </button>
                                    ))}
                                    <div className="border-t border-gray-50 my-2" />
                                </>
                            )}
                            <div className="flex items-center gap-1.5 px-1 pb-1.5">
                                <Search className="w-3 h-3 text-gray-400" />
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sugerencias</span>
                            </div>
                            {QUICK_SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onMouseDown={e => { e.preventDefault(); handleSelect(s.href, s.label); }}
                                    className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-base leading-none">{s.icon}</span>
                                        <span className="text-sm text-gray-700 font-medium">{s.label}</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                            <div className="pt-2 border-t border-gray-50 px-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {SECTIONS.map(s => (
                                        <button
                                            key={s.href}
                                            onMouseDown={e => { e.preventDefault(); handleSelect(s.href, s.label); }}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all hover:scale-105 ${s.color}`}
                                        >
                                            {s.icon} {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Results ── */}
                    {showResults && (
                        <div className="py-2">
                            {bibleResults.length > 0 && (
                                <>
                                    <div className="flex items-center gap-1.5 px-4 pt-2 pb-1">
                                        <BookOpen className="w-3 h-3 text-amber-600" />
                                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Biblia</span>
                                    </div>
                                    {bibleResults.map((r, i) => (
                                        <button
                                            key={i}
                                            onMouseDown={e => { e.preventDefault(); handleSelect(r.href, r.label); }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === i ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${r.type === 'bible-ref' ? 'bg-amber-100' : 'bg-gray-100'}`}>{r.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{r.label}</p>
                                                <p className="text-[11px] text-gray-400">{r.sub}</p>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                        </button>
                                    ))}
                                </>
                            )}

                            {sectionResults.length > 0 && (
                                <>
                                    {bibleResults.length > 0 && <div className="border-t border-gray-50 mx-4 my-1" />}
                                    <div className="flex items-center gap-1.5 px-4 pt-2 pb-1">
                                        <LayoutGrid className="w-3 h-3 text-gray-400" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secciones</span>
                                    </div>
                                    {sectionResults.map((r, i) => {
                                        const idx = bibleResults.length + i;
                                        const sectionMeta = SECTIONS.find(s => s.href === r.href);
                                        return (
                                            <button
                                                key={`s-${i}`}
                                                onMouseDown={e => { e.preventDefault(); handleSelect(r.href, r.label); }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === idx ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${sectionMeta?.color ?? 'bg-gray-100 text-gray-600'}`}>{r.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                                                    <p className="text-[11px] text-gray-400 truncate">{r.sub}</p>
                                                </div>
                                                <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                            </button>
                                        );
                                    })}
                                </>
                            )}

                            <div className="px-4 py-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-300">
                                <span>↩ seleccionar</span>
                                <span>↑↓ navegar</span>
                                <span>Esc cerrar</span>
                            </div>
                        </div>
                    )}

                    {/* ── Empty state ── */}
                    {showEmpty && (
                        <div className="px-4 py-6 text-center">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                <Search className="w-4 h-4 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-semibold">Sin resultados para <span className="text-gray-800">"{query}"</span></p>

                            {inferred ? (
                                <div className="mt-4">
                                    <p className="text-[11px] text-gray-400 mb-3">¿Quizás buscabas esta sección?</p>
                                    <button
                                        onMouseDown={e => { e.preventDefault(); handleSelect(inferred.href, inferred.label); }}
                                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 shadow-sm ${inferred.color}`}
                                    >
                                        <span className="text-base">{inferred.icon}</span>
                                        {inferred.label}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                    <p className="text-[9px] text-gray-300 mt-3 flex items-center justify-center gap-1">
                                        <span>✦</span> Aprendido para próximas búsquedas
                                    </p>
                                </div>
                            ) : (
                                <p className="text-[11px] text-gray-400 mt-1">Prueba con el nombre de un libro o sección</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
