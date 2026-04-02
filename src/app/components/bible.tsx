'use client';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { useToast } from '@/app/hooks/use-toast';
import {
    Bookmark, ChevronLeft, ChevronRight, Share2, Image as ImageIcon, Languages, Type,
    FileText, Copy, MessageSquare, StickyNote, Minus, Plus, BookOpen, Clock,
    Bold, Italic, List, Link as LinkIcon, Quote, Image as ImgIcon, X, Save,
    Eye, Instagram, Facebook, Palette, Download, Share2 as ShareIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

const books = [
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
    "3 Juan", "Judas", "Apocalipsis"
];

// ── Bible versions ────────────────────────────────────────────────────────────
type VersionId =
    | 'rvr' | 'rvg'
    | 'kjv' | 'asv' | 'bbe'
    | 'ar'  | 'de'  | 'el' | 'eo' | 'fi' | 'fi_pr'
    | 'fr'  | 'ko'  | 'pt_aa' | 'pt_acf' | 'pt_nvi'
    | 'ro'  | 'ru'  | 'vi' | 'zh_cuv' | 'zh_ncv'
    | 'huichol';

const VERSIONS: { id: VersionId; label: string; lang: string }[] = [
    // Español
    { id: 'rvr',    label: 'Reina-Valera 1960',          lang: 'ES' },
    { id: 'rvg',    label: 'Reina-Valera Gómez',         lang: 'ES' },
    // Inglés
    { id: 'kjv',    label: 'King James Version',         lang: 'EN' },
    { id: 'asv',    label: 'American Standard',          lang: 'EN' },
    { id: 'bbe',    label: 'Bible Basic English',        lang: 'EN' },
    // Otros idiomas
    { id: 'ar',     label: 'Árabe (Smith & Van Dyke)',   lang: 'AR' },
    { id: 'de',     label: 'Alemán (Schlachter)',        lang: 'DE' },
    { id: 'el',     label: 'Griego (Textus Receptus)',   lang: 'EL' },
    { id: 'eo',     label: 'Esperanto',                  lang: 'EO' },
    { id: 'fi',     label: 'Finés (1776)',               lang: 'FI' },
    { id: 'fi_pr',  label: 'Finés (PR)',                 lang: 'FI' },
    { id: 'fr',     label: 'Francés (APEE)',             lang: 'FR' },
    { id: 'ko',     label: 'Coreano (개역한글)',          lang: 'KO' },
    { id: 'pt_aa',  label: 'Portugués (Almeida Atual.)', lang: 'PT' },
    { id: 'pt_acf', label: 'Portugués (Almeida Fiel)',   lang: 'PT' },
    { id: 'pt_nvi', label: 'Portugués (NVI)',            lang: 'PT' },
    { id: 'ro',     label: 'Rumano (Cornilescu)',        lang: 'RO' },
    { id: 'ru',     label: 'Ruso (Sinodal)',             lang: 'RU' },
    { id: 'vi',     label: 'Vietnamita',                 lang: 'VI' },
    { id: 'zh_cuv',   label: 'Chino (CUV)',               lang: 'ZH'  },
    { id: 'zh_ncv',   label: 'Chino (NCV)',               lang: 'ZH'  },
    { id: 'huichol',  label: 'Huichol (Wixárika)',        lang: 'HCH' },
];

/** 0-based canonical book index (same order used by all single-file Bibles). */
const BOOK_INDEX: { [key: string]: number } = {
    "Génesis":0,"Éxodo":1,"Levítico":2,"Números":3,"Deuteronomio":4,
    "Josué":5,"Jueces":6,"Rut":7,"1 Samuel":8,"2 Samuel":9,
    "1 Reyes":10,"2 Reyes":11,"1 Crónicas":12,"2 Crónicas":13,
    "Esdras":14,"Nehemías":15,"Ester":16,"Job":17,"Salmos":18,
    "Proverbios":19,"Eclesiastés":20,"Cantares":21,"Isaías":22,
    "Jeremías":23,"Lamentaciones":24,"Ezequiel":25,"Daniel":26,
    "Oseas":27,"Joel":28,"Amós":29,"Abdías":30,"Jonás":31,
    "Miqueas":32,"Nahúm":33,"Habacuc":34,"Sofonías":35,"Hageo":36,
    "Zacarías":37,"Malaquías":38,"Mateo":39,"Marcos":40,"Lucas":41,
    "Juan":42,"Hechos":43,"Romanos":44,"1 Corintios":45,"2 Corintios":46,
    "Gálatas":47,"Efesios":48,"Filipenses":49,"Colosenses":50,
    "1 Tesalonicenses":51,"2 Tesalonicenses":52,"1 Timoteo":53,
    "2 Timoteo":54,"Tito":55,"Filemón":56,"Hebreos":57,"Santiago":58,
    "1 Pedro":59,"2 Pedro":60,"1 Juan":61,"2 Juan":62,"3 Juan":63,
    "Judas":64,"Apocalipsis":65,
};

/** Maps Spanish book name → Huichol file abbreviation (only valid files). */
const HUICHOL_BOOK_MAP: Record<string, string> = {
    "1 Crónicas":"1ch",  "1 Corintios":"1co",  "1 Juan":"1jn",   "1 Reyes":"1ki",
    "1 Pedro":"1pe",     "1 Samuel":"1sa",      "1 Tesalonicenses":"1th",
    "2 Crónicas":"2ch",  "2 Corintios":"2co",  "2 Juan":"2jn",   "2 Reyes":"2ki",
    "2 Pedro":"2pe",     "2 Samuel":"2sa",      "2 Tesalonicenses":"2th", "2 Timoteo":"2ti",
    "3 Juan":"3jn",
    "Amós":"amo",        "Colosenses":"col",    "Daniel":"dan",   "Eclesiastés":"ecc",
    "Efesios":"eph",     "Ester":"est",         "Esdras":"ezr",   "Gálatas":"gal",
    "Habacuc":"hab",     "Hageo":"hag",         "Hebreos":"heb",  "Oseas":"hos",
    "Isaías":"isa",      "Santiago":"jas",      "Jueces":"jdg",   "Jeremías":"jer",
    "Juan":"jhn",        "Joel":"jol",          "Jonás":"jon",    "Lamentaciones":"lam",
    "Levítico":"lev",    "Malaquías":"mal",     "Mateo":"mat",    "Miqueas":"mic",
    "Abdías":"oba",      "Filemón":"phm",       "Filipenses":"php","Apocalipsis":"rev",
    "Romanos":"rom",     "Rut":"rut",           "Cantares":"sng", "Tito":"tit",
    "Zacarías":"zec",    "Sofonías":"zep",
};

/** Per-file dynamic loaders for the Huichol Bible. */
const HUICHOL_LOADERS: Record<string, () => Promise<unknown>> = {
    "1ch": () => import("@/app/lib/bible_huichol/1ch.json"),
    "1co": () => import("@/app/lib/bible_huichol/1co.json"),
    "1jn": () => import("@/app/lib/bible_huichol/1jn.json"),
    "1ki": () => import("@/app/lib/bible_huichol/1ki.json"),
    "1pe": () => import("@/app/lib/bible_huichol/1pe.json"),
    "1sa": () => import("@/app/lib/bible_huichol/1sa.json"),
    "1th": () => import("@/app/lib/bible_huichol/1th.json"),
    "2ch": () => import("@/app/lib/bible_huichol/2ch.json"),
    "2co": () => import("@/app/lib/bible_huichol/2co.json"),
    "2jn": () => import("@/app/lib/bible_huichol/2jn.json"),
    "2ki": () => import("@/app/lib/bible_huichol/2ki.json"),
    "2pe": () => import("@/app/lib/bible_huichol/2pe.json"),
    "2sa": () => import("@/app/lib/bible_huichol/2sa.json"),
    "2th": () => import("@/app/lib/bible_huichol/2th.json"),
    "2ti": () => import("@/app/lib/bible_huichol/2ti.json"),
    "3jn": () => import("@/app/lib/bible_huichol/3jn.json"),
    "amo": () => import("@/app/lib/bible_huichol/amo.json"),
    "col": () => import("@/app/lib/bible_huichol/col.json"),
    "dan": () => import("@/app/lib/bible_huichol/dan.json"),
    "ecc": () => import("@/app/lib/bible_huichol/ecc.json"),
    "eph": () => import("@/app/lib/bible_huichol/eph.json"),
    "est": () => import("@/app/lib/bible_huichol/est.json"),
    "ezr": () => import("@/app/lib/bible_huichol/ezr.json"),
    "gal": () => import("@/app/lib/bible_huichol/gal.json"),
    "hab": () => import("@/app/lib/bible_huichol/hab.json"),
    "hag": () => import("@/app/lib/bible_huichol/hag.json"),
    "heb": () => import("@/app/lib/bible_huichol/heb.json"),
    "hos": () => import("@/app/lib/bible_huichol/hos.json"),
    "isa": () => import("@/app/lib/bible_huichol/isa.json"),
    "jas": () => import("@/app/lib/bible_huichol/jas.json"),
    "jdg": () => import("@/app/lib/bible_huichol/jdg.json"),
    "jer": () => import("@/app/lib/bible_huichol/jer.json"),
    "jhn": () => import("@/app/lib/bible_huichol/jhn.json"),
    "jol": () => import("@/app/lib/bible_huichol/jol.json"),
    "jon": () => import("@/app/lib/bible_huichol/jon.json"),
    "lam": () => import("@/app/lib/bible_huichol/lam.json"),
    "lev": () => import("@/app/lib/bible_huichol/lev.json"),
    "mal": () => import("@/app/lib/bible_huichol/mal.json"),
    "mat": () => import("@/app/lib/bible_huichol/mat.json"),
    "mic": () => import("@/app/lib/bible_huichol/mic.json"),
    "oba": () => import("@/app/lib/bible_huichol/oba.json"),
    "phm": () => import("@/app/lib/bible_huichol/phm.json"),
    "php": () => import("@/app/lib/bible_huichol/php.json"),
    "rev": () => import("@/app/lib/bible_huichol/rev.json"),
    "rom": () => import("@/app/lib/bible_huichol/rom.json"),
    "rut": () => import("@/app/lib/bible_huichol/rut.json"),
    "sng": () => import("@/app/lib/bible_huichol/sng.json"),
    "tit": () => import("@/app/lib/bible_huichol/tit.json"),
    "zec": () => import("@/app/lib/bible_huichol/zec.json"),
    "zep": () => import("@/app/lib/bible_huichol/zep.json"),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseHuicholChapter(raw: any, chapterIdx: number): string[] {
    const d = raw.default ?? raw;
    // Format A: { libro: [...], ... } where libro is an array
    if (Array.isArray(d.libro)) {
        const cap = d.libro[0]?.capitulo?.[chapterIdx];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (cap?.versiculos ?? []).map((v: any) => v.texto as string).filter(Boolean);
    }
    // Format B: { book: { chapters: [{ verses: [...] }] } }
    if (d.book?.chapters) {
        const cap = d.book.chapters[chapterIdx];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (cap?.verses ?? []).map((v: any) => v.text as string).filter(Boolean);
    }
    return [];
}

const bookFileMap: { [key: string]: string } = {
    "Génesis": "gn", "Éxodo": "ex", "Levítico": "lv", "Números": "nm", "Deuteronomio": "dt",
    "Josué": "js", "Jueces": "jud", "Rut": "rt", "1 Samuel": "1-samuel", "2 Samuel": "2-samuel",
    "1 Reyes": "1-kings", "2 Reyes": "2-kings", "1 Crónicas": "1-chronicles", "2 Crónicas": "2-chronicles",
    "Esdras": "ezr", "Nehemías": "ne", "Ester": "et", "Job": "job", "Salmos": "ps",
    "Proverbios": "prv", "Eclesiastés": "ec", "Cantares": "so", "Isaías": "is",
    "Jeremías": "jr", "Lamentaciones": "lm", "Ezequiel": "ez", "Daniel": "dn",
    "Oseas": "ho", "Joel": "jl", "Amós": "am", "Abdías": "ob", "Jonás": "jn",
    "Miqueas": "mi", "Nahúm": "na", "Habacuc": "hk", "Sofonías": "zp", "Hageo": "hg",
    "Zacarías": "zc", "Malaquías": "ml", "Mateo": "mt", "Marcos": "mk", "Lucas": "lk",
    "Juan": "jo", "Hechos": "act", "Romanos": "rm", "1 Corintios": "1-corinthians",
    "2 Corintios": "2-corinthians", "Gálatas": "gl", "Efesios": "eph", "Filipenses": "ph",
    "Colosenses": "colossians", "1 Tesalonicenses": "1-thessalonians", "2 Tesalonicenses": "2-thessalonians",
    "1 Timoteo": "1-timothy", "2 Timoteo": "2-timothy", "Tito": "tt", "Filemón": "phm",
    "Hebreos": "hb", "Santiago": "jm", "1 Pedro": "1-peter", "2 Pedro": "2-peter",
    "1 Juan": "1-john", "2 Juan": "2-john", "3 Juan": "3-john", "Judas": "jd", "Apocalipsis": "re"
};

const chaptersPerBook: { [key: string]: number } = {
    "Génesis": 50, "Éxodo": 40, "Levítico": 27, "Números": 36, "Deuteronomio": 34, "Josué": 24,
    "Jueces": 21, "Rut": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Reyes": 22, "2 Reyes": 25,
    "1 Crónicas": 29, "2 Crónicas": 36, "Esdras": 10, "Nehemías": 13, "Ester": 10, "Job": 42,
    "Salmos": 150, "Proverbios": 31, "Eclesiastés": 12, "Cantares": 8, "Isaías": 66,
    "Jeremías": 52, "Lamentaciones": 5, "Ezequiel": 48, "Daniel": 12, "Oseas": 14, "Joel": 3,
    "Amós": 9, "Abdías": 1, "Jonás": 4, "Miqueas": 7, "Nahúm": 3, "Habacuc": 3, "Sofonías": 3,
    "Hageo": 2, "Zacarías": 14, "Malaquías": 4, "Mateo": 28, "Marcos": 16, "Lucas": 24, "Juan": 21,
    "Hechos": 28, "Romanos": 16, "1 Corintios": 16, "2 Corintios": 13, "Gálatas": 6,
    "Efesios": 6, "Filipenses": 4, "Colosenses": 4, "1 Tesalonicenses": 5,
    "2 Tesalonicenses": 3, "1 Timoteo": 6, "2 Timoteo": 4, "Tito": 3, "Filemón": 1,
    "Hebreos": 13, "Santiago": 5, "1 Pedro": 5, "2 Pedro": 3, "1 Juan": 5, "2 Juan": 1,
    "3 Juan": 1, "Judas": 1, "Apocalipsis": 22
};

interface SavedVerse {
    text: string;
    reference: string;
}

interface CustomNote {
    id: string;
    title: string;
    text: string;
    reference: string;
    date: string;
    tags?: string[];
}

type ElementKey = 'ref' | 'verse' | 'website';

function GridOverlay({ visible, snapX, snapY }: { visible: boolean; snapX: boolean; snapY: boolean }) {
    if (!visible) return null;
    return (
        <>
            <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
            <div
                className="absolute top-0 bottom-0 left-1/2 w-px pointer-events-none z-20 transition-[background-color,box-shadow] duration-75"
                style={{
                    transform: 'translateX(-50%)',
                    backgroundColor: snapX ? 'rgba(250,204,21,0.95)' : 'rgba(255,255,255,0.4)',
                    boxShadow: snapX ? '0 0 8px 2px rgba(250,204,21,0.65)' : 'none',
                }}
            />
            <div
                className="absolute left-0 right-0 top-1/2 h-px pointer-events-none z-20 transition-[background-color,box-shadow] duration-75"
                style={{
                    transform: 'translateY(-50%)',
                    backgroundColor: snapY ? 'rgba(250,204,21,0.95)' : 'rgba(255,255,255,0.4)',
                    boxShadow: snapY ? '0 0 8px 2px rgba(250,204,21,0.65)' : 'none',
                }}
            />
            <div className="absolute left-1/2 top-1/2 pointer-events-none z-20" style={{ transform: 'translate(-50%,-50%)' }}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-75 ${snapX && snapY ? 'border-yellow-400 bg-yellow-400/20 scale-125' : 'border-white/60 bg-white/10'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-75 ${snapX && snapY ? 'bg-yellow-400' : 'bg-white/80'}`} />
                </div>
                {(snapX || snapY) && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[8px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-md pointer-events-none" style={{ backgroundColor: 'rgba(250,204,21,1)', color: '#000' }}>
                        {snapX && snapY ? 'CENTRADO ✓' : snapX ? 'CENTRO H ✓' : 'CENTRO V ✓'}
                    </span>
                )}
            </div>
        </>
    );
}

function DraggableText({ children, position, onPositionChange, className, style, isSelected, onSelect, label, onDragStart, onDragEnd, onSnapChange }: {
    children: React.ReactNode;
    position: { x: number; y: number };
    onPositionChange: (pos: { x: number; y: number }) => void;
    className?: string;
    style?: React.CSSProperties;
    isSelected?: boolean;
    onSelect?: () => void;
    label?: string;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onSnapChange?: (snapX: boolean, snapY: boolean) => void;
}) {
    const [dragging, setDragging] = useState(false);
    const SNAP_ZONE = 10;

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect?.();
        setDragging(true);
        onDragStart?.();
        const el = e.currentTarget as HTMLElement;
        el.setPointerCapture(e.pointerId);
        const startX = e.clientX - position.x;
        const startY = e.clientY - position.y;

        const onMove = (ev: PointerEvent) => {
            let newX = ev.clientX - startX;
            let newY = ev.clientY - startY;
            const sx = Math.abs(newX) < SNAP_ZONE;
            const sy = Math.abs(newY) < SNAP_ZONE;
            if (sx) newX = 0;
            if (sy) newY = 0;
            onSnapChange?.(sx, sy);
            onPositionChange({ x: newX, y: newY });
        };
        const onUp = () => {
            setDragging(false);
            onDragEnd?.();
            onSnapChange?.(false, false);
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }, [position, onPositionChange, onSelect, onDragStart, onDragEnd, onSnapChange]);

    return (
        <div
            onPointerDown={handlePointerDown}
            onClick={(e) => e.stopPropagation()}
            className={`cursor-grab active:cursor-grabbing select-none touch-none relative transition-[opacity,filter] duration-100 ${dragging ? 'opacity-75 drop-shadow-2xl z-50' : ''} ${className ?? ''}`}
            style={{
                ...style,
                transform: `translate(${position.x}px, ${position.y}px)`,
                outline: isSelected ? '2px dashed rgba(255,255,255,0.8)' : 'none',
                outlineOffset: '4px',
                borderRadius: '4px',
                zIndex: dragging ? 50 : undefined,
                scale: dragging ? '1.04' : '1',
            }}
        >
            {isSelected && label && (
                <span className="absolute -top-6 left-0 text-[9px] bg-white text-blue-600 font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-md z-50 pointer-events-none">
                    {label}
                </span>
            )}
            {children}
        </div>
    );
}

export default function Bible() {
    const [selectedVersion, setSelectedVersion] = useState<VersionId>('rvr');
    const [selectedBook, setSelectedBook] = useState('Génesis');
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [verses, setVerses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
    const [highlightedVerses, setHighlightedVerses] = useState<Record<string, string>>({});
    const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
    const [savedChapters, setSavedChapters] = useState<{ book: string; chapter: number; verses: string[] }[]>([]);

    // Note State
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const [notes, setNotes] = useState<CustomNote[]>([]);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [noteTags, setNoteTags] = useState<string[]>([]);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const contentEditableRef = useRef<HTMLDivElement>(null);

    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [linkInput, setLinkInput] = useState("");
    const [isImgPopoverOpen, setIsImgPopoverOpen] = useState(false);
    const [imgInput, setImgInput] = useState("");
    const [savedSelection, setSavedSelection] = useState<Range | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const customColorRef = useRef<HTMLInputElement>(null);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [socialFormat, setSocialFormat] = useState<'vertical' | 'horizontal'>('vertical');

    const [isStudioOpen, setIsStudioOpen] = useState(false);
    const [dragPos, setDragPos] = useState({ ref: { x: 0, y: 0 }, verse: { x: 0, y: 0 }, website: { x: 0, y: 0 } });
    const [isCanvasDragging, setIsCanvasDragging] = useState(false);
    const [activeSnap, setActiveSnap] = useState({ x: false, y: false });
    const resetDragPos = () => setDragPos({ ref: { x: 0, y: 0 }, verse: { x: 0, y: 0 }, website: { x: 0, y: 0 } });

    const [selectedElement, setSelectedElement] = useState<ElementKey | null>(null);
    const [elementStyles, setElementStyles] = useState<Record<ElementKey, { fontSize: number; fontWeight: string; color: string; textAlign: string }>>({
        ref:     { fontSize: 10, fontWeight: '800', color: 'auto', textAlign: 'center' },
        verse:   { fontSize: 24, fontWeight: '700', color: 'auto', textAlign: 'center' },
        website: { fontSize: 8,  fontWeight: '900', color: 'auto', textAlign: 'center' },
    });
    const updateElement = (key: ElementKey, patch: Partial<{ fontSize: number; fontWeight: string; color: string; textAlign: string }>) =>
        setElementStyles(s => ({ ...s, [key]: { ...s[key], ...patch } }));
    const elementColorRef = useRef<HTMLInputElement>(null);
    const [studioTheme, setStudioTheme] = useState({
        bgColor: '#2563EB',
        bgImage: null as string | null,
        fontSize: 24,
        fontWeight: 'bold',
        alignment: 'center' as 'left' | 'center' | 'right',
        orientation: 'vertical' as 'vertical' | 'horizontal' | 'square',
        motionEffects: false
    });
    const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | 'youtube' | 'tiktok' | null>(null);
    const [isPersonalizarOpen, setIsPersonalizarOpen] = useState(false);

    const autoColor = studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000000' : '#FFFFFF';
    const resolveColor = (color: string) => color === 'auto' ? 'inherit' : color;

    const DEFAULT_GALLERY = [
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
        'https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?w=600&q=80',
        // Naturaleza / cielos
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
        // Montañas y paisajes
        'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&q=80',
        'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=600&q=80',
        // Luz y amanecer
        'https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=600&q=80',
        'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=600&q=80',
        // Cruz y fe
        'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80',
        // Agua / río
        'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80',
        // Cielo estrellado
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    ];

    const [studioGallery, setStudioGallery] = useState(DEFAULT_GALLERY);
    const [galleryVisibleCount, setGalleryVisibleCount] = useState(6);
    const [swatchesExpanded, setSwatchesExpanded] = useState(false);
    const [studioTab, setStudioTab] = useState<'formato' | 'fondo' | 'texto'>('formato');

    const ALL_SWATCHES = [
        // Negros y blancos
        '#FFFFFF', '#000000',
        // Primarios
        '#EF4444', // rojo
        '#F97316', // naranja
        '#EAB308', // amarillo
        '#22C55E', // verde
        '#3B82F6', // azul
        '#8B5CF6', // violeta
        // Variantes oscuras
        '#991B1B', '#9A3412', '#854D0E', '#166534', '#1D4ED8', '#5B21B6',
        // Pasteles
        '#FEE2E2', '#FFEDD5', '#FEF9C3', '#DCFCE7', '#DBEAFE', '#EDE9FE',
    ];

    const [showColorPicker, setShowColorPicker] = useState(false);

    // El versículo activo es el último que se seleccionó (para notas y studio)
    const activeVerse = selectedVerses.length > 0 ? selectedVerses[selectedVerses.length - 1] : null;

    // Texto combinado de todos los versículos seleccionados (ordenados)
    const selectedVersesText = [...selectedVerses].sort((a, b) => a - b).map(v => verses[v - 1]).join(' ');
    const selectedVersesRef = (() => {
        const s = [...selectedVerses].sort((a, b) => a - b);
        if (s.length === 0) return `${selectedBook} ${selectedChapter}`;
        if (s.length === 1) return `${selectedBook} ${selectedChapter}:${s[0]}`;
        return `${selectedBook} ${selectedChapter}:${s[0]}-${s[s.length - 1]}`;
    })();
    const [selectedHighlightColor, setSelectedHighlightColor] = useState('blue');

    // Typography State
    const [fontSize, setFontSize] = useState(100);
    const [lineHeight, setLineHeight] = useState<'tight' | 'normal' | 'loose'>('normal');
    const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');

    const [isToolbarOpen, setIsToolbarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { toast } = useToast();
    const searchParams = useSearchParams();

    // Navigate to a specific book/chapter/verse from URL params (e.g. from global search)
    useEffect(() => {
        const book = searchParams.get('book');
        const chapter = searchParams.get('chapter');
        const verse = searchParams.get('verse');
        if (book && books.includes(book)) {
            setSelectedBook(book);
            setSelectedChapter(chapter ? parseInt(chapter) : 1);
            if (verse) {
                const verseNum = parseInt(verse);
                // Highlight the verse after a short delay so the chapter loads first
                setTimeout(() => {
                    setSelectedVerses([verseNum]);
                    const el = document.getElementById(`verse-${verseNum}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('savedVerses');
        if (saved) {
            setSavedVerses(JSON.parse(saved));
        }
        const highlights = localStorage.getItem('highlightedVerses');
        if (highlights) {
            setHighlightedVerses(JSON.parse(highlights));
        }
        const savedNotes = localStorage.getItem('userNotes');
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
        const savedCh = localStorage.getItem('savedChapters');
        if (savedCh) {
            setSavedChapters(JSON.parse(savedCh));
        }
        // Load user-uploaded gallery images from localStorage
        const savedGallery = localStorage.getItem('studioGalleryUploads');
        if (savedGallery) {
            const userImages: string[] = JSON.parse(savedGallery);
            setStudioGallery(prev => {
                const merged = [...userImages.filter(img => !prev.includes(img)), ...prev];
                return merged;
            });
        }
    }, []);

    useEffect(() => {
        const fetchChapter = async () => {
            setIsLoading(true);
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let raw: any;

                if (selectedVersion === 'rvr') {
                    const bookFileName = bookFileMap[selectedBook];
                    if (!bookFileName) { setVerses([]); return; }
                    raw = await import(`@/app/lib/bible_rvr/${bookFileName}.json`);
                    setVerses((raw.default ?? raw).chapters?.[selectedChapter - 1] ?? []);
                    return;
                }

                if (selectedVersion === 'huichol') {
                    const fileAbbr = HUICHOL_BOOK_MAP[selectedBook];
                    const loader = fileAbbr ? HUICHOL_LOADERS[fileAbbr] : null;
                    if (!loader) { setVerses([]); return; }
                    raw = await loader();
                    setVerses(parseHuicholChapter(raw, selectedChapter - 1));
                    return;
                }

                // Single-file Bibles — load once, index by canonical book order
                const idx = BOOK_INDEX[selectedBook] ?? 0;

                const versionFileMap: Record<string, () => Promise<unknown>> = {
                    rvg:    () => import(`@/app/lib/bible_es_rvg/es-rvg.json`),
                    kjv:    () => import(`@/app/lib/bible_kjv/en_kjv.json`),
                    asv:    () => import(`@/app/lib/bible_eng_asv/eng_asv.json`),
                    bbe:    () => import(`@/app/lib/bible_bbe/en_bbe.json`),
                    ar:     () => import(`@/app/lib/bible_ar_svd/ar_svd.json`),
                    de:     () => import(`@/app/lib/bible_de_schlachter/de_schlachter.json`),
                    el:     () => import(`@/app/lib/bible_el_greek/el_greek.json`),
                    eo:     () => import(`@/app/lib/bible_eo_esperanto/eo_esperanto.json`),
                    fi:     () => import(`@/app/lib/bible_fi_finnish/fi_finnish.json`),
                    fi_pr:  () => import(`@/app/lib/bible_fi_pr/fi_pr.json`),
                    fr:     () => import(`@/app/lib/bible_fr_apee/fr_apee.json`),
                    ko:     () => import(`@/app/lib/bible_ko_ko/ko_ko.json`),
                    pt_aa:  () => import(`@/app/lib/bible_pt_aa/pt_aa.json`),
                    pt_acf: () => import(`@/app/lib/bible_pt_acf/pt_acf.json`),
                    pt_nvi: () => import(`@/app/lib/bible_pt_nvi/pt_nvi.json`),
                    ro:     () => import(`@/app/lib/bible_ro_cornilescu/ro_cornilescu.json`),
                    ru:     () => import(`@/app/lib/bible_ru_synodal/ru_synodal.json`),
                    vi:     () => import(`@/app/lib/bible_vi_vietnamese/vi_vietnamese.json`),
                    zh_cuv: () => import(`@/app/lib/bible_zh_cuv/zh_cuv.json`),
                    zh_ncv: () => import(`@/app/lib/bible_zh_ncv/zh_ncv.json`),
                };
                const loader = versionFileMap[selectedVersion];
                if (!loader) { setVerses([]); return; }
                raw = await loader();

                const arr = raw.default ?? raw;
                setVerses(arr[idx]?.chapters?.[selectedChapter - 1] ?? []);
            } catch (error) {
                console.error("Failed to load chapter:", error);
                setVerses([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChapter();
    }, [selectedBook, selectedChapter, selectedVersion]);

    const handleVerseClick = (verseNumber: number) => {
        const isAlreadySelected = selectedVerses.includes(verseNumber);
        const newSelectedVerses = isAlreadySelected
            ? selectedVerses.filter(v => v !== verseNumber)
            : [...selectedVerses, verseNumber];

        setSelectedVerses(newSelectedVerses);
        setIsToolbarOpen(newSelectedVerses.length > 0);
        setShowColorPicker(false);

        if (newSelectedVerses.length > 0) {
            const lastVerse = newSelectedVerses[newSelectedVerses.length - 1];
            const reference = `${selectedBook} ${selectedChapter}:${lastVerse}`;
            setSelectedHighlightColor(highlightedVerses[reference] || 'blue');
        } else {
            setIsNoteOpen(false);
        }
    };

    const handleHighlightSubmit = (reference: string, color: string) => {
        const newHighlights = { ...highlightedVerses, [reference]: color };
        setHighlightedVerses(newHighlights);
        localStorage.setItem('highlightedVerses', JSON.stringify(newHighlights));
        setSelectedHighlightColor(color);
    };

    const handleFormat = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        if (contentEditableRef.current) {
            setNoteContent(contentEditableRef.current.innerHTML);
            contentEditableRef.current.focus();
        }
    };

    const saveCurrentSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            setSavedSelection(selection.getRangeAt(0));
        } else {
            setSavedSelection(null);
        }
    };

    const restoreSelection = () => {
        if (savedSelection) {
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(savedSelection);
        }
    };

    const confirmLink = () => {
        if (!linkInput) return;
        restoreSelection();
        document.execCommand('createLink', false, linkInput);
        if (contentEditableRef.current) {
            setNoteContent(contentEditableRef.current.innerHTML);
        }
        setIsLinkPopoverOpen(false);
        setLinkInput("");
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            restoreSelection();
            document.execCommand('insertImage', false, base64);
            if (contentEditableRef.current) {
                setNoteContent(contentEditableRef.current.innerHTML);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset input
    };

    const handleSocialBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setStudioTheme(prev => ({ ...prev, bgImage: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleClearNoteFields = () => {
        setNoteTitle("");
        setNoteContent("");
        setNoteTags([]);
        setEditingNoteId(null);
        if (contentEditableRef.current) contentEditableRef.current.innerHTML = "";
    };

    const handleDownloadPreview = async () => {
        // Deselect element so outlines/labels don't appear in the export
        setSelectedElement(null);

        // Wait for React to re-render without selection indicators
        await new Promise(r => setTimeout(r, 120));

        const node = document.getElementById(`preview-${studioTheme.orientation}`);
        if (!node) {
            toast({ title: "Error", description: "No se encontró el contenedor visual.", variant: "destructive" });
            return;
        }

        toast({ title: "Generando imagen..." });

        // Temporarily disable cross-origin stylesheets that cause SecurityError
        const disabledSheets: (HTMLStyleElement | HTMLLinkElement)[] = [];
        Array.from(document.styleSheets).forEach(sheet => {
            try { sheet.cssRules; } catch {
                if (sheet.ownerNode instanceof HTMLStyleElement || sheet.ownerNode instanceof HTMLLinkElement) {
                    sheet.ownerNode.disabled = true;
                    disabledSheets.push(sheet.ownerNode);
                }
            }
        });

        // Capture exact rendered size to avoid black margins from CSS centering/transforms
        const rect = node.getBoundingClientRect();

        // Temporarily override styles so the capture is pixel-perfect
        const prevBorderRadius = node.style.borderRadius;
        const prevOverflow = node.style.overflow;
        node.style.borderRadius = '0';
        node.style.overflow = 'hidden';

        try {
            const dataUrl = await toPng(node, {
                quality: 1,
                pixelRatio: 3,
                cacheBust: true,
                fontEmbedCSS: '',
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                style: {
                    margin: '0',
                    padding: node.style.padding || '',
                    borderRadius: '0',
                    overflow: 'hidden',
                    maxWidth: 'none',
                    transform: 'none',
                    position: 'relative',
                    left: '0',
                    top: '0',
                },
            });
            const link = document.createElement('a');
            link.download = `ici-nayarit-${studioTheme.orientation}.png`;
            link.href = dataUrl;
            link.click();
            toast({ title: "¡Imagen descargada exitosamente!" });
        } catch (err) {
            console.error("Error generating image:", err);
            toast({ title: "Error al descargar la imagen", description: "Ocurrió un error al exportar.", variant: "destructive" });
        } finally {
            node.style.borderRadius = prevBorderRadius;
            node.style.overflow = prevOverflow;
            disabledSheets.forEach(s => { s.disabled = false; });
        }
    };

    const handleSaveCustomNote = () => {
        if (!noteTitle.trim()) {
            toast({ title: "Faltan datos", description: "Por favor añade un título a tu reflexión.", variant: "destructive" });
            return;
        }

        const hasText = noteContent.replace(/<[^>]*>?/gm, '').trim().length > 0;
        const hasImg = noteContent.includes('<img');
        if (!hasText && !hasImg) {
            toast({ title: "Faltan datos", description: "El contenido de tu reflexión no puede estar vacío.", variant: "destructive" });
            return;
        }

        if (noteTags.length === 0) {
            toast({ title: "Faltan datos", description: "Por favor añade al menos un tag para guardar tu nota.", variant: "destructive" });
            return;
        }

        if (editingNoteId) {
            const updatedNotes = notes.map(n => n.id === editingNoteId ? {
                ...n,
                title: noteTitle.trim(),
                text: noteContent.trim(),
                tags: noteTags,
                date: new Date().toISOString() // optional update date
            } : n);
            setNotes(updatedNotes);
            localStorage.setItem('userNotes', JSON.stringify(updatedNotes));
            toast({ title: "Reflexión actualizada correctamente 📓" });
        } else {
            const newNote: CustomNote = {
                id: Date.now().toString(),
                title: noteTitle.trim(),
                text: noteContent.trim(),
                reference: `${selectedBook} ${selectedChapter}:${activeVerse}`,
                date: new Date().toISOString(),
                tags: noteTags
            };

            const updatedNotes = [newNote, ...notes];
            setNotes(updatedNotes);
            localStorage.setItem('userNotes', JSON.stringify(updatedNotes));
            toast({ title: "Reflexión guardada correctamente 📓" });
        }

        handleClearNoteFields();
        setIsNoteOpen(false);
    };

    const handleEditNote = (note: CustomNote) => {
        setEditingNoteId(note.id);
        setNoteTitle(note.title);
        setNoteContent(note.text);
        setNoteTags(note.tags || []);
        setIsNoteOpen(true);

        setTimeout(() => {
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = note.text;
            }
        }, 0);
    };

    const handleAddTag = () => {
        const trimmedText = tagInput.trim().replace(/^#/, ''); // Remove # if user typed it
        if (trimmedText && !noteTags.includes(trimmedText)) {
            setNoteTags([...noteTags, trimmedText]);
        }
        setTagInput('');
        setIsAddingTag(false);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setNoteTags(noteTags.filter(t => t !== tagToRemove));
    };

    const getRelativeTime = (dateString: string) => {
        if (!mounted || !dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `Hace ${minutes} min`;
        return 'Hace un momento';
    };

    const handleSaveVerse = (verseText: string, verseNumber: number) => {
        const reference = `${selectedBook} ${selectedChapter}:${verseNumber}`;
        const newVerse = { text: verseText, reference };

        let updatedSavedVerses;
        if (savedVerses.some(v => v.reference === reference)) {
            updatedSavedVerses = savedVerses.filter(v => v.reference !== reference);
            toast({
                title: "Versículo Eliminado",
                description: "Has eliminado el versículo de tus guardados.",
            });
        } else {
            updatedSavedVerses = [...savedVerses, newVerse];
            toast({
                title: "Versículo Guardado",
                description: `Has guardado ${reference}.`,
            });
        }

        setSavedVerses(updatedSavedVerses);
        localStorage.setItem('savedVerses', JSON.stringify(updatedSavedVerses));
    };

    const handleSaveChapter = () => {
        const already = savedChapters.some(c => c.book === selectedBook && c.chapter === selectedChapter);
        let updated;
        if (already) {
            updated = savedChapters.filter(c => !(c.book === selectedBook && c.chapter === selectedChapter));
            toast({ title: "Capítulo eliminado", description: `${selectedBook} ${selectedChapter} fue eliminado de guardados.` });
        } else {
            updated = [...savedChapters, { book: selectedBook, chapter: selectedChapter, verses }];
            toast({ title: "Capítulo guardado", description: `${selectedBook} ${selectedChapter} fue guardado exitosamente.` });
        }
        setSavedChapters(updated);
        localStorage.setItem('savedChapters', JSON.stringify(updated));
    };

    const handleShareVerse = async (verseText: string, verseNumber: number) => {
        const reference = `${selectedBook} ${selectedChapter}:${verseNumber}`;
        const textToShare = `"${verseText}" - ${reference}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Versículo de la Biblia',
                    text: textToShare,
                });
                toast({
                    title: "Versículo Compartido",
                    description: "El versículo ha sido compartido.",
                });
            } catch (error: any) {
                if (error.message !== 'Share canceled') {
                    console.error('Error al compartir:', error);
                    toast({
                        title: "Error",
                        description: "No se pudo compartir el versículo.",
                        variant: "destructive",
                    });
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(textToShare);
                toast({
                    title: "Versículo Copiado",
                    description: "El versículo ha sido copiado al portapapeles.",
                });
            } catch (error) {
                console.error('Error al copiar:', error);
                toast({
                    title: "Error",
                    description: "No se pudo copiar el versículo.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleBookChange = (book: string) => {
        setSelectedBook(book);
        setSelectedChapter(1);
        setSelectedVerses([]);
        setIsNoteOpen(false);
    };

    const totalChapters = chaptersPerBook[selectedBook] || 1;

    const goToNextChapter = () => {
        if (selectedChapter < totalChapters) {
            setSelectedChapter(selectedChapter + 1);
            setSelectedVerses([]);
            setIsNoteOpen(false);
        }
    };

    const goToPreviousChapter = () => {
        if (selectedChapter > 1) {
            setSelectedChapter(selectedChapter - 1);
            setSelectedVerses([]);
            setIsNoteOpen(false);
        }
    };

    const chapters = chaptersPerBook[selectedBook] ? Array.from({ length: chaptersPerBook[selectedBook] }, (_, i) => i + 1) : [];

    const getThemeStyles = () => {
        switch (theme) {
            case 'dark': return { bg: 'bg-[#0B1120]', card: 'bg-[#151D2C] border-gray-800 shadow-xl', text: 'text-gray-300', title: 'text-gray-100', subtitle: 'text-gray-400', verseHighlight: 'bg-blue-900/30 text-blue-400', buttonHover: 'hover:bg-gray-800 hover:text-gray-200' };
            case 'sepia': return { bg: 'bg-[#F4ECE3]', card: 'bg-[#FDF6E3] border-[#EADAB8] shadow-md', text: 'text-[#5C4D3C]', title: 'text-[#3B2C1C]', subtitle: 'text-[#8A7967]', verseHighlight: 'bg-[#EADAB8]/50 text-[#8B5A2B]', buttonHover: 'hover:bg-[#F4ECE3] hover:text-[#3B2C1C]' };
            default: return { bg: 'bg-[#F8F9FA]', card: 'bg-white border-gray-100/50 shadow-lg', text: 'text-[#4B5563]', title: 'text-[#111827]', subtitle: 'text-[#9CA3AF]', verseHighlight: 'bg-[#EEF4FF] text-[#3B82F6]', buttonHover: 'hover:bg-gray-50 hover:text-gray-700' };
        }
    };
    const themeStyles = getThemeStyles();

    const getLineHeightClass = () => {
        switch (lineHeight) {
            case 'tight': return 'leading-[1.5]';
            case 'loose': return 'leading-[2.2]';
            default: return 'leading-[1.8]';
        }
    };

    return (
        <section id="bible" className={`w-full py-12 md:py-24 lg:py-32 transition-colors duration-500 ${themeStyles.bg}`}>
            <div className="container mx-auto px-4 md:px-6">
                {!isStudioOpen && (!isNoteOpen ? (
                <div key="bible-view" className="mx-auto max-w-4xl animate-in fade-in slide-in-from-left-4 duration-300">

                    {/* BIBLIA */}
                    <div className="w-full">
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Select value={selectedVersion} onValueChange={v => { setSelectedVersion(v as VersionId); setSelectedVerses([]); }}>
                                    <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-[#B88A44] hover:text-white font-bold py-3 px-4 rounded-full transition-colors focus:outline-none text-sm min-h-[44px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VERSIONS.map(v => (
                                            <SelectItem key={v.id} value={v.id}>
                                                <span className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                                        v.lang === 'ES' ? 'bg-amber-100 text-amber-700' :
                                                        v.lang === 'EN' ? 'bg-blue-100 text-blue-700' :
                                                        v.lang === 'PT' ? 'bg-green-100 text-green-700' :
                                                        v.lang === 'ZH' || v.lang === 'KO' ? 'bg-red-100 text-red-700' :
                                                        v.lang === 'RU'  ? 'bg-indigo-100 text-indigo-700' :
                                                        v.lang === 'HCH' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>{v.lang}</span>
                                                    {v.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedBook} onValueChange={handleBookChange}>
                                    <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-[#B88A44] hover:text-white font-bold py-3 px-4 rounded-full transition-colors focus:outline-none text-sm min-h-[44px]">
                                        <SelectValue placeholder="Seleccionar libro" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {books.map(book => (
                                            <SelectItem key={book} value={book}>{book}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedChapter.toString()} onValueChange={(val) => { setSelectedChapter(Number(val)); setSelectedVerses([]); setIsNoteOpen(false); }}>
                                    <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-[#B88A44] hover:text-white font-bold py-3 px-4 rounded-full transition-colors focus:outline-none text-sm min-h-[44px]">
                                        <SelectValue placeholder="Capítulo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {chapters.map(chapter => (
                                            <SelectItem key={chapter} value={chapter.toString()}>Capítulo {chapter}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end">
                                <Link href="/biblia/guardados">
                                    <Button className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-[#B88A44] hover:text-white font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm min-h-[44px]">Versículos Guardados</Button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <Button onClick={goToPreviousChapter} disabled={selectedChapter === 1} className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+8px)] bg-white border border-gray-300 font-bold p-3 rounded-full transition-colors focus:outline-none text-sm shadow-sm z-10 hidden md:block ${themeStyles.text}`}>
                                <ChevronLeft className="h-6 w-6" />
                            </Button>

                            <Card className={`border md:rounded-[40px] overflow-visible relative mt-8 transition-colors duration-500 ${themeStyles.card}`}
                                onClick={(e) => {
                                    const target = e.target as HTMLElement;
                                    // Clear selection when clicking on the card background (not on a verse element)
                                    if (!target.closest('[data-verse]')) {
                                        setSelectedVerses([]);
                                        setIsToolbarOpen(false);
                                        setShowColorPicker(false);
                                    }
                                }}
                            >
                                <CardContent className="px-6 pt-12 pb-8 md:px-16 md:pt-[100px] md:pb-16 relative overflow-visible">
                                    {/* Header Area */}
                                    <div className="flex justify-between items-start mb-12">
                                        <div>
                                            <h2 className={`text-3xl md:text-[34px] font-bold font-sans tracking-tight mb-2 ${themeStyles.title}`}>{selectedBook} {selectedChapter}</h2>
                                            <p className={`text-xs md:text-[13px] font-bold flex items-center gap-2 ${themeStyles.subtitle}`}>
                                                {VERSIONS.find(v => v.id === selectedVersion)?.label ?? 'Reina-Valera 1960'}
                                                {(() => {
                                                    const lang = VERSIONS.find(v => v.id === selectedVersion)?.lang ?? 'ES';
                                                    const cls = lang === 'ES' ? 'bg-amber-100 text-amber-700' :
                                                        lang === 'EN' ? 'bg-blue-100 text-blue-700' :
                                                        lang === 'PT' ? 'bg-green-100 text-green-700' :
                                                        lang === 'ZH' || lang === 'KO' ? 'bg-red-100 text-red-700' :
                                                        lang === 'RU'  ? 'bg-indigo-100 text-indigo-700' :
                                                        lang === 'HCH' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-600';
                                                    return <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${cls}`}>{lang}</span>;
                                                })()}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            {/*
                                <Button variant="outline" size="icon" className={`w-10 h-10 rounded-xl border border-gray-200/80 shadow-sm ${themeStyles.text} ${themeStyles.buttonHover}`}>
                                    <Languages className="h-[18px] w-[18px]" />
                                </Button>
                            */}

                                            {/* TYPOGRAPHY SETTINGS POPOVER */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="icon" className={`w-10 h-10 rounded-xl border border-gray-200/80 shadow-sm ${themeStyles.text} ${themeStyles.buttonHover}`}>
                                                        <Type className="h-[18px] w-[18px]" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-6 rounded-2xl shadow-2xl bg-white border border-gray-100 font-sans" align="end">
                                                    <h4 className="text-[11px] font-black tracking-widest text-[#6B7280] uppercase mb-6">Typography Settings</h4>

                                                    {/* Font Size */}
                                                    <div className="mb-6">
                                                        <p className="text-[13px] font-bold text-gray-500 mb-2">Font Size</p>
                                                        <div className="flex items-center justify-between bg-[#F8F9FA] rounded-xl p-1">
                                                            <button onClick={() => setFontSize(Math.max(80, fontSize - 10))} className="flex-1 py-2 font-bold text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors flex items-center justify-center">A-</button>
                                                            <div className="w-px h-6 bg-gray-200"></div>
                                                            <span className="flex-1 text-center font-bold text-gray-900 text-[15px]">{fontSize}%</span>
                                                            <div className="w-px h-6 bg-gray-200"></div>
                                                            <button onClick={() => setFontSize(Math.min(150, fontSize + 10))} className="flex-1 py-2 font-bold text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors flex items-center justify-center">A+</button>
                                                        </div>
                                                    </div>

                                                    {/* Line Height */}
                                                    <div className="mb-6">
                                                        <p className="text-[13px] font-bold text-gray-500 mb-2">Line Height</p>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {[
                                                                { id: 'tight', visual: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21l-3-3m3 3l3-3M12 3l-3 3m3-3l3 3M12 21V3" /><path d="M18 7H6M18 12H6M18 17H6" /></svg> },
                                                                { id: 'normal', visual: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21l-3-3m3 3l3-3M11 3l-3 3m3-3l3 3M11 21V3" /><path d="M18 6H7M18 12H7M18 18H7" /></svg> },
                                                                { id: 'loose', visual: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 21l-3-3m3 3l3-3M10 3l-3 3m3-3l3 3M10 21V3" /><path d="M18 5H6M18 12H6M18 19H6" /></svg> }
                                                            ].map(lh => (
                                                                <button key={lh.id} onClick={() => setLineHeight(lh.id as any)} className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${lineHeight === lh.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                                                                    {lh.visual}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Theme */}
                                                    <div>
                                                        <p className="text-[13px] font-bold text-gray-500 mb-2">Theme</p>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <button onClick={() => setTheme('light')} className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-blue-500' : 'border-gray-100 hover:border-gray-200'}`}>
                                                                <div className="w-full h-8 bg-white border border-gray-200 rounded-md mb-2"></div>
                                                                <span className="text-[11px] font-bold text-gray-700">Light</span>
                                                            </button>
                                                            <button onClick={() => setTheme('sepia')} className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${theme === 'sepia' ? 'border-blue-500' : 'border-gray-100 hover:border-gray-200'}`}>
                                                                <div className="w-full h-8 bg-[#F6EDD9] rounded-md mb-2"></div>
                                                                <span className="text-[11px] font-bold text-gray-700">Sepia</span>
                                                            </button>
                                                            <button onClick={() => setTheme('dark')} className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-blue-500' : 'border-gray-100 hover:border-gray-200'}`}>
                                                                <div className="w-full h-8 bg-[#0B1120] rounded-md mb-2"></div>
                                                                <span className="text-[11px] font-bold text-gray-700">Dark</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Verses Area */}
                                    <div
                                        className={`space-y-4 text-left font-sans transition-all duration-500 ${themeStyles.text} ${getLineHeightClass()}`}
                                        style={{ fontSize: `${(fontSize / 100) * 16}px` }}
                                        onClick={(e) => {
                                            // If the click target is the container itself (not a verse), clear selection
                                            if (e.target === e.currentTarget) {
                                                setSelectedVerses([]);
                                                setIsToolbarOpen(false);
                                                setShowColorPicker(false);
                                            }
                                        }}
                                    >
                                        {isLoading ? (
                                            <p>Cargando...</p>
                                        ) : verses.length > 0 ? (
                                            verses.map((verse, index) => {
                                                const reference = `${selectedBook} ${selectedChapter}:${index + 1}`;
                                                const isSelected = selectedVerses.includes(index + 1);
                                                const isLastSelected = selectedVerses.length > 0 && selectedVerses[selectedVerses.length - 1] === index + 1;
                                                const isHighlighted = highlightedVerses[reference];
                                                const activeColorId = isSelected ? selectedHighlightColor : isHighlighted;

                                                const hlColors: Record<string, string> = {
                                                    yellow: 'bg-[#FFF9D6] text-[#B88A44]',
                                                    green: 'bg-[#E6F8F0] text-[#10B981]',
                                                    blue: 'bg-[#EEF4FF] text-[#3B82F6]',
                                                    pink: 'bg-[#FDF2F8] text-[#EC4899]',
                                                    purple: 'bg-[#F5F3FF] text-[#8B5CF6]',
                                                    orange: 'bg-[#FFF7ED] text-[#F97316]'
                                                };

                                                const activeHlStyles = activeColorId ? hlColors[activeColorId] : '';
                                                const containerClasses = (isSelected || isHighlighted)
                                                    ? `${activeHlStyles} px-4 py-3 -mx-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]`
                                                    : `${themeStyles.buttonHover} py-1.5 cursor-pointer`;

                                                return (
                                                    <div key={index} id={`verse-${index + 1}`} data-verse={index + 1} className={`relative rounded-xl transition-all duration-200 ${containerClasses}`}>
                                                        {/* Toolbar: solo aparece sobre el último versículo seleccionado */}
                                                        {isLastSelected && (
                                                            <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 bg-[#1F2937] shadow-xl rounded-[10px] flex items-center px-1.5 py-1 z-30 transition-all font-sans max-w-[calc(100vw-2rem)] overflow-x-auto">
                                                                {/* Triangle pointer */}
                                                                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#1F2937] rotate-45 rounded-sm"></div>

                                                                {/* Toolbar Buttons */}
                                                                <div className="flex items-center space-x-0.5 relative z-40">

                                                                    {/* COLOR PICKER POPOVER */}
                                                                    {showColorPicker && (
                                                                        <div className="absolute -top-[52px] left-0 bg-white border border-gray-100 shadow-xl rounded-full px-2.5 py-2 flex gap-2.5 animate-in fade-in zoom-in duration-200 origin-bottom-left">
                                                                            {[
                                                                                { id: 'yellow', color: 'bg-[#FCEBA2]' },
                                                                                { id: 'green', color: 'bg-[#BBF7D0]' },
                                                                                { id: 'blue', color: 'bg-[#BFDBFE]' },
                                                                                { id: 'pink', color: 'bg-[#FBCFE8]' },
                                                                                { id: 'purple', color: 'bg-[#E9D5FF]' },
                                                                                { id: 'orange', color: 'bg-[#FED7AA]' }
                                                                            ].map((c) => (
                                                                                <button
                                                                                    key={c.id}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const newHighlights = { ...highlightedVerses };
                                                                                        selectedVerses.forEach(v => {
                                                                                            newHighlights[`${selectedBook} ${selectedChapter}:${v}`] = c.id;
                                                                                        });
                                                                                        setHighlightedVerses(newHighlights);
                                                                                        localStorage.setItem('highlightedVerses', JSON.stringify(newHighlights));
                                                                                        setSelectedHighlightColor(c.id);
                                                                                        setShowColorPicker(false);
                                                                                        toast({ title: selectedVerses.length > 1 ? `${selectedVerses.length} versículos resaltados` : 'Resaltado guardado' });
                                                                                    }}
                                                                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${c.color} ${selectedHighlightColor === c.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                                                                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md text-white text-[11px] font-semibold tracking-wide transition-colors"
                                                                    >
                                                                        <span className="text-white text-[9px] -mt-0.5">▲</span> Highlight
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setIsNoteOpen(true); }}
                                                                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md text-white text-[11px] font-semibold tracking-wide transition-colors"
                                                                    >
                                                                        <StickyNote className="h-3.5 w-3.5" /> Note
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            selectedVerses.forEach(v => handleSaveVerse(verses[v - 1], v));
                                                                        }}
                                                                        className="p-2 hover:bg-white/10 rounded-md transition-colors"
                                                                    >
                                                                        {(() => {
                                                                            const allSaved = selectedVerses.every(v =>
                                                                                savedVerses.some(sv => sv.reference === `${selectedBook} ${selectedChapter}:${v}`)
                                                                            );
                                                                            return <Bookmark className={`h-3.5 w-3.5 transition-all ${allSaved ? 'fill-white text-white' : 'fill-none text-gray-300'}`} />;
                                                                        })()}
                                                                    </button>
                                                                    <div className="w-px h-5 bg-white/10 mx-1"></div>
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            const sorted = [...selectedVerses].sort((a, b) => a - b);
                                                                            const text = sorted.map(v => `${v} ${verses[v - 1]}`).join('\n');
                                                                            await navigator.clipboard.writeText(text);
                                                                            toast({ title: "Copiado" });
                                                                        }}
                                                                        className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors">
                                                                        <Copy className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const sorted = [...selectedVerses].sort((a, b) => a - b);
                                                                            const combinedText = sorted.map(v => verses[v - 1]).join(' ');
                                                                            handleShareVerse(combinedText, sorted[0]);
                                                                        }}
                                                                        className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors">
                                                                        <Share2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <p className={`flex-grow transition-colors duration-300 ${(isSelected || isHighlighted) ? 'font-medium' : ''}`} onClick={() => handleVerseClick(index + 1)}>
                                                            <sup className={`font-bold mr-2.5 text-[65%] ${(isSelected || isHighlighted) ? '' : themeStyles.subtitle}`}>{index + 1}</sup>
                                                            {verse}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            selectedVersion === 'huichol' ? (
                                                <div className="flex flex-col items-center text-center py-12 px-6 gap-5">
                                                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl select-none">
                                                        🌿
                                                    </div>
                                                    <div className="max-w-sm">
                                                        <p className="text-base font-black text-gray-800 leading-snug mb-2">
                                                            En proceso de traducción
                                                        </p>
                                                        <p className="text-sm text-gray-500 leading-relaxed">
                                                            Este libro aún se está traduciendo al idioma Wixárika (Huichol).
                                                            Estamos trabajando para integrarlo lo más pronto posible.
                                                        </p>
                                                        <p className="text-xs text-orange-500 font-bold mt-4 tracking-wide uppercase">
                                                            ¡Muchas gracias por tu paciencia! 🙏
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">No se encontró el contenido de este capítulo.</p>
                                            )
                                        )}
                                    </div>

                                    {/* Footer Area */}
                                    <div className={`mt-20 pt-8 border-t flex justify-end font-sans ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                                        {(() => {
                                            const isChapterSaved = savedChapters.some(c => c.book === selectedBook && c.chapter === selectedChapter);
                                            return (
                                                <button onClick={handleSaveChapter} className={`flex items-center gap-2 text-[13px] font-bold transition-colors ${isChapterSaved ? 'text-[#B88A44] hover:text-[#8a6432]' : 'text-[#6B7280] hover:text-[#111827]'}`}>
                                                    <Bookmark className={`w-[18px] h-[18px] transition-all ${isChapterSaved ? 'fill-[#B88A44] text-[#B88A44]' : 'fill-[#9CA3AF] text-[#9CA3AF]'}`} /> {isChapterSaved ? 'Guardado' : 'Guardar capítulo'}
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Button onClick={goToNextChapter} disabled={selectedChapter === chapters.length} className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] bg-white border border-gray-300 font-bold p-3 rounded-full transition-colors focus:outline-none text-sm shadow-sm z-10 hidden md:block ${themeStyles.text}`}>
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                </div>
                ) : (
                <div key="note-view" className="animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="w-full h-[calc(100svh-6rem)] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 lg:px-10 py-4 border-b border-gray-100 bg-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => { handleClearNoteFields(); setIsNoteOpen(false); }}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-800 transition-colors group"
                                    >
                                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                                        <span className="text-xs font-bold hidden sm:inline">Volver</span>
                                    </button>
                                    <div className="w-px h-7 bg-gray-100"></div>
                                    <div>
                                        <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                                            <StickyNote className="w-3 h-3" />
                                            NOTAS <span className="text-gray-300">/</span> {selectedBook} {selectedChapter}:{activeVerse}
                                        </p>
                                        <h2 className="text-base lg:text-xl font-black text-gray-900 tracking-tight leading-none">
                                            {editingNoteId ? 'Editar Reflexión' : 'Nueva Nota'}
                                        </h2>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleClearNoteFields} className="hidden sm:flex px-3 lg:px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors items-center gap-1.5">
                                        Limpiar
                                    </button>
                                    <button onClick={handleSaveCustomNote} className="px-4 lg:px-6 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl text-xs lg:text-[13px] font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md shadow-blue-600/20 transition-colors">
                                        <Save className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Guardar Nota</span>
                                        <span className="sm:hidden">Guardar</span>
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F8FAFC]">

                                {/* Left Sidebar */}
                                <div className="w-full lg:w-80 xl:w-96 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col overflow-y-auto shrink-0">

                                    {/* Verse context */}
                                    <div className="p-5 border-b border-gray-50">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <BookOpen className="w-3 h-3" /> Versículo seleccionado
                                        </p>
                                        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
                                            <span className="absolute left-3 top-2 text-5xl text-blue-200 font-serif leading-none select-none">"</span>
                                            <p className="text-[13px] font-serif italic text-gray-700 leading-relaxed relative z-10 pt-3 px-2">
                                                {selectedVersesText || verses[(activeVerse ?? 1) - 1]}
                                            </p>
                                            <span className="absolute right-3 bottom-1 text-5xl text-blue-200 font-serif leading-none select-none">"</span>
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-4 text-right">{selectedVersesRef}</p>
                                        </div>
                                    </div>

                                    {/* ── Social Asset Preview ── */}
                                    <div className="p-5 border-b border-gray-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <ShareIcon className="w-3 h-3" /> Recursos para redes sociales
                                            </p>
                                        </div>

                                        {/* Format Toggle */}
                                        <div className="flex bg-gray-50 p-1 rounded-xl mb-4">
                                            {(['vertical','horizontal'] as const).map(f => (
                                                <button key={f} onClick={() => setSocialFormat(f)}
                                                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${socialFormat === f ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                                    {f === 'vertical' ? 'Vertical' : 'Horizontal'}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Mini Preview */}
                                        <div
                                            className={`relative rounded-2xl flex flex-col items-center justify-center px-6 py-8 text-center mx-auto mb-4 shadow-md overflow-hidden transition-all duration-300 ${socialFormat === 'vertical' ? 'aspect-[9/16] w-[60%]' : 'aspect-video w-full'}`}
                                            style={{
                                                backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor,
                                                backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none',
                                                backgroundSize: 'cover', backgroundPosition: 'center',
                                            }}
                                        >
                                            {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                            <p className="font-serif italic text-sm leading-snug relative z-10" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>
                                                "{selectedVersesText || verses[(activeVerse ?? 1) - 1]}"
                                            </p>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] mt-4 relative z-10" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>
                                                {selectedVersesRef}
                                            </p>
                                            <p className="text-[7px] font-black tracking-widest relative z-10 mt-2" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>
                                                www.iciarnayarit.com
                                            </p>
                                        </div>

                                        {/* Personalizar toggle */}
                                        <button
                                            onClick={() => { setIsPersonalizarOpen(false); setIsNoteOpen(false); setIsStudioOpen(true); setGalleryVisibleCount(6); setSwatchesExpanded(false); resetDragPos(); setSelectedPlatform(null); setStudioTab('formato'); }}
                                            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        >
                                            <Palette className="w-3.5 h-3.5" />
                                            Personalizar
                                        </button>

                                    </div>

                                    {/* Recent notes */}
                                    <div className="p-5 flex-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Notas recientes
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            {notes.length > 0 ? notes.slice(0, 6).map((note, i) => (
                                                <button
                                                    key={note.id}
                                                    onClick={() => handleEditNote(note)}
                                                    className={`text-left px-3 py-2.5 rounded-xl border transition-all hover:shadow-sm ${editingNoteId === note.id ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:bg-white'}`}
                                                >
                                                    <p className={`text-[12px] font-bold truncate ${editingNoteId === note.id ? 'text-blue-700' : 'text-gray-800'}`}>{note.title}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{note.reference} · {getRelativeTime(note.date)}</p>
                                                    {(note.tags ?? []).length > 0 && (
                                                        <div className="flex gap-1 mt-1.5 flex-wrap">
                                                            {(note.tags ?? []).slice(0, 3).map(t => (
                                                                <span key={t} className="text-[8px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">#{t}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </button>
                                            )) : (
                                                <p className="text-[11px] text-gray-400 italic text-center py-4">No hay notas aún.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Editor */}
                                <div className="flex-1 min-h-[55vh] lg:min-h-0 overflow-y-auto">
                                    <div className="max-w-3xl mx-auto p-6 lg:p-10 flex flex-col gap-6 h-full">

                                        {/* Title */}
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Título de la reflexión</label>
                                            <input
                                                type="text"
                                                value={noteTitle}
                                                onChange={(e) => setNoteTitle(e.target.value)}
                                                placeholder="Ej: El poder de la palabra creadora…"
                                                className="w-full bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 text-2xl font-bold placeholder-gray-200 focus:ring-0 focus:border-blue-500 px-0 pb-3 transition-colors focus:outline-none"
                                            />
                                        </div>

                                        {/* Rich Text Toolbar */}
                                        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 sticky top-0 z-10">
                                            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Negrita"><Bold className="w-4 h-4" /></button>
                                            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Cursiva"><Italic className="w-4 h-4" /></button>
                                            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Lista"><List className="w-4 h-4" /></button>
                                            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('formatBlock', 'blockquote'); }} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Cita"><Quote className="w-4 h-4" /></button>
                                            <div className="w-px h-5 bg-gray-200 mx-1"></div>
                                            <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <button type="button" onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }} onClick={() => setIsLinkPopoverOpen(true)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Enlace"><LinkIcon className="w-4 h-4" /></button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-4 rounded-xl shadow-xl border-gray-100" sideOffset={12}>
                                                    <div className="flex flex-col gap-3">
                                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Añadir Enlace</label>
                                                        <div className="flex gap-2">
                                                            <input type="url" autoFocus value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="https://..." className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmLink(); } else if (e.key === 'Escape') { setIsLinkPopoverOpen(false); } }} />
                                                            <button type="button" onClick={confirmLink} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">Insertar</button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                                            <button type="button" onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }} onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Imagen"><ImgIcon className="w-4 h-4" /></button>
                                            <div className="ml-auto flex items-center gap-1.5 text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-medium hidden sm:inline">
                                                    {mounted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Editor Body */}
                                        <style>{`
                                            .note-modal-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
                                            .note-modal-editor blockquote { border-left: 4px solid #E5E7EB; padding-left: 1rem; color: #6B7280; font-style: italic; margin: 0.5rem 0; }
                                            .note-modal-editor img { max-width: 100%; border-radius: 0.75rem; margin-top: 1rem; }
                                            .note-modal-editor a { color: #3B82F6; text-decoration: underline; }
                                            .note-modal-editor p { min-height: 1.5em; }
                                        `}</style>
                                        <div className="relative flex-1 min-h-[260px] bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                            {(!noteContent || noteContent === '<br>') && (
                                                <p className="absolute top-6 left-6 text-gray-300 pointer-events-none text-base font-medium select-none">Escribe lo que Dios puso en tu corazón…</p>
                                            )}
                                            <div
                                                ref={contentEditableRef}
                                                contentEditable
                                                onInput={(e) => setNoteContent(e.currentTarget.innerHTML)}
                                                className="w-full h-full bg-transparent text-gray-700 text-base leading-relaxed focus:outline-none note-modal-editor"
                                            />
                                        </div>

                                        {/* Tags */}
                                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Etiquetas</p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {noteTags.map((tag, i) => (
                                                    <span key={i} className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-100">
                                                        #{tag}
                                                        <button onClick={() => handleRemoveTag(tag)} className="text-blue-300 hover:text-blue-700 transition-colors"><X className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                                {isAddingTag ? (
                                                    <input type="text" autoFocus value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } else if (e.key === 'Escape') { setIsAddingTag(false); } }} onBlur={handleAddTag} className="border border-blue-400 text-blue-600 outline-none text-xs font-bold px-3 py-1.5 rounded-full w-[110px] bg-blue-50 transition-colors" placeholder="etiqueta…" />
                                                ) : (
                                                    <button onClick={() => setIsAddingTag(true)} className="border border-dashed border-gray-300 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:border-blue-400 hover:text-blue-500 transition-colors">+ Añadir</button>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ))}

                {isStudioOpen && activeVerse !== null && (
                    <div key="studio-view" className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="w-full h-[calc(100svh-6rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                            {/* ── Header ── */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsStudioOpen(false)} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors group">
                                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                        <span className="text-xs font-bold hidden sm:inline">Volver</span>
                                    </button>
                                    <div className="w-px h-5 bg-gray-200" />
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <ImageIcon className="w-3 h-3" /> Editor · {selectedVersesRef}
                                        </p>
                                        <h2 className="text-sm font-black text-gray-900 leading-tight">Vista Previa de Publicación</h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={resetDragPos} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors min-h-[36px]">
                                        <X className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Restablecer</span>
                                    </button>
                                    <button onClick={handleDownloadPreview} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 transition-colors">
                                        <Download className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Descargar imagen</span>
                                        <span className="sm:hidden">Descargar</span>
                                    </button>
                                </div>
                            </div>

                            {/* ── Body ── */}
                            <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden">

                                {/* Canvas Area */}
                                <div className="flex-1 overflow-y-auto flex items-start justify-center p-4 lg:p-10 custom-scrollbar bg-gray-50">
                                    <div className="flex flex-col items-center gap-4 w-full">
                                        <p className="text-[10px] text-gray-400 select-none tracking-wide">
                                            ✦ Arrastra los textos para reposicionarlos
                                        </p>

                                        {/* Vertical */}
                                        <div className={`flex-col items-center gap-3 w-full ${studioTheme.orientation !== 'vertical' ? 'hidden' : 'flex'}`}>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                <div className="h-px w-8 bg-gray-200" />
                                                Vertical 9:16 · TikTok / Historia
                                                <div className="h-px w-8 bg-gray-200" />
                                            </div>
                                            <div id="preview-vertical" onPointerDown={() => setSelectedElement(null)}
                                                className="w-full max-w-[280px] mx-auto aspect-[9/16] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-8 text-center ring-1 ring-white/10 transition-all duration-300"
                                                style={{ backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor, backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <GridOverlay visible={isCanvasDragging} snapX={activeSnap.x} snapY={activeSnap.y} />
                                                <DraggableText position={dragPos.ref} onPositionChange={(pos) => setDragPos(p => ({ ...p, ref: pos }))} isSelected={selectedElement === 'ref'} onSelect={() => { setSelectedElement('ref'); setStudioTab('texto'); }} label="Referencia" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="uppercase tracking-[0.2em] z-20 mb-8 select-none" style={{ fontSize: `${elementStyles.ref.fontSize}px`, fontWeight: elementStyles.ref.fontWeight, textAlign: elementStyles.ref.textAlign as any, color: resolveColor(elementStyles.ref.color) }}>{selectedVersesRef}</p>
                                                </DraggableText>
                                                <DraggableText position={dragPos.verse} onPositionChange={(pos) => setDragPos(p => ({ ...p, verse: pos }))} isSelected={selectedElement === 'verse'} onSelect={() => { setSelectedElement('verse'); setStudioTab('texto'); }} label="Versículo" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="font-serif z-20 w-full leading-tight select-none" style={{ fontSize: `${elementStyles.verse.fontSize}px`, fontWeight: elementStyles.verse.fontWeight, textAlign: elementStyles.verse.textAlign as any, color: resolveColor(elementStyles.verse.color) }}>"{selectedVersesText}"</p>
                                                </DraggableText>
                                                <DraggableText position={dragPos.website} onPositionChange={(pos) => setDragPos(p => ({ ...p, website: pos }))} isSelected={selectedElement === 'website'} onSelect={() => { setSelectedElement('website'); setStudioTab('texto'); }} label="Sitio web" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="tracking-widest z-20 mt-6 select-none" style={{ fontSize: `${elementStyles.website.fontSize}px`, fontWeight: elementStyles.website.fontWeight, textAlign: elementStyles.website.textAlign as any, color: resolveColor(elementStyles.website.color) }}>www.iciarnayarit.com</p>
                                                </DraggableText>
                                            </div>
                                        </div>

                                        {/* Horizontal */}
                                        <div className={`flex-col items-center gap-3 w-full ${studioTheme.orientation !== 'horizontal' ? 'hidden' : 'flex'}`}>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                <div className="h-px w-8 bg-gray-200" />
                                                Horizontal 16:9 · Facebook / YouTube
                                                <div className="h-px w-8 bg-gray-200" />
                                            </div>
                                            <div id="preview-horizontal" onPointerDown={() => setSelectedElement(null)}
                                                className="w-full max-w-[560px] mx-auto aspect-video rounded-2xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-8 text-center ring-1 ring-white/10 transition-all duration-300"
                                                style={{ backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor, backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <GridOverlay visible={isCanvasDragging} snapX={activeSnap.x} snapY={activeSnap.y} />
                                                <DraggableText position={dragPos.verse} onPositionChange={(pos) => setDragPos(p => ({ ...p, verse: pos }))} isSelected={selectedElement === 'verse'} onSelect={() => { setSelectedElement('verse'); setStudioTab('texto'); }} label="Versículo" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="font-serif z-20 w-full leading-tight select-none" style={{ fontSize: `${elementStyles.verse.fontSize}px`, fontWeight: elementStyles.verse.fontWeight, textAlign: elementStyles.verse.textAlign as any, color: resolveColor(elementStyles.verse.color) }}>"{selectedVersesText}"</p>
                                                </DraggableText>
                                                <DraggableText position={dragPos.ref} onPositionChange={(pos) => setDragPos(p => ({ ...p, ref: pos }))} isSelected={selectedElement === 'ref'} onSelect={() => { setSelectedElement('ref'); setStudioTab('texto'); }} label="Referencia" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="uppercase tracking-[0.2em] z-20 mt-6 select-none" style={{ fontSize: `${elementStyles.ref.fontSize}px`, fontWeight: elementStyles.ref.fontWeight, textAlign: elementStyles.ref.textAlign as any, color: resolveColor(elementStyles.ref.color) }}>— {selectedVersesRef}</p>
                                                </DraggableText>
                                                <DraggableText position={dragPos.website} onPositionChange={(pos) => setDragPos(p => ({ ...p, website: pos }))} isSelected={selectedElement === 'website'} onSelect={() => { setSelectedElement('website'); setStudioTab('texto'); }} label="Sitio web" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="tracking-widest z-20 mt-3 select-none" style={{ fontSize: `${elementStyles.website.fontSize}px`, fontWeight: elementStyles.website.fontWeight, textAlign: elementStyles.website.textAlign as any, color: resolveColor(elementStyles.website.color) }}>www.iciarnayarit.com</p>
                                                </DraggableText>
                                            </div>
                                        </div>

                                        {/* Square */}
                                        <div className={`flex-col items-center gap-3 w-full ${studioTheme.orientation !== 'square' ? 'hidden' : 'flex'}`}>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                <div className="h-px w-8 bg-gray-200" />
                                                Cuadrado 1:1 · Feed
                                                <div className="h-px w-8 bg-gray-200" />
                                            </div>
                                            <div id="preview-square" onPointerDown={() => setSelectedElement(null)}
                                                className="w-full max-w-[380px] mx-auto aspect-square rounded-2xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-8 text-center ring-1 ring-white/10 transition-all duration-300"
                                                style={{ backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor, backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <GridOverlay visible={isCanvasDragging} snapX={activeSnap.x} snapY={activeSnap.y} />
                                                <DraggableText position={dragPos.ref} onPositionChange={(pos) => setDragPos(p => ({ ...p, ref: pos }))} isSelected={selectedElement === 'ref'} onSelect={() => { setSelectedElement('ref'); setStudioTab('texto'); }} label="Referencia" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="uppercase tracking-[0.2em] z-20 mb-8 select-none" style={{ fontSize: `${elementStyles.ref.fontSize}px`, fontWeight: elementStyles.ref.fontWeight, textAlign: elementStyles.ref.textAlign as any, color: resolveColor(elementStyles.ref.color) }}>{selectedVersesRef}</p>
                                                </DraggableText>
                                                <DraggableText position={dragPos.verse} onPositionChange={(pos) => setDragPos(p => ({ ...p, verse: pos }))} isSelected={selectedElement === 'verse'} onSelect={() => { setSelectedElement('verse'); setStudioTab('texto'); }} label="Versículo" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="font-serif z-20 w-full leading-tight select-none" style={{ fontSize: `${elementStyles.verse.fontSize}px`, fontWeight: elementStyles.verse.fontWeight, textAlign: elementStyles.verse.textAlign as any, color: resolveColor(elementStyles.verse.color) }}>"{selectedVersesText}"</p>
                                                </DraggableText>
                                                <DraggableText position={dragPos.website} onPositionChange={(pos) => setDragPos(p => ({ ...p, website: pos }))} isSelected={selectedElement === 'website'} onSelect={() => { setSelectedElement('website'); setStudioTab('texto'); }} label="Sitio web" onDragStart={() => setIsCanvasDragging(true)} onDragEnd={() => setIsCanvasDragging(false)} onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}>
                                                    <p className="tracking-widest z-20 mt-6 select-none" style={{ fontSize: `${elementStyles.website.fontSize}px`, fontWeight: elementStyles.website.fontWeight, textAlign: elementStyles.website.textAlign as any, color: resolveColor(elementStyles.website.color) }}>www.iciarnayarit.com</p>
                                                </DraggableText>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Sidebar ── */}
                                <div className="w-full lg:w-[300px] xl:w-[320px] bg-white flex flex-col overflow-hidden shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100">

                                    {/* Tab Bar */}
                                    <div className="flex border-b border-gray-100 shrink-0 bg-gray-50/50">
                                        {([
                                            { id: 'formato', label: 'Formato' },
                                            { id: 'fondo',   label: 'Fondo'   },
                                            { id: 'texto',   label: 'Texto'   },
                                        ] as const).map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setStudioTab(tab.id)}
                                                className={`flex-1 py-3 text-[11px] font-black tracking-wide transition-all border-b-2 ${studioTab === tab.id ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">

                                        {/* ── Tab: Formato ── */}
                                        {studioTab === 'formato' && (
                                            <div className="p-5 flex flex-col gap-7">
                                                {/* Orientation */}
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Orientación</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {([
                                                            { val: 'vertical',   lbl: 'Vertical',   hint: '9:16', icon: <div className="w-3 h-5 rounded-[3px] bg-current mx-auto mb-1" /> },
                                                            { val: 'horizontal', lbl: 'Horizontal', hint: '16:9', icon: <div className="w-5 h-3 rounded-[3px] bg-current mx-auto mb-1" /> },
                                                            { val: 'square',     lbl: 'Cuadrado',   hint: '1:1',  icon: <div className="w-4 h-4 rounded-[3px] bg-current mx-auto mb-1" /> },
                                                        ] as const).map(({ val, lbl, hint, icon }) => (
                                                            <button key={val} onClick={() => setStudioTheme({ ...studioTheme, orientation: val })}
                                                                className={`flex flex-col items-center py-4 px-2 rounded-xl border-2 transition-all ${studioTheme.orientation === val ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white'}`}
                                                            >
                                                                {icon}
                                                                <span className="text-[10px] font-black block">{lbl}</span>
                                                                <span className="text-[8px] font-medium text-current opacity-60">{hint}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Platform */}
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Plataforma</label>
                                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                                        {([
                                                            { id: 'instagram', label: 'Instagram', orientation: 'square'    as const, hint: '1:1',  activeText: 'text-[#E1306C]', activeBg: 'bg-[#E1306C]/10', activeBorder: 'border-[#E1306C]', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg> },
                                                            { id: 'facebook',  label: 'Facebook',  orientation: 'horizontal' as const, hint: '16:9', activeText: 'text-[#1877F2]', activeBg: 'bg-[#1877F2]/10', activeBorder: 'border-[#1877F2]', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                                                            { id: 'twitter',   label: 'X',         orientation: 'square'    as const, hint: '1:1',  activeText: 'text-gray-900',  activeBg: 'bg-gray-900/10',   activeBorder: 'border-gray-900',   icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.986l4.265 5.639zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                                                            { id: 'pinterest', label: 'Pinterest', orientation: 'vertical'  as const, hint: '2:3',  activeText: 'text-[#E60023]', activeBg: 'bg-[#E60023]/10',  activeBorder: 'border-[#E60023]',  icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg> },
                                                            { id: 'tiktok',    label: 'TikTok',    orientation: 'vertical'  as const, hint: '9:16', activeText: 'text-gray-900',  activeBg: 'bg-gray-900/10',   activeBorder: 'border-gray-900',   icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z"/></svg> },
                                                        ] as const).map(({ id, label, orientation, hint, activeText, activeBg, activeBorder, icon }) => (
                                                            <button key={id} onClick={() => {
                                                                const isActive = selectedPlatform === id;
                                                                setSelectedPlatform(isActive ? null : id);
                                                                if (!isActive) setStudioTheme(t => ({ ...t, orientation }));
                                                            }}
                                                                className={`flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl border-2 transition-all ${selectedPlatform === id ? `${activeBg} ${activeBorder} ${activeText}` : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white'}`}
                                                            >
                                                                {icon}
                                                                <span className="text-[8px] font-black tracking-wide leading-none">{label}</span>
                                                                <span className="text-[7px] font-medium opacity-60 leading-none">{hint}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Tab: Fondo ── */}
                                        {studioTab === 'fondo' && (
                                            <div className="p-5 flex flex-col gap-7">
                                                {/* Colors */}
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Color de fondo</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button onClick={() => customColorRef.current?.click()} className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 hover:bg-blue-100 transition-colors shrink-0" title="Personalizado">
                                                            <Palette className="w-4 h-4" />
                                                        </button>
                                                        <input ref={customColorRef} type="color" className="sr-only" value={studioTheme.bgColor} onChange={(e) => setStudioTheme({ ...studioTheme, bgColor: e.target.value, bgImage: null })} />
                                                        {(swatchesExpanded ? ALL_SWATCHES : ALL_SWATCHES.slice(0, 14)).map(color => (
                                                            <button key={color} onClick={() => setStudioTheme({ ...studioTheme, bgColor: color, bgImage: null })}
                                                                className={`w-9 h-9 rounded-xl border-2 transition-all ${studioTheme.bgColor === color && !studioTheme.bgImage ? 'ring-2 ring-offset-1 ring-blue-500 scale-110 border-transparent' : 'border-gray-100 hover:scale-105'}`}
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                    {!swatchesExpanded && (
                                                        <button onClick={() => setSwatchesExpanded(true)} className="mt-3 w-full py-2 rounded-xl border border-gray-100 text-[11px] font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                                            Ver más colores
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Gallery */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Galería de fondos</label>
                                                        <button onClick={() => document.getElementById('studio-upload')?.click()} className="text-[10px] font-black text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                                            <span>+ Subir</span>
                                                        </button>
                                                        <input id="studio-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => {
                                                                const newImage = ev.target?.result as string;
                                                                setStudioTheme({ ...studioTheme, bgImage: newImage });
                                                                setStudioGallery(prev => {
                                                                    if (prev.includes(newImage)) return prev;
                                                                    const next = [newImage, ...prev];
                                                                    const userUploads = next.filter(img => img.startsWith('data:'));
                                                                    localStorage.setItem('studioGalleryUploads', JSON.stringify(userUploads));
                                                                    return next;
                                                                });
                                                            };
                                                            reader.readAsDataURL(file);
                                                            e.target.value = '';
                                                        }} />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {studioGallery.slice(0, galleryVisibleCount).map((url, idx) => (
                                                            <div key={url + idx} className="relative group aspect-square">
                                                                <button onClick={() => setStudioTheme({ ...studioTheme, bgImage: url })}
                                                                    className={`w-full h-full rounded-xl bg-cover bg-center border-2 transition-all ${studioTheme.bgImage === url ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent hover:scale-105'}`}
                                                                    style={{ backgroundImage: `url(${url})` }}
                                                                />
                                                                <button onClick={(e) => { e.stopPropagation(); setStudioGallery(prev => { const next = prev.filter((_, i) => i !== idx); const userUploads = next.filter(img => img.startsWith('data:')); localStorage.setItem('studioGalleryUploads', JSON.stringify(userUploads)); return next; }); if (studioTheme.bgImage === url) setStudioTheme(t => ({ ...t, bgImage: '' })); }}
                                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                                                                    title="Eliminar"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {galleryVisibleCount < studioGallery.length && (
                                                        <button onClick={() => setGalleryVisibleCount(prev => prev + 6)} className="w-full mt-3 py-2 rounded-xl border border-gray-100 text-[11px] font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                                            Ver más ({studioGallery.length - galleryVisibleCount} restantes)
                                                        </button>
                                                    )}
                                                    {studioTheme.bgImage && (
                                                        <button onClick={() => setStudioTheme(t => ({ ...t, bgImage: null }))} className="w-full mt-2 py-2 rounded-xl text-[11px] font-bold text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                            Quitar imagen de fondo
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Tab: Texto ── */}
                                        {studioTab === 'texto' && (
                                            <div className="p-5">
                                                {selectedElement === null ? (
                                                    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                                            <Type className="w-6 h-6 text-gray-300" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-500">Selecciona un texto</p>
                                                            <p className="text-[11px] text-gray-400 mt-1">Toca cualquier texto del canvas<br />para editarlo aquí</p>
                                                        </div>
                                                        <div className="flex flex-col gap-2 w-full mt-2">
                                                            {(['ref', 'verse', 'website'] as const).map(el => (
                                                                <button key={el} onClick={() => setSelectedElement(el)}
                                                                    className="w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-500 text-xs font-bold border border-gray-100 hover:border-blue-200 transition-all text-left flex items-center gap-2"
                                                                >
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                                                    {el === 'ref' ? 'Referencia' : el === 'verse' ? 'Versículo' : 'Sitio web'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-6">
                                                        {/* Element selector */}
                                                        <div className="flex gap-1.5">
                                                            {(['ref', 'verse', 'website'] as const).map(el => (
                                                                <button key={el} onClick={() => setSelectedElement(el)}
                                                                    className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${selectedElement === el ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                                >
                                                                    {el === 'ref' ? 'Ref.' : el === 'verse' ? 'Verso' : 'Web'}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Font Size */}
                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Tamaño</span>
                                                                <span className="text-[11px] font-black text-blue-600 tabular-nums">{elementStyles[selectedElement].fontSize}px</span>
                                                            </div>
                                                            <input type="range" min="6" max="72" value={elementStyles[selectedElement].fontSize}
                                                                onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                                                                className="w-full accent-blue-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                                            />
                                                            <div className="flex justify-between text-[9px] text-gray-300 mt-1 font-medium">
                                                                <span>6</span><span>72</span>
                                                            </div>
                                                        </div>

                                                        {/* Font Weight */}
                                                        <div>
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-2">Peso</span>
                                                            <div className="grid grid-cols-4 gap-1.5">
                                                                {[['300','Fino'],['400','Normal'],['700','Negrita'],['900','Negra']].map(([w, lbl]) => (
                                                                    <button key={w} onClick={() => updateElement(selectedElement, { fontWeight: w })}
                                                                        className={`py-2 text-[9px] font-bold rounded-lg border transition-all ${elementStyles[selectedElement].fontWeight === w ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                                                    >{lbl}</button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Alignment */}
                                                        <div>
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-2">Alineación</span>
                                                            <div className="flex gap-2">
                                                                {(['left', 'center', 'right'] as const).map((align) => (
                                                                    <button key={align} onClick={() => updateElement(selectedElement, { textAlign: align })}
                                                                        className={`flex-1 h-10 rounded-xl flex items-center justify-center border transition-all ${elementStyles[selectedElement].textAlign === align ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                                    >
                                                                        <div className="flex flex-col gap-1 w-4">
                                                                            <div className="h-0.5 bg-current rounded-full w-full" />
                                                                            <div className={`h-0.5 bg-current rounded-full ${align === 'left' ? 'w-2.5' : align === 'center' ? 'w-2.5 mx-auto' : 'w-2.5 ml-auto'}`} />
                                                                            <div className="h-0.5 bg-current rounded-full w-full" />
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Color */}
                                                        <div>
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-2">Color del texto</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                <button onClick={() => updateElement(selectedElement, { color: 'auto' })} title="Automático (según fondo)"
                                                                    className={`w-9 h-9 rounded-xl border-2 text-[9px] font-black flex items-center justify-center transition-all bg-gradient-to-br from-white to-gray-800 ${elementStyles[selectedElement].color === 'auto' ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                                                                >A</button>
                                                                {['#FFFFFF','#000000','#FEF08A','#93C5FD','#FCA5A5','#6EE7B7','#C4B5FD','#FED7AA'].map(c => (
                                                                    <button key={c} onClick={() => updateElement(selectedElement, { color: c })}
                                                                        className={`w-9 h-9 rounded-xl border-2 transition-all ${elementStyles[selectedElement].color === c ? 'border-blue-500 scale-110' : 'border-gray-100 hover:scale-105'}`}
                                                                        style={{ backgroundColor: c }}
                                                                    />
                                                                ))}
                                                                <button onClick={() => elementColorRef.current?.click()} title="Personalizado"
                                                                    className="w-9 h-9 rounded-xl border-2 border-gray-100 bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <Palette className="w-3.5 h-3.5" />
                                                                </button>
                                                                <input ref={elementColorRef} type="color" className="sr-only"
                                                                    value={elementStyles[selectedElement].color === 'auto' ? autoColor : elementStyles[selectedElement].color}
                                                                    onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
