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
    Eye, Instagram, Facebook, Palette, Download, Share2 as ShareIcon, GripVertical
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { takePendingReturnAfterVerseSave, SAVED_VERSES_CHANGED_EVENT } from '@/lib/saved-verses';
import {
    addStudioPublicationDraft,
    getStudioPublicationDraftById,
    stripStudioDraftSearchParam,
    type StudioPublicationDraftPayloadV1,
    type StudioPublicationDraftRecord,
} from '@/lib/studio-publication-drafts';
import { useAuth, useClerk } from '@clerk/nextjs';
import {
    ensureClerkSignedIn,
    ensureClerkSignedInForFavoriteAdd,
    goToDashboardBibliaSavedVerses,
} from '@/lib/require-clerk-sign-in';
import DailyVerse from '@/app/components/daily-verse';
import ReadingPlans from '@/app/components/reading-plans';

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
    source?: 'biblia' | 'plan';
    planSlug?: string;
    planTitle?: string;
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

const STUDIO_DND_MIME = 'application/x-iciar-studio-widget';

interface StudioOverlay {
    id: string;
    type: 'text' | 'image';
    position: { x: number; y: number };
    text: string;
    imageSrc: string | null;
    /** Ancho máximo del bloque de imagen como % del lienzo (aprox.) */
    imageWidthPercent: number;
    fontSize: number;
    fontWeight: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
}

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

function DraggableImage({
    src,
    position,
    onPositionChange,
    maxWidthPx,
    canvasMaxWidth,
    onImageWidthPercentChange,
    hideResize,
    isSelected,
    onSelect,
    label,
    onDragStart,
    onDragEnd,
    onSnapChange,
}: {
    src: string | null;
    position: { x: number; y: number };
    onPositionChange: (pos: { x: number; y: number }) => void;
    maxWidthPx: number;
    /** Ancho del lienzo (mismo valor que en `renderStudioOverlayLayer`) para convertir px ↔ %. */
    canvasMaxWidth?: number;
    onImageWidthPercentChange?: (percent: number) => void;
    hideResize?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
    label?: string;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onSnapChange?: (snapX: boolean, snapY: boolean) => void;
}) {
    const [dragging, setDragging] = useState(false);
    const SNAP_ZONE = 10;

    const handleImageResizePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!onImageWidthPercentChange || !canvasMaxWidth) return;
            const handle = e.currentTarget as HTMLElement;
            handle.setPointerCapture(e.pointerId);
            onSelect?.();
            const x0 = e.clientX;
            const y0 = e.clientY;
            const startPx = maxWidthPx;
            const onMove = (ev: PointerEvent) => {
                const dw = ev.clientX - x0;
                const dh = ev.clientY - y0;
                const delta = (dw + dh) / 2;
                const nextPx = Math.max(56, Math.min(canvasMaxWidth, Math.round(startPx + delta)));
                let pct = Math.round((nextPx / canvasMaxWidth) * 100);
                pct = Math.min(100, Math.max(20, pct));
                onImageWidthPercentChange(pct);
            };
            const onUp = () => {
                try {
                    handle.releasePointerCapture(e.pointerId);
                } catch {
                    /* ignore */
                }
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                document.removeEventListener('pointercancel', onUp);
            };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
            document.addEventListener('pointercancel', onUp);
        },
        [canvasMaxWidth, maxWidthPx, onImageWidthPercentChange, onSelect],
    );

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
            className={`relative z-30 cursor-grab touch-none select-none transition-[opacity,filter] duration-100 active:cursor-grabbing ${dragging ? 'z-50 opacity-90 drop-shadow-2xl' : ''}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                outline: isSelected ? '2px dashed rgba(255,255,255,0.85)' : 'none',
                outlineOffset: '4px',
                borderRadius: '8px',
            }}
        >
            {isSelected && label && (
                <span className="pointer-events-none absolute -top-6 left-0 z-50 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-blue-600 shadow-md">
                    {label}
                </span>
            )}
            <div className="relative inline-block max-w-full">
                <div className="overflow-hidden rounded-lg ring-1 ring-white/20" style={{ maxWidth: maxWidthPx }}>
                    {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" className="block h-auto w-full max-h-40 object-contain sm:max-h-48" draggable={false} />
                    ) : (
                        <div className="flex min-h-[72px] min-w-[72px] items-center justify-center bg-black/25 px-4 py-6">
                            <ImgIcon className="h-8 w-8 text-white/50" aria-hidden />
                        </div>
                    )}
                </div>
                {isSelected && !hideResize && onImageWidthPercentChange && canvasMaxWidth ? (
                    <button
                        type="button"
                        aria-label="Redimensionar imagen"
                        title="Arrastra para cambiar el tamaño"
                        onPointerDown={handleImageResizePointerDown}
                        className="absolute bottom-0 right-0 z-20 flex h-7 w-7 translate-x-1 translate-y-1 cursor-nwse-resize items-end justify-end rounded-tl-md border border-white/50 bg-black/35 p-0.5 text-white/90 shadow-sm touch-none hover:bg-black/50"
                    >
                        <GripVertical className="h-3.5 w-3.5 rotate-90 opacity-90" aria-hidden />
                    </button>
                ) : null}
            </div>
        </div>
    );
}

/** Texto libre del estudio: arrastre solo desde el asa; el contenido admite doble clic para editar en una sola línea. */
function DraggableStudioFreeText({
    children,
    position,
    onPositionChange,
    className,
    isSelected,
    onSelect,
    label,
    onDragStart,
    onDragEnd,
    onSnapChange,
    gripAlign = 'center',
    hideGrip = false,
}: {
    children: React.ReactNode;
    position: { x: number; y: number };
    onPositionChange: (pos: { x: number; y: number }) => void;
    className?: string;
    isSelected?: boolean;
    onSelect?: () => void;
    label?: string;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onSnapChange?: (snapX: boolean, snapY: boolean) => void;
    /** Alinear asa con bloques multilínea (p. ej. versículo). */
    gripAlign?: 'center' | 'start';
    /** Ocultar asa al exportar imagen (evita los "6 puntos" en la descarga). */
    hideGrip?: boolean;
}) {
    const [dragging, setDragging] = useState(false);
    const SNAP_ZONE = 10;

    const handleGripPointerDown = useCallback(
        (e: React.PointerEvent) => {
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
        },
        [position, onPositionChange, onSelect, onDragStart, onDragEnd, onSnapChange],
    );

    const alignRow = gripAlign === 'start' ? 'items-start' : 'items-center';
    return (
        <div
            className={`relative z-30 flex max-w-[min(300px,94vw)] gap-0.5 touch-manipulation transition-[opacity,filter] duration-100 ${alignRow} ${dragging ? 'z-50 opacity-90 drop-shadow-2xl' : ''} ${className ?? ''}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                outline: isSelected ? '2px dashed rgba(255,255,255,0.85)' : 'none',
                outlineOffset: '4px',
                borderRadius: '6px',
            }}
        >
            {isSelected && label && (
                <span className="pointer-events-none absolute -top-6 left-0 z-50 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-blue-600 shadow-md">
                    {label}
                </span>
            )}
            {!hideGrip && (
                <button
                    type="button"
                    aria-label="Arrastrar elemento"
                    onPointerDown={handleGripPointerDown}
                    className={`shrink-0 cursor-grab rounded-md p-0.5 text-white/75 hover:bg-white/15 active:cursor-grabbing ${gripAlign === 'start' ? 'mt-1' : ''}`}
                >
                    <GripVertical className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden />
                </button>
            )}
            <div className={`min-w-0 flex-1 ${hideGrip ? 'w-full' : ''}`}>{children}</div>
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

    const [selectedElement, setSelectedElement] = useState<ElementKey | null>(null);
    const [studioOverlays, setStudioOverlays] = useState<StudioOverlay[]>([]);
    const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
    const [studioOverlayTextEditingId, setStudioOverlayTextEditingId] = useState<string | null>(null);
    /** Edición en línea de referencia / versículo / URL del lienzo (mismo patrón que texto libre). */
    const [studioFixedTextEditing, setStudioFixedTextEditing] = useState<ElementKey | null>(null);
    const [studioCanvasTextOverride, setStudioCanvasTextOverride] = useState<Record<ElementKey, string | null>>({
        ref: null,
        verse: null,
        website: null,
    });
    /** Caja del versículo en el lienzo (ancho y alto máximo con scroll interno). */
    const [studioVerseFrame, setStudioVerseFrame] = useState({ w: 248, maxH: 300 });
    const studioOverlayInlineInputRef = useRef<HTMLInputElement>(null);
    const studioVerseTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [studioDropHighlight, setStudioDropHighlight] = useState(false);
    /** Oculta asas de arrastre mientras se genera la PNG del lienzo. */
    const [studioExporting, setStudioExporting] = useState(false);
    const studioOverlayImageRef = useRef<HTMLInputElement>(null);
    const studioOverlayImageTargetRef = useRef<string | null>(null);
    const studioOverlayCountRef = useRef(0);

    const resetDragPos = () => {
        setDragPos({ ref: { x: 0, y: 0 }, verse: { x: 0, y: 0 }, website: { x: 0, y: 0 } });
        setStudioOverlays([]);
        setSelectedOverlayId(null);
        setStudioOverlayTextEditingId(null);
        setStudioFixedTextEditing(null);
        setStudioCanvasTextOverride({ ref: null, verse: null, website: null });
        setStudioVerseFrame({ w: 248, maxH: 300 });
    };

    const [elementStyles, setElementStyles] = useState<Record<ElementKey, { fontSize: number; fontWeight: string; color: string; textAlign: string }>>({
        ref:     { fontSize: 10, fontWeight: '800', color: 'auto', textAlign: 'center' },
        verse:   { fontSize: 24, fontWeight: '700', color: 'auto', textAlign: 'center' },
        website: { fontSize: 8,  fontWeight: '900', color: 'auto', textAlign: 'center' },
    });
    const updateElement = (key: ElementKey, patch: Partial<{ fontSize: number; fontWeight: string; color: string; textAlign: string }>) =>
        setElementStyles(s => ({ ...s, [key]: { ...s[key], ...patch } }));
    const elementColorRef = useRef<HTMLInputElement>(null);
    const studioOverlayTextColorRef = useRef<HTMLInputElement>(null);
    const [studioTheme, setStudioTheme] = useState({
        bgColor: '#2563EB',
        bgImage: null as string | null,
        fontSize: 24,
        fontWeight: 'bold',
        alignment: 'center' as 'left' | 'center' | 'right',
        orientation: 'vertical' as 'vertical' | 'horizontal' | 'square',
        motionEffects: false
    });
    const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | 'twitter' | 'pinterest' | 'tiktok' | null>(null);
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
    const [pendingStudioDraftRecord, setPendingStudioDraftRecord] = useState<StudioPublicationDraftRecord | null>(null);
    const processedStudioDraftIdRef = useRef<string | null>(null);

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

    const STUDIO_WEBSITE_DEFAULT = 'www.iciarnayarit.com';
    const studioRefDisplay = studioCanvasTextOverride.ref ?? selectedVersesRef;
    const studioVerseDisplay = studioCanvasTextOverride.verse ?? selectedVersesText;
    const studioWebsiteDisplay = studioCanvasTextOverride.website ?? STUDIO_WEBSITE_DEFAULT;

    const [selectedHighlightColor, setSelectedHighlightColor] = useState('blue');

    // Typography State
    const [fontSize, setFontSize] = useState(100);
    const [lineHeight, setLineHeight] = useState<'tight' | 'normal' | 'loose'>('normal');
    const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');

    const [isToolbarOpen, setIsToolbarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setStudioCanvasTextOverride((o) => ({ ...o, ref: null, verse: null }));
        setStudioVerseFrame({ w: 248, maxH: 300 });
    }, [selectedBook, selectedChapter, selectedVerses.join(','), selectedVersesText]);

    useEffect(() => {
        studioOverlayCountRef.current = studioOverlays.length;
    }, [studioOverlays.length]);

    useEffect(() => {
        if (selectedOverlayId && !studioOverlays.some((x) => x.id === selectedOverlayId)) {
            setSelectedOverlayId(null);
        }
    }, [studioOverlays, selectedOverlayId]);

    useEffect(() => {
        const editingOverlay = studioOverlayTextEditingId;
        const editingFixed = studioFixedTextEditing;
        if (!editingOverlay && !editingFixed) return;
        const id = requestAnimationFrame(() => {
            if (editingFixed === 'verse') {
                const ta = studioVerseTextareaRef.current;
                ta?.focus({ preventScroll: true });
                return;
            }
            const el = studioOverlayInlineInputRef.current;
            el?.focus({ preventScroll: true });
            el?.select();
        });
        return () => cancelAnimationFrame(id);
    }, [studioOverlayTextEditingId, studioFixedTextEditing]);

    useEffect(() => {
        if (!studioOverlayTextEditingId) return;
        if (selectedOverlayId !== studioOverlayTextEditingId) {
            setStudioOverlayTextEditingId(null);
        }
    }, [selectedOverlayId, studioOverlayTextEditingId]);

    useEffect(() => {
        if (selectedOverlayId) setStudioFixedTextEditing(null);
    }, [selectedOverlayId]);

    useEffect(() => {
        if (!studioFixedTextEditing) return;
        if (selectedElement !== studioFixedTextEditing) {
            setStudioFixedTextEditing(null);
        }
    }, [selectedElement, studioFixedTextEditing]);

    const updateStudioOverlay = useCallback((id: string, patch: Partial<StudioOverlay>) => {
        setStudioOverlays(prev => prev.map(o => (o.id === id ? { ...o, ...patch } : o)));
    }, []);

    const removeStudioOverlay = useCallback((id: string) => {
        setStudioOverlays(prev => prev.filter(o => o.id !== id));
        setSelectedOverlayId(sel => (sel === id ? null : sel));
        setStudioOverlayTextEditingId(ed => (ed === id ? null : ed));
    }, []);

    const addStudioOverlayAt = useCallback(
        (type: 'text' | 'image', position: { x: number; y: number }) => {
            if (studioOverlayCountRef.current >= 12) {
                toast({ title: 'Límite alcanzado', description: 'Máximo 12 elementos añadidos al lienzo.', variant: 'destructive' });
                return;
            }
            const id = `ov-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const base: StudioOverlay = {
                id,
                type,
                position,
                text: type === 'text' ? 'Tu texto' : '',
                imageSrc: null,
                imageWidthPercent: 42,
                fontSize: 14,
                fontWeight: '600',
                color: 'auto',
                textAlign: 'center',
            };
            setStudioOverlays(prev => {
                if (prev.length >= 12) return prev;
                if (prev.some(o => o.id === id)) return prev;
                return [...prev, base];
            });
            setSelectedElement(null);
            setSelectedOverlayId(id);
            setStudioTab('texto');
            if (type === 'image') {
                studioOverlayImageTargetRef.current = id;
                requestAnimationFrame(() => studioOverlayImageRef.current?.click());
            }
        },
        [toast],
    );

    const handlePreviewDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handlePreviewDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setStudioDropHighlight(false);
            const kind = e.dataTransfer.getData(STUDIO_DND_MIME);
            if (kind !== 'text' && kind !== 'image') return;
            const el = e.currentTarget as HTMLElement;
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            addStudioOverlayAt(kind as 'text' | 'image', { x: e.clientX - cx, y: e.clientY - cy });
        },
        [addStudioOverlayAt],
    );

    const handleStudioOverlayImagePick = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            const targetId = studioOverlayImageTargetRef.current;
            e.target.value = '';
            studioOverlayImageTargetRef.current = null;
            if (!file || !targetId) return;
            const reader = new FileReader();
            reader.onload = () => {
                updateStudioOverlay(targetId, { imageSrc: reader.result as string });
            };
            reader.readAsDataURL(file);
        },
        [updateStudioOverlay],
    );

    const setStudioCanvasTextFor = (key: ElementKey, text: string) => {
        setStudioCanvasTextOverride((o) => ({ ...o, [key]: text }));
    };

    const beginVerseFrameResize = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const handle = e.currentTarget as HTMLElement;
            handle.setPointerCapture(e.pointerId);
            setSelectedOverlayId(null);
            setSelectedElement('verse');
            const x0 = e.clientX;
            const y0 = e.clientY;
            const w0 = studioVerseFrame.w;
            const h0 = studioVerseFrame.maxH;
            const onMove = (ev: PointerEvent) => {
                const dw = ev.clientX - x0;
                const dh = ev.clientY - y0;
                setStudioVerseFrame({
                    w: Math.min(560, Math.max(96, w0 + dw)),
                    maxH: Math.min(720, Math.max(72, h0 + dh)),
                });
            };
            const onUp = () => {
                try {
                    handle.releasePointerCapture(e.pointerId);
                } catch {
                    /* ignore */
                }
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                document.removeEventListener('pointercancel', onUp);
            };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
            document.addEventListener('pointercancel', onUp);
        },
        [studioVerseFrame.w, studioVerseFrame.maxH],
    );

    const verseResizeHandle = (
        <button
            type="button"
            aria-label="Redimensionar caja del versículo"
            title="Arrastra para cambiar tamaño"
            onPointerDown={beginVerseFrameResize}
            className="absolute bottom-0 right-0 z-20 flex h-7 w-7 translate-x-1 translate-y-1 cursor-nwse-resize items-end justify-end rounded-tl-md border border-white/50 bg-black/35 p-0.5 text-white/90 shadow-sm touch-none hover:bg-black/50"
        >
            <GripVertical className="h-3.5 w-3.5 rotate-90 opacity-90" aria-hidden />
        </button>
    );

    const renderStudioFixedText = (
        el: ElementKey,
        options: {
            label: string;
            displayValue: string;
            viewContent: React.ReactNode;
            contentClassName: string;
            rootClassName?: string;
            scrollWrapClassName?: string;
            inputMaxClass?: string;
            attachInputRef: boolean;
            /** Versículo: varias líneas + caja redimensionable. */
            multiline?: boolean;
        },
    ) => {
        const editing = studioFixedTextEditing === el;
        const isVerseMultiline = el === 'verse' && options.multiline;
        const textStyle: React.CSSProperties = {
            fontSize: `${elementStyles[el].fontSize}px`,
            fontWeight: elementStyles[el].fontWeight,
            textAlign: elementStyles[el].textAlign as 'left' | 'center' | 'right',
            color: resolveColor(elementStyles[el].color),
        };
        return (
            <DraggableStudioFreeText
                key={el}
                className={isVerseMultiline ? `${options.rootClassName ?? ''} !max-w-none` : options.rootClassName}
                gripAlign={isVerseMultiline ? 'start' : 'center'}
                hideGrip={studioExporting}
                position={dragPos[el]}
                onPositionChange={(pos) => setDragPos((p) => ({ ...p, [el]: pos }))}
                isSelected={selectedElement === el}
                onSelect={() => {
                    setSelectedOverlayId(null);
                    setSelectedElement(el);
                    setStudioTab('texto');
                }}
                label={options.label}
                onDragStart={() => setIsCanvasDragging(true)}
                onDragEnd={() => setIsCanvasDragging(false)}
                onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}
            >
                {editing ? (
                    isVerseMultiline ? (
                        <div className="relative" style={{ width: studioVerseFrame.w }}>
                            <textarea
                                ref={options.attachInputRef ? studioVerseTextareaRef : undefined}
                                value={options.displayValue}
                                onChange={(e) => setStudioCanvasTextFor(el, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        e.preventDefault();
                                        setStudioFixedTextEditing(null);
                                        (e.target as HTMLTextAreaElement).blur();
                                    }
                                }}
                                onBlur={() => setStudioFixedTextEditing((cur) => (cur === el ? null : cur))}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                rows={5}
                                className="box-border w-full resize-none rounded border border-dashed border-white/90 bg-black/25 px-2 py-1.5 font-serif outline-none ring-offset-0 focus:ring-2 focus:ring-white/70"
                                style={{
                                    ...textStyle,
                                    height: studioVerseFrame.maxH,
                                    minHeight: 72,
                                    lineHeight: 1.45,
                                    boxSizing: 'border-box',
                                }}
                                autoComplete="off"
                                spellCheck
                                aria-label={`Editar ${options.label}`}
                            />
                            {selectedElement === 'verse' && !studioExporting && verseResizeHandle}
                        </div>
                    ) : (
                        <input
                            ref={options.attachInputRef ? studioOverlayInlineInputRef : undefined}
                            type="text"
                            value={options.displayValue}
                            onChange={(e) => setStudioCanvasTextFor(el, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    (e.target as HTMLInputElement).blur();
                                }
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setStudioFixedTextEditing(null);
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            onBlur={() => setStudioFixedTextEditing((cur) => (cur === el ? null : cur))}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className={`box-border w-full min-w-[6rem] rounded border border-dashed border-white/90 bg-black/25 px-2 py-0.5 font-sans outline-none ring-offset-0 focus:ring-2 focus:ring-white/70 ${options.inputMaxClass ?? 'max-w-[min(260px,88vw)]'}`}
                            style={{ ...textStyle, lineHeight: 1.25 }}
                            autoComplete="off"
                            spellCheck={false}
                            aria-label={`Editar ${options.label}`}
                        />
                    )
                ) : isVerseMultiline ? (
                    <div className="relative box-border rounded-md" style={{ width: studioVerseFrame.w, maxHeight: studioVerseFrame.maxH }}>
                        <div className="max-h-full overflow-y-auto overflow-x-hidden pr-0.5 [scrollbar-width:thin]">
                            <p
                                role="textbox"
                                tabIndex={0}
                                title="Doble clic para editar en el lienzo"
                                className={`cursor-text whitespace-pre-wrap break-words px-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${options.contentClassName}`}
                                style={textStyle}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOverlayId(null);
                                    setSelectedElement(el);
                                    setStudioTab('texto');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setStudioOverlayTextEditingId(null);
                                        setStudioFixedTextEditing(el);
                                        setSelectedOverlayId(null);
                                        setSelectedElement(el);
                                        setStudioTab('texto');
                                    }
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setStudioOverlayTextEditingId(null);
                                    setStudioFixedTextEditing(el);
                                    setSelectedOverlayId(null);
                                    setSelectedElement(el);
                                    setStudioTab('texto');
                                }}
                            >
                                {options.viewContent}
                            </p>
                        </div>
                        {selectedElement === 'verse' && !studioExporting && verseResizeHandle}
                    </div>
                ) : (
                    <div className={`overflow-x-auto overflow-y-hidden [scrollbar-width:thin] ${options.scrollWrapClassName ?? 'max-w-[min(260px,88vw)]'}`}>
                        <p
                            role="textbox"
                            tabIndex={0}
                            title="Doble clic para editar en el lienzo"
                            className={`cursor-text whitespace-nowrap px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${options.contentClassName}`}
                            style={textStyle}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOverlayId(null);
                                setSelectedElement(el);
                                setStudioTab('texto');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setStudioOverlayTextEditingId(null);
                                    setStudioFixedTextEditing(el);
                                    setSelectedOverlayId(null);
                                    setSelectedElement(el);
                                    setStudioTab('texto');
                                }
                            }}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                setStudioOverlayTextEditingId(null);
                                setStudioFixedTextEditing(el);
                                setSelectedOverlayId(null);
                                setSelectedElement(el);
                                setStudioTab('texto');
                            }}
                        >
                            {options.viewContent}
                        </p>
                    </div>
                )}
            </DraggableStudioFreeText>
        );
    };

    const renderStudioOverlayLayer = (canvasMaxWidth: number) =>
        studioOverlays.map(ov => {
            const maxImg = Math.max(56, Math.round((ov.imageWidthPercent / 100) * canvasMaxWidth));
            if (ov.type === 'text') {
                const editing = studioOverlayTextEditingId === ov.id;
                const textStyle: React.CSSProperties = {
                    fontSize: `${ov.fontSize}px`,
                    fontWeight: ov.fontWeight,
                    textAlign: ov.textAlign as 'left' | 'center' | 'right',
                    color: resolveColor(ov.color),
                };
                return (
                    <DraggableStudioFreeText
                        key={ov.id}
                        hideGrip={studioExporting}
                        position={ov.position}
                        onPositionChange={(pos) => updateStudioOverlay(ov.id, { position: pos })}
                        isSelected={selectedOverlayId === ov.id}
                        onSelect={() => {
                            setSelectedOverlayId(ov.id);
                            setSelectedElement(null);
                            setStudioTab('texto');
                        }}
                        label="Texto libre"
                        onDragStart={() => setIsCanvasDragging(true)}
                        onDragEnd={() => setIsCanvasDragging(false)}
                        onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}
                    >
                        {editing ? (
                            <input
                                ref={studioOverlayInlineInputRef}
                                type="text"
                                value={ov.text}
                                onChange={(e) => updateStudioOverlay(ov.id, { text: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        (e.target as HTMLInputElement).blur();
                                    }
                                    if (e.key === 'Escape') {
                                        e.preventDefault();
                                        setStudioOverlayTextEditingId(null);
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }}
                                onBlur={() => setStudioOverlayTextEditingId((cur) => (cur === ov.id ? null : cur))}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="box-border w-full min-w-[6rem] max-w-[min(260px,88vw)] rounded border border-dashed border-white/90 bg-black/25 px-2 py-0.5 font-sans outline-none ring-offset-0 focus:ring-2 focus:ring-white/70"
                                style={{ ...textStyle, lineHeight: 1.25 }}
                                autoComplete="off"
                                spellCheck={false}
                                aria-label="Editar texto libre"
                            />
                        ) : (
                            <div className="max-w-[min(260px,88vw)] overflow-x-auto overflow-y-hidden [scrollbar-width:thin]">
                                <p
                                    role="textbox"
                                    tabIndex={0}
                                    title="Doble clic para editar en el lienzo"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedOverlayId(ov.id);
                                        setSelectedElement(null);
                                        setStudioTab('texto');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setStudioFixedTextEditing(null);
                                            setStudioOverlayTextEditingId(ov.id);
                                            setSelectedOverlayId(ov.id);
                                            setSelectedElement(null);
                                            setStudioTab('texto');
                                        }
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setStudioFixedTextEditing(null);
                                        setStudioOverlayTextEditingId(ov.id);
                                        setSelectedOverlayId(ov.id);
                                        setSelectedElement(null);
                                        setStudioTab('texto');
                                    }}
                                    className="cursor-text whitespace-nowrap px-0.5 font-sans outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    style={textStyle}
                                >
                                    {ov.text || '\u00a0'}
                                </p>
                            </div>
                        )}
                    </DraggableStudioFreeText>
                );
            }
            return (
                <DraggableImage
                    key={ov.id}
                    src={ov.imageSrc}
                    position={ov.position}
                    onPositionChange={(pos) => updateStudioOverlay(ov.id, { position: pos })}
                    maxWidthPx={maxImg}
                    canvasMaxWidth={canvasMaxWidth}
                    onImageWidthPercentChange={(pct) => updateStudioOverlay(ov.id, { imageWidthPercent: pct })}
                    hideResize={studioExporting}
                    isSelected={selectedOverlayId === ov.id}
                    onSelect={() => {
                        setSelectedOverlayId(ov.id);
                        setSelectedElement(null);
                        setStudioTab('texto');
                    }}
                    label="Imagen"
                    onDragStart={() => setIsCanvasDragging(true)}
                    onDragEnd={() => setIsCanvasDragging(false)}
                    onSnapChange={(sx, sy) => setActiveSnap({ x: sx, y: sy })}
                />
            );
        });

    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { redirectToSignIn } = useClerk();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const returnAfterSavePathRef = useRef<string | null>(null);

    useEffect(() => {
        returnAfterSavePathRef.current = takePendingReturnAfterVerseSave();
    }, []);

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

    // Permite volver a abrir el mismo borrador tras limpiar la URL
    useEffect(() => {
        if (!searchParams.get('studioDraft')) {
            processedStudioDraftIdRef.current = null;
        }
    }, [searchParams]);

    // Abrir borrador de imagen desde ?studioDraft= (p. ej. desde el dashboard)
    useEffect(() => {
        const id = searchParams.get('studioDraft');
        if (!id) return;
        if (processedStudioDraftIdRef.current === id) return;

        const record = getStudioPublicationDraftById(id);
        const q = stripStudioDraftSearchParam(searchParams.toString());
        const path = q ? `${pathname}?${q}` : pathname;

        if (!record) {
            processedStudioDraftIdRef.current = id;
            toast({
                title: 'Borrador no encontrado',
                description: 'Puede haberse eliminado o es de otro navegador.',
                variant: 'destructive',
            });
            router.replace(path);
            return;
        }

        processedStudioDraftIdRef.current = id;
        const p = record.payload;
        const vid = p.versionId as VersionId;
        setSelectedBook(p.book);
        setSelectedChapter(p.chapter);
        setSelectedVersion(VERSIONS.some(v => v.id === vid) ? vid : 'rvr');
        setSelectedVerses([...p.verses].sort((a, b) => a - b));
        setPendingStudioDraftRecord(record);
        router.replace(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, pathname, router]);

    useEffect(() => {
        if (!pendingStudioDraftRecord) return;
        if (isLoading) return;
        const p = pendingStudioDraftRecord.payload;
        if (selectedBook !== p.book || selectedChapter !== p.chapter) return;
        if (p.verses.length > 0 && verses.length === 0) return;

        setDragPos(p.dragPos);
        setStudioOverlays((p.studioOverlays ?? []) as StudioOverlay[]);
        setElementStyles(prev => ({ ...prev, ...(p.elementStyles as typeof prev) }));
        setStudioTheme(prev => ({ ...prev, ...(p.studioTheme as typeof prev) }));
        setStudioCanvasTextOverride({
            ref: (p.studioCanvasTextOverride?.ref ?? null) as string | null,
            verse: (p.studioCanvasTextOverride?.verse ?? null) as string | null,
            website: (p.studioCanvasTextOverride?.website ?? null) as string | null,
        });
        setStudioVerseFrame({
            w: typeof p.studioVerseFrame?.w === 'number' ? p.studioVerseFrame.w : 248,
            maxH: typeof p.studioVerseFrame?.maxH === 'number' ? p.studioVerseFrame.maxH : 300,
        });
        const plat = p.selectedPlatform;
        setSelectedPlatform(
            plat === 'instagram' || plat === 'facebook' || plat === 'twitter' || plat === 'pinterest' || plat === 'tiktok' || plat === null
                ? plat
                : null
        );
        const tab = p.studioTab;
        setStudioTab(tab === 'fondo' || tab === 'texto' || tab === 'formato' ? tab : 'formato');
        if (Array.isArray(p.studioGallery) && p.studioGallery.every(x => typeof x === 'string')) {
            setStudioGallery(p.studioGallery);
        }

        setPendingStudioDraftRecord(null);
        setSelectedElement(null);
        setSelectedOverlayId(null);
        setStudioOverlayTextEditingId(null);
        setStudioFixedTextEditing(null);
        setIsPersonalizarOpen(false);
        setIsNoteOpen(false);
        setIsStudioOpen(true);
        toast({
            title: 'Borrador restaurado',
            description: 'Puedes seguir editando y descargar cuando quieras.',
        });
    }, [pendingStudioDraftRecord, isLoading, verses.length, selectedBook, selectedChapter, toast]);

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
        setSelectedOverlayId(null);
        setStudioOverlayTextEditingId(null);
        setStudioFixedTextEditing(null);
        setStudioExporting(true);

        // Wait for React to re-render (sin asas ni etiquetas de selección)
        await new Promise(r => setTimeout(r, 160));

        const node = document.getElementById(`preview-${studioTheme.orientation}`);
        if (!node) {
            setStudioExporting(false);
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
            setStudioExporting(false);
            node.style.borderRadius = prevBorderRadius;
            node.style.overflow = prevOverflow;
            disabledSheets.forEach(s => { s.disabled = false; });
        }
    };

    const saveStudioPublicationDraft = useCallback(() => {
        const payload: StudioPublicationDraftPayloadV1 = {
            v: 1,
            savedAt: new Date().toISOString(),
            book: selectedBook,
            chapter: selectedChapter,
            verses: [...selectedVerses].sort((a, b) => a - b),
            versionId: selectedVersion,
            dragPos,
            studioOverlays,
            elementStyles: elementStyles as unknown as Record<string, unknown>,
            studioTheme: studioTheme as unknown as Record<string, unknown>,
            studioCanvasTextOverride: studioCanvasTextOverride as Record<string, string | null>,
            studioVerseFrame,
            selectedPlatform,
            studioTab,
            studioGallery,
        };
        const single = JSON.stringify(payload);
        if (single.length > 4_500_000) {
            toast({
                title: 'Borrador demasiado grande',
                description: 'Reduce imágenes de fondo o elementos con foto e intenta de nuevo.',
                variant: 'destructive',
            });
            return;
        }
        const result = addStudioPublicationDraft({
            referenceLabel: selectedVersesRef,
            versePreview: selectedVersesText.slice(0, 240),
            payload,
        });
        if (!result.ok) {
            toast({
                title: 'No se pudo guardar el borrador',
                description: result.error,
                variant: 'destructive',
            });
            return;
        }
        toast({
            title: 'Borrador guardado',
            description: 'Lo encuentras en el panel Imágenes del dashboard.',
        });
    }, [
        selectedBook,
        selectedChapter,
        selectedVerses,
        selectedVersesRef,
        selectedVersesText,
        selectedVersion,
        dragPos,
        studioOverlays,
        elementStyles,
        studioTheme,
        studioCanvasTextOverride,
        studioVerseFrame,
        selectedPlatform,
        studioTab,
        studioGallery,
        toast,
    ]);

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

        if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
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

    /** Alterna marcador (guardado) para los versículos seleccionados; si venías del dashboard, vuelve tras añadir al menos uno. */
    const handleBookmarkSelectedVerses = () => {
        if (selectedVerses.length === 0) return;
        let anyAdd = false;
        for (const v of selectedVerses) {
            const reference = `${selectedBook} ${selectedChapter}:${v}`;
            if (!savedVerses.some(sv => sv.reference === reference)) {
                anyAdd = true;
                break;
            }
        }
        if (anyAdd && !ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
            return;
        }
        const next = [...savedVerses];
        let addedCount = 0;
        let removedCount = 0;
        for (const v of selectedVerses) {
            const verseText = verses[v - 1];
            if (verseText == null) continue;
            const reference = `${selectedBook} ${selectedChapter}:${v}`;
            const idx = next.findIndex(sv => sv.reference === reference);
            if (idx >= 0) {
                next.splice(idx, 1);
                removedCount++;
            } else {
                next.push({ text: verseText, reference, source: 'biblia' });
                addedCount++;
            }
        }
        setSavedVerses(next);
        try {
            localStorage.setItem('savedVerses', JSON.stringify(next));
        } catch {
            /* ignore */
        }
        window.dispatchEvent(new Event(SAVED_VERSES_CHANGED_EVENT));

        if (addedCount > 0 && removedCount === 0) {
            toast({
                title: addedCount > 1 ? `${addedCount} versículos guardados` : 'Versículo guardado',
                description:
                    addedCount > 1 ? 'Se añadieron a tus guardados.' : 'Se añadió a tus guardados.',
            });
        } else if (removedCount > 0 && addedCount === 0) {
            toast({
                title: 'Versículo eliminado',
                description:
                    removedCount > 1
                        ? 'Se quitaron de tus guardados.'
                        : 'Has quitado el versículo de tus guardados.',
            });
        } else if (addedCount > 0 || removedCount > 0) {
            toast({
                title: 'Guardados actualizados',
                description: 'Tus marcadores se actualizaron.',
            });
        }

        const returnPath = returnAfterSavePathRef.current;
        if (addedCount > 0 && returnPath) {
            returnAfterSavePathRef.current = null;
            router.push(returnPath);
        }
    };

    const handleSaveChapter = () => {
        const already = savedChapters.some(c => c.book === selectedBook && c.chapter === selectedChapter);
        if (
            !ensureClerkSignedInForFavoriteAdd(
                authLoaded,
                isSignedIn === true,
                redirectToSignIn,
                already
            )
        ) {
            return;
        }
        let updated: { book: string; chapter: number; verses: string[] }[];
        let savedNewChapter = false;
        if (already) {
            updated = savedChapters.filter(c => !(c.book === selectedBook && c.chapter === selectedChapter));
            toast({ title: "Capítulo eliminado", description: `${selectedBook} ${selectedChapter} fue eliminado de guardados.` });
        } else {
            updated = [...savedChapters, { book: selectedBook, chapter: selectedChapter, verses }];
            toast({ title: "Capítulo guardado", description: `${selectedBook} ${selectedChapter} fue guardado exitosamente.` });
            savedNewChapter = true;
        }
        setSavedChapters(updated);
        localStorage.setItem('savedChapters', JSON.stringify(updated));
        if (savedNewChapter) {
            router.push('/dashboard/biblia');
        }
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
    const compactBibleLayout = isNoteOpen || isStudioOpen;

    const getLineHeightClass = () => {
        switch (lineHeight) {
            case 'tight': return 'leading-[1.5]';
            case 'loose': return 'leading-[2.2]';
            default: return 'leading-[1.8]';
        }
    };

    return (
        <>
        <section
            id="bible"
            className={`w-full transition-colors duration-500 ${themeStyles.bg} ${
                compactBibleLayout
                    ? 'flex min-h-0 flex-1 flex-col overflow-hidden py-1 sm:py-2'
                    : 'py-12 md:py-24 lg:py-32'
            }`}
        >
            <div
                className={`mx-auto w-full px-4 md:px-6 ${
                    compactBibleLayout
                        ? 'flex min-h-0 max-w-full flex-1 flex-col lg:max-w-[min(100%,96rem)] lg:mx-auto'
                        : 'container'
                }`}
            >
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
                                <Button
                                    type="button"
                                    className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-[#B88A44] hover:text-white font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm min-h-[44px]"
                                    onClick={() =>
                                        goToDashboardBibliaSavedVerses(
                                            authLoaded,
                                            isSignedIn === true,
                                            redirectToSignIn,
                                            (href) => router.push(href),
                                        )
                                    }
                                >
                                    Versículos Guardados
                                </Button>
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
                                                    orange: 'bg-[#FFF7ED] text-[#F97316]',
                                                    red: 'bg-[#FEE2E2] text-[#DC2626]',
                                                    cyan: 'bg-[#ECFEFF] text-[#0891B2]',
                                                    teal: 'bg-[#CCFBF1] text-[#0D9488]',
                                                    indigo: 'bg-[#EEF2FF] text-[#4F46E5]',
                                                    slate: 'bg-[#F1F5F9] text-[#475569]',
                                                };

                                                const activeHlStyles = activeColorId ? hlColors[activeColorId] : '';
                                                const containerClasses = (isSelected || isHighlighted)
                                                    ? `${activeHlStyles} px-4 py-3 -mx-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]`
                                                    : `${themeStyles.buttonHover} py-1.5 cursor-pointer`;

                                                return (
                                                    <div key={index} id={`verse-${index + 1}`} data-verse={index + 1} className={`relative rounded-xl transition-all duration-200 ${isLastSelected ? 'z-40' : ''} ${containerClasses}`}>
                                                        {/* Toolbar: encima del versículo; colores fuera del contenedor con scroll para que no se recorten */}
                                                        {isLastSelected && (
                                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50 flex flex-col items-center gap-2 w-max max-w-[calc(100vw-2rem)] pointer-events-auto">
                                                                {showColorPicker && (
                                                                    <div className="shrink-0 bg-white border border-gray-100 shadow-xl rounded-2xl px-2.5 py-2 flex flex-wrap justify-center gap-2 max-w-[min(100vw-2rem,420px)] animate-in fade-in zoom-in duration-200">
                                                                        {[
                                                                            { id: 'yellow', color: 'bg-[#FCEBA2]' },
                                                                            { id: 'green', color: 'bg-[#BBF7D0]' },
                                                                            { id: 'blue', color: 'bg-[#BFDBFE]' },
                                                                            { id: 'pink', color: 'bg-[#FBCFE8]' },
                                                                            { id: 'purple', color: 'bg-[#E9D5FF]' },
                                                                            { id: 'orange', color: 'bg-[#FED7AA]' },
                                                                            { id: 'red', color: 'bg-[#FECACA]' },
                                                                            { id: 'cyan', color: 'bg-[#A5F3FC]' },
                                                                            { id: 'teal', color: 'bg-[#99F6E4]' },
                                                                            { id: 'indigo', color: 'bg-[#C7D2FE]' },
                                                                            { id: 'slate', color: 'bg-[#CBD5E1]' },
                                                                        ].map((c) => (
                                                                            <button
                                                                                key={c.id}
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) return;
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
                                                                <div className="relative bg-[#1F2937] shadow-xl rounded-[10px] min-w-0 max-w-[calc(100vw-2rem)]">
                                                                    <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#1F2937] rotate-45 rounded-sm pointer-events-none z-0" aria-hidden />
                                                                    <div className="flex items-center space-x-0.5 relative z-40 px-1.5 py-1 overflow-x-auto">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (!showColorPicker && !ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) return;
                                                                                setShowColorPicker(!showColorPicker);
                                                                            }}
                                                                            className={`flex shrink-0 items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md text-white text-[11px] font-semibold tracking-wide transition-colors ${showColorPicker ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1F2937]' : ''}`}
                                                                        >
                                                                            <span className="text-white text-[9px] -mt-0.5" aria-hidden>▲</span> Resaltar
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); setIsNoteOpen(true); }}
                                                                            className="flex shrink-0 items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md text-white text-[11px] font-semibold tracking-wide transition-colors"
                                                                        >
                                                                            <StickyNote className="h-3.5 w-3.5" /> Nota
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleBookmarkSelectedVerses();
                                                                            }}
                                                                            className="p-2 hover:bg-white/10 rounded-md transition-colors shrink-0"
                                                                        >
                                                                            {(() => {
                                                                                const allSaved = selectedVerses.every(v =>
                                                                                    savedVerses.some(sv => sv.reference === `${selectedBook} ${selectedChapter}:${v}`)
                                                                                );
                                                                                return <Bookmark className={`h-3.5 w-3.5 transition-all ${allSaved ? 'fill-white text-white' : 'fill-none text-gray-300'}`} />;
                                                                            })()}
                                                                        </button>
                                                                        <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={async (e) => {
                                                                                e.stopPropagation();
                                                                                const sorted = [...selectedVerses].sort((a, b) => a - b);
                                                                                const text = sorted.map(v => `${v} ${verses[v - 1]}`).join('\n');
                                                                                await navigator.clipboard.writeText(text);
                                                                                toast({ title: "Copiado" });
                                                                            }}
                                                                            className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors shrink-0"
                                                                        >
                                                                            <Copy className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const sorted = [...selectedVerses].sort((a, b) => a - b);
                                                                                const combinedText = sorted.map(v => verses[v - 1]).join(' ');
                                                                                handleShareVerse(combinedText, sorted[0]);
                                                                            }}
                                                                            className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors shrink-0"
                                                                        >
                                                                            <Share2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
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
                <div key="note-view" className="animate-in fade-in slide-in-from-right-8 duration-300 flex min-h-0 w-[calc(100%+1.5rem)] max-w-none flex-1 flex-col -mx-3 max-sm:pb-1 sm:mx-0 sm:w-full md:-mx-0">
                    <div className="flex max-h-[calc(100dvh-5.75rem)] min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border-y border-gray-200/80 bg-white shadow-lg shadow-gray-200/50 ring-0 sm:max-h-[calc(100svh-5.25rem)] sm:rounded-3xl sm:border sm:ring-1 sm:ring-black/[0.04] md:max-h-[calc(100dvh-4.75rem)]">

                            {/* Header — móvil: columna compacta; sm+: fila con acciones a la derecha */}
                            <div className="shrink-0 border-b border-gray-100 bg-gradient-to-r from-white via-white to-slate-50/40 px-3 py-2 sm:px-5 sm:py-3 md:px-6 lg:px-10 xl:px-12">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={() => { handleClearNoteFields(); setIsNoteOpen(false); }}
                                            className="flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors group shrink-0 min-h-11 min-w-11 sm:min-w-0 sm:min-h-0 sm:justify-start sm:gap-1.5 rounded-xl active:bg-gray-100 sm:active:bg-transparent"
                                            aria-label="Volver"
                                        >
                                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                                            <span className="text-sm font-semibold hidden sm:inline">Volver</span>
                                        </button>
                                        <div className="hidden sm:block w-px h-8 bg-gray-200 shrink-0" aria-hidden />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 sm:gap-x-1.5 min-w-0">
                                                <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[#B88A44] shrink-0">
                                                    <StickyNote className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    Notas
                                                </span>
                                                <span className="text-gray-300 shrink-0" aria-hidden>/</span>
                                                <span className="text-gray-600 truncate">{selectedBook} {selectedChapter}:{activeVerse}</span>
                                            </p>
                                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight leading-tight mt-0.5 sm:mt-0 max-sm:truncate">
                                                {editingNoteId ? 'Editar reflexión' : 'Nueva nota'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="flex w-full sm:w-auto items-stretch gap-2 shrink-0">
                                        <button type="button" onClick={handleClearNoteFields} className="flex-1 sm:flex-none justify-center min-h-11 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200/70 hover:border-rose-200 transition-colors active:scale-[0.99]">
                                            Limpiar
                                        </button>
                                        <button type="button" onClick={handleSaveCustomNote} className="flex-[1.15] sm:flex-none justify-center min-h-11 px-4 sm:px-5 py-2.5 bg-[#B88A44] hover:bg-[#a67b3d] text-white rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-[#B88A44]/25 transition-colors active:scale-[0.99]">
                                            <Save className="w-4 h-4 shrink-0" />
                                            <span className="hidden sm:inline">Guardar nota</span>
                                            <span className="sm:hidden">Guardar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Body — móvil: versículo + redes primero (sin scroll para ver redes); md+: columnas clásicas */}
                            <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain bg-gradient-to-b from-slate-50/90 to-slate-100/50 md:flex-row md:overflow-hidden md:overflow-y-hidden">

                                {/* Sidebar: una sola columna; en móvil va arriba (order-1) y sin scroll propio */}
                                <div className="order-1 flex w-full shrink-0 flex-col border-b border-gray-200/80 bg-white/80 pb-2 backdrop-blur-sm max-md:overflow-visible md:order-none md:min-h-0 md:w-64 md:max-w-[min(42%,20rem)] md:overflow-y-auto md:border-b-0 md:border-r md:pb-3 md:[scrollbar-width:thin] lg:max-w-none lg:w-72 xl:w-80 2xl:w-[22rem]">

                                    {/* Verse context — más compacto en móvil */}
                                    <div className="border-b border-gray-100 p-2.5 sm:p-4 md:p-3 lg:p-5 xl:p-6">
                                        <p className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600 sm:mb-3 sm:text-xs">
                                            <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#B88A44] sm:h-4 sm:w-4" /> Versículo seleccionado
                                        </p>
                                        <div className="relative rounded-xl bg-gradient-to-br from-amber-50/80 via-blue-50/60 to-indigo-50/80 p-3 ring-1 ring-blue-100/80 shadow-sm sm:rounded-2xl sm:p-4 md:p-3.5 lg:p-5">
                                            <span className="absolute left-1.5 top-0.5 text-3xl text-blue-200/90 font-serif leading-none select-none pointer-events-none sm:left-2 sm:top-1 sm:text-4xl md:text-5xl" aria-hidden>"</span>
                                            <p className="relative z-10 line-clamp-3 px-0.5 pt-2 text-[13px] font-serif italic leading-snug text-gray-800 sm:line-clamp-4 sm:pt-3 sm:text-base md:line-clamp-5 lg:line-clamp-none">
                                                {selectedVersesText || verses[(activeVerse ?? 1) - 1]}
                                            </p>
                                            <span className="absolute bottom-0 right-1.5 text-3xl text-blue-200/90 font-serif leading-none select-none pointer-events-none sm:right-2 sm:text-4xl md:text-5xl" aria-hidden>"</span>
                                            <p className="mt-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#B88A44] sm:mt-4 sm:text-[10px] md:text-[11px]">{selectedVersesRef}</p>
                                        </div>
                                    </div>

                                    {/* Redes sociales — bloque único */}
                                    <div className="border-b border-gray-100 px-2.5 py-2 sm:p-4 md:border-b md:p-3 md:pb-2 lg:p-5 xl:p-6">
                                        <div className="mb-1.5 flex items-center justify-between sm:mb-3 md:mb-2">
                                            <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 sm:gap-2 sm:text-xs">
                                                <ShareIcon className="h-3.5 w-3.5 shrink-0 text-[#B88A44] sm:h-4 sm:w-4" aria-hidden /> Redes sociales
                                            </p>
                                        </div>
                                        <div className="mb-2 flex gap-0.5 rounded-lg bg-slate-100/90 p-0.5 sm:mb-3 sm:gap-1 sm:rounded-xl sm:p-1 md:mb-2">
                                            {(['vertical','horizontal'] as const).map(f => (
                                                <button key={f} type="button" onClick={() => setSocialFormat(f)}
                                                    className={`flex-1 min-h-11 rounded-md px-1 py-1.5 text-[12px] font-bold leading-tight transition-all active:scale-[0.98] sm:rounded-lg sm:py-2 sm:text-xs md:min-h-10 md:py-2 ${socialFormat === f ? 'bg-white text-[#B88A44] shadow-sm ring-1 ring-[#B88A44]/25' : 'text-gray-500 active:bg-white/60'}`}>
                                                    {f === 'vertical' ? 'Vertical' : 'Horizontal'}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mb-2 w-full rounded-lg bg-slate-100/40 ring-1 ring-gray-200/50 sm:mb-3 sm:rounded-xl md:mb-2">
                                            <div className="box-border flex w-full items-center justify-center px-1.5 pb-2.5 pt-1 sm:px-2.5 sm:pb-5 sm:pt-2.5 md:pb-3 md:pt-1.5">
                                                <div
                                                    className={`relative flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl text-center shadow-md ring-1 ring-gray-200/60 transition-all duration-300 sm:rounded-2xl ${
                                                        socialFormat === 'vertical'
                                                            ? 'aspect-[9/16] w-auto max-h-[min(26dvh,200px)] max-w-[min(100%,88vw)] sm:max-h-[min(42dvh,360px)] sm:max-w-full md:max-h-[min(22dvh,168px)] lg:max-h-[min(26dvh,200px)] xl:max-h-[min(30dvh,240px)] 2xl:max-h-[min(34dvh,280px)]'
                                                            : 'aspect-video w-full max-h-[min(18dvh,120px)] max-w-full sm:max-h-[min(26dvh,200px)] md:max-h-[min(14dvh,120px)] lg:max-h-[min(16dvh,140px)] xl:max-h-[min(20dvh,168px)]'
                                                    }`}
                                                    style={{
                                                        backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor,
                                                        backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                    }}
                                                >
                                                    {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                    <div className="relative z-10 flex h-full min-h-0 w-full flex-col items-center justify-center gap-0.5 px-2 py-2 sm:gap-1 sm:px-5 sm:py-7 md:gap-0">
                                                        <p
                                                            className="line-clamp-4 font-serif text-[9px] italic leading-snug max-md:max-h-[48%] max-md:overflow-hidden sm:line-clamp-6 sm:text-sm md:line-clamp-none"
                                                            style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}
                                                        >
                                                            &ldquo;{selectedVersesText || verses[(activeVerse ?? 1) - 1]}&rdquo;
                                                        </p>
                                                        <p className="mt-1 shrink-0 text-[6px] font-black uppercase tracking-[0.2em] sm:mt-4 sm:text-[8px]" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>{selectedVersesRef}</p>
                                                        <p className="mt-0.5 shrink-0 text-[5px] font-black tracking-widest sm:text-[7px]" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>www.iciarnayarit.com</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setIsPersonalizarOpen(false); setIsNoteOpen(false); setIsStudioOpen(true); setGalleryVisibleCount(6); setSwatchesExpanded(false); resetDragPos(); setSelectedPlatform(null); setStudioTab('formato'); }}
                                            className="inline-flex w-full min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#B88A44]/35 bg-white px-3 py-2 text-[13px] font-bold text-[#B88A44] shadow-sm transition-all hover:bg-[#FDF8EF] active:scale-[0.99] sm:min-h-11 sm:gap-2 sm:rounded-xl sm:py-2.5 sm:text-sm"
                                        >
                                            <Palette className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                            Personalizar diseño
                                        </button>
                                    </div>

                                    {/* Notas recientes: ocultas en móvil para dejar espacio al editor sin scroll de página */}
                                    <div className="hidden border-t border-gray-100 md:block">
                                        <div className="min-h-0 shrink p-3 sm:p-4 md:p-3 md:pt-2 lg:p-5 xl:p-6">
                                            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                                <Clock className="h-4 w-4 text-[#B88A44]" /> Notas recientes
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                {notes.length > 0 ? notes.slice(0, 6).map((note) => (
                                                    <button
                                                        type="button"
                                                        key={note.id}
                                                        onClick={() => handleEditNote(note)}
                                                        className={`min-h-11 rounded-xl border px-3 py-3 text-left transition-all hover:shadow-sm active:bg-gray-50 sm:py-2.5 ${editingNoteId === note.id ? 'border-[#B88A44]/35 bg-[#FDF8EF]' : 'border-gray-100 bg-gray-50 hover:bg-white'}`}
                                                    >
                                                        <p className={`truncate text-[12px] font-bold ${editingNoteId === note.id ? 'text-[#6b5428]' : 'text-gray-800'}`}>{note.title}</p>
                                                        <p className="mt-0.5 text-[10px] text-gray-400">{note.reference} · {getRelativeTime(note.date)}</p>
                                                        {(note.tags ?? []).length > 0 && (
                                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                                {(note.tags ?? []).slice(0, 3).map(t => (
                                                                    <span key={t} className="rounded-full border border-[#B88A44]/20 bg-[#FDF8EF] px-1.5 py-0.5 text-[8px] font-bold text-[#8a6d3d]">#{t}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </button>
                                                )) : (
                                                    <p className="py-4 text-center text-[11px] italic text-gray-400">No hay notas aún.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Editor — móvil: debajo del contexto; scroll solo en el cuerpo del texto */}
                                <div className="order-2 flex w-full flex-none flex-col overflow-x-hidden md:order-none md:min-h-0 md:flex-[1_1_58%] md:flex-1 md:overflow-hidden">
                                    <div className="mx-auto flex w-full max-w-3xl flex-none flex-col gap-2.5 overflow-x-hidden p-3 sm:gap-4 sm:p-4 md:h-full md:min-h-0 md:flex-1 md:gap-3 md:overflow-hidden md:p-5 lg:max-w-4xl lg:gap-5 lg:p-6 xl:max-w-5xl xl:p-8 2xl:max-w-[52rem]">

                                        {/* Title — en móvil el cuerpo de la tarjeta hace scroll; la columna no usa flex-1 para no recortar el input */}
                                        <div className="shrink-0 space-y-2 pb-0.5 sm:space-y-2">
                                            <label htmlFor="note-reflection-title" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 sm:text-xs">
                                                Título de la reflexión
                                            </label>
                                            <input
                                                id="note-reflection-title"
                                                type="text"
                                                value={noteTitle}
                                                onChange={(e) => setNoteTitle(e.target.value)}
                                                placeholder="Ej: El poder de la palabra creadora…"
                                                className="box-border min-h-[48px] w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base font-bold leading-normal text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 sm:min-h-11 sm:px-4 sm:text-lg lg:text-xl"
                                            />
                                        </div>

                                        <style>{`
                                            .note-modal-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
                                            .note-modal-editor blockquote { border-left: 4px solid #B88A44; padding-left: 1rem; color: #64748B; font-style: italic; margin: 0.5rem 0; }
                                            .note-modal-editor img { max-width: 100%; border-radius: 0.75rem; margin-top: 1rem; }
                                            .note-modal-editor a { color: #2563eb; text-decoration: underline; }
                                            .note-modal-editor p { min-height: 1.5em; }
                                        `}</style>

                                        {/* Editor + barra de formato unificados */}
                                        <div className="flex min-h-[13rem] flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md shadow-gray-200/30 ring-1 ring-black/[0.03] md:min-h-0">
                                            <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-gray-100 bg-gradient-to-b from-slate-50/90 to-white px-2 py-1.5 sm:gap-0.5 sm:px-3 sm:py-2">
                                                <span className="w-full sm:w-auto text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 sm:mr-2 sm:border-r sm:border-gray-200 sm:pr-3">Formato</span>
                                                <div className="flex flex-wrap items-center gap-0.5 flex-1">
                                                    <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center" title="Negrita"><Bold className="w-4 h-4" /></button>
                                                    <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center" title="Cursiva"><Italic className="w-4 h-4" /></button>
                                                    <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center" title="Lista"><List className="w-4 h-4" /></button>
                                                    <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('formatBlock', 'blockquote'); }} className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center" title="Cita"><Quote className="w-4 h-4" /></button>
                                                    <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" aria-hidden />
                                                    <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                                                        <PopoverTrigger asChild>
                                                            <button type="button" onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }} onClick={() => setIsLinkPopoverOpen(true)} className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center" title="Enlace"><LinkIcon className="w-4 h-4" /></button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border-gray-100 p-4 shadow-xl sm:w-80" sideOffset={12} align="end">
                                                            <div className="flex flex-col gap-3">
                                                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Añadir enlace</label>
                                                                <div className="flex gap-2">
                                                                    <input type="url" autoFocus value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="https://..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/15" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmLink(); } else if (e.key === 'Escape') { setIsLinkPopoverOpen(false); } }} />
                                                                    <button type="button" onClick={confirmLink} className="bg-[#B88A44] hover:bg-[#a67b3d] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0">Insertar</button>
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                                                    <button type="button" onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }} onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center" title="Imagen"><ImgIcon className="w-4 h-4" /></button>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-400 px-2 py-1 ml-auto text-xs font-medium tabular-nums border-t border-gray-100 w-full sm:w-auto sm:border-t-0 sm:border-l sm:border-gray-200 sm:pl-3 mt-1 sm:mt-0 justify-end sm:justify-start">
                                                    <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                                                    <span className="hidden sm:inline text-gray-500">Ahora</span>
                                                    <time dateTime={mounted ? new Date().toISOString() : undefined}>
                                                        {mounted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                    </time>
                                                </div>
                                            </div>

                                            <div className="relative min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-5">
                                                {(!noteContent || noteContent === '<br>') && (
                                                    <p className="pointer-events-none absolute left-3 top-3 select-none pr-6 text-[15px] leading-relaxed text-gray-400 sm:left-4 sm:top-4 sm:text-base">Escribe lo que Dios puso en tu corazón…</p>
                                                )}
                                                <div
                                                    ref={contentEditableRef}
                                                    contentEditable
                                                    onInput={(e) => setNoteContent(e.currentTarget.innerHTML)}
                                                    className="note-modal-editor min-h-[6rem] w-full bg-transparent text-[15px] leading-relaxed text-gray-800 focus:outline-none max-md:min-h-[5rem] sm:min-h-[10rem] sm:text-base md:min-h-[12rem]"
                                                />
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="shrink-0 rounded-2xl border border-gray-200/90 bg-white p-3 shadow-sm sm:p-4">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Etiquetas</p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {noteTags.map((tag, i) => (
                                                    <span key={i} className="bg-[#FDF8EF] text-[#8a6d3d] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#B88A44]/25">
                                                        #{tag}
                                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-[#B88A44]/50 hover:text-[#6b5428] transition-colors"><X className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                                {isAddingTag ? (
                                                    <input type="text" autoFocus value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } else if (e.key === 'Escape') { setIsAddingTag(false); } }} onBlur={handleAddTag} className="border border-[#B88A44]/50 text-[#6b5428] outline-none text-xs font-bold px-3 py-1.5 rounded-full w-[110px] bg-[#FDF8EF] transition-colors" placeholder="etiqueta…" />
                                                ) : (
                                                    <button type="button" onClick={() => setIsAddingTag(true)} className="border border-dashed border-gray-300 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:border-[#B88A44]/40 hover:text-[#B88A44] transition-colors">+ Añadir</button>
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
                    <div key="studio-view" className="animate-in fade-in slide-in-from-right-8 duration-300 flex min-h-0 w-[calc(100%+1.5rem)] max-w-none flex-1 flex-col -mx-3 sm:mx-0 sm:w-full">
                        <div className="flex max-h-[calc(100dvh-5.75rem)] min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border-y border-gray-100 bg-white shadow-xl sm:max-h-[calc(100svh-5.25rem)] sm:rounded-2xl sm:border sm:shadow-2xl md:max-h-[calc(100dvh-4.75rem)]">
                            <input ref={studioOverlayImageRef} type="file" accept="image/*" className="sr-only" aria-hidden onChange={handleStudioOverlayImagePick} />

                            {/* ── Header ── */}
                            <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between px-3 py-2 sm:px-5 sm:py-3 border-b border-gray-100 bg-white shrink-0">
                                <div className="flex items-center gap-2 sm:items-start sm:gap-3 min-w-0">
                                    <button type="button" onClick={() => setIsStudioOpen(false)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors group shrink-0 min-h-10 min-w-10 sm:min-w-0 sm:min-h-0 justify-center sm:justify-start -ml-1 rounded-lg sm:rounded-none active:bg-gray-100 sm:active:bg-transparent">
                                        <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
                                        <span className="text-sm font-semibold hidden sm:inline">Volver</span>
                                    </button>
                                    <div className="hidden sm:block w-px h-8 bg-gray-200 shrink-0" aria-hidden />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 truncate max-sm:hidden sm:flex">
                                            <ImageIcon className="w-3.5 h-3.5 sm:w-3 sm:h-3 shrink-0" /> Editor · <span className="truncate">{selectedVersesRef}</span>
                                        </p>
                                        <h2 className="text-sm sm:text-sm font-bold text-gray-900 leading-tight sm:leading-snug mt-0 sm:mt-0.5">Vista previa de publicación</h2>
                                    </div>
                                </div>
                                <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <button type="button" onClick={resetDragPos} className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 sm:border-0 transition-colors min-h-10 sm:min-h-[36px]">
                                        <X className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                                        <span>Restablecer</span>
                                    </button>
                                    <button type="button" onClick={saveStudioPublicationDraft} className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 sm:border-0 transition-colors min-h-10 sm:min-h-[36px]">
                                        <Save className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                                        <span className="hidden sm:inline">Guardar borrador</span>
                                        <span className="sm:hidden">Guardar</span>
                                    </button>
                                    <button type="button" onClick={handleDownloadPreview} className="flex flex-[1.15] sm:flex-none items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-xs font-bold shadow-md shadow-blue-900/30 sm:shadow-lg sm:shadow-blue-900/40 transition-colors min-h-10 sm:min-h-0">
                                        <Download className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                                        <span className="hidden sm:inline">Descargar imagen</span>
                                        <span className="sm:hidden">Descargar</span>
                                    </button>
                                </div>
                            </div>

                            {/* ── Body: lienzo primero en móvil para ver el documento sin scroll excesivo ── */}
                            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">

                                {/* Canvas Area */}
                                <div className="custom-scrollbar flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto overflow-x-hidden bg-gray-50 p-2 sm:p-4 lg:items-start lg:justify-center lg:p-10 max-lg:min-h-[min(42dvh,320px)] lg:min-h-0">
                                    <div className="flex w-full max-w-full flex-col items-center gap-2 sm:gap-4">
                                        <p className="max-w-md px-2 text-center text-[10px] leading-snug tracking-wide text-gray-500 select-none sm:text-[10px] max-sm:line-clamp-2">
                                            ✦ Arrastra textos en el lienzo para moverlos; desde la pestaña Texto puedes soltar <strong className="text-gray-600">Texto libre</strong> o <strong className="text-gray-600">Imagen</strong> sobre la vista previa
                                        </p>

                                        {/* Vertical */}
                                        <div className={`flex-col items-center gap-3 w-full ${studioTheme.orientation !== 'vertical' ? 'hidden' : 'flex'}`}>
                                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center px-1">
                                                <div className="h-px w-6 sm:w-8 bg-gray-200 shrink-0 max-sm:hidden" />
                                                <span>Vertical 9:16 · TikTok / Historia</span>
                                                <div className="h-px w-6 sm:w-8 bg-gray-200 shrink-0 max-sm:hidden" />
                                            </div>
                                            <div
                                                id="preview-vertical"
                                                onPointerDown={() => { setSelectedElement(null); setSelectedOverlayId(null); setStudioOverlayTextEditingId(null); setStudioFixedTextEditing(null); }}
                                                onDragEnter={(e) => { e.preventDefault(); setStudioDropHighlight(true); }}
                                                onDragLeave={(e) => {
                                                    const rt = e.relatedTarget as Node | null;
                                                    if (rt && (e.currentTarget as HTMLElement).contains(rt)) return;
                                                    setStudioDropHighlight(false);
                                                }}
                                                onDragOver={handlePreviewDragOver}
                                                onDrop={handlePreviewDrop}
                                                className={`relative mx-auto flex aspect-[9/16] w-full max-w-[min(280px,calc(100vw-2.5rem))] flex-col items-center justify-center overflow-hidden rounded-2xl p-4 text-center shadow-2xl ring-1 ring-white/10 transition-all duration-300 max-lg:max-h-[44dvh] max-lg:w-[min(calc(100vw-1.25rem),calc(44dvh*9/16))] max-lg:max-w-none sm:p-6 ${studioDropHighlight ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent' : ''}`}
                                                style={{ backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor, backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <GridOverlay visible={isCanvasDragging} snapX={activeSnap.x} snapY={activeSnap.y} />
                                                {renderStudioFixedText('ref', {
                                                    label: 'Referencia',
                                                    displayValue: studioRefDisplay,
                                                    viewContent: studioRefDisplay || '\u00a0',
                                                    contentClassName: 'uppercase tracking-[0.2em] z-20 mb-8 select-none',
                                                    attachInputRef: studioTheme.orientation === 'vertical',
                                                })}
                                                {renderStudioFixedText('verse', {
                                                    label: 'Versículo',
                                                    displayValue: studioVerseDisplay,
                                                    multiline: true,
                                                    viewContent: (
                                                        <>
                                                            {'"'}
                                                            {studioVerseDisplay}
                                                            {'"'}
                                                        </>
                                                    ),
                                                    contentClassName: 'font-serif z-20 w-full leading-tight select-none',
                                                    attachInputRef: studioTheme.orientation === 'vertical',
                                                })}
                                                {renderStudioFixedText('website', {
                                                    label: 'Sitio web',
                                                    displayValue: studioWebsiteDisplay,
                                                    viewContent: studioWebsiteDisplay || '\u00a0',
                                                    contentClassName: 'tracking-widest z-20 mt-6 select-none',
                                                    attachInputRef: studioTheme.orientation === 'vertical',
                                                })}
                                                {renderStudioOverlayLayer(280)}
                                            </div>
                                        </div>

                                        {/* Horizontal */}
                                        <div className={`flex-col items-center gap-3 w-full ${studioTheme.orientation !== 'horizontal' ? 'hidden' : 'flex'}`}>
                                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center px-1">
                                                <div className="h-px w-6 sm:w-8 bg-gray-200 shrink-0 max-sm:hidden" />
                                                <span>Horizontal 16:9 · Facebook / YouTube</span>
                                                <div className="h-px w-6 sm:w-8 bg-gray-200 shrink-0 max-sm:hidden" />
                                            </div>
                                            <div
                                                id="preview-horizontal"
                                                onPointerDown={() => { setSelectedElement(null); setSelectedOverlayId(null); setStudioOverlayTextEditingId(null); setStudioFixedTextEditing(null); }}
                                                onDragEnter={(e) => { e.preventDefault(); setStudioDropHighlight(true); }}
                                                onDragLeave={(e) => {
                                                    const rt = e.relatedTarget as Node | null;
                                                    if (rt && (e.currentTarget as HTMLElement).contains(rt)) return;
                                                    setStudioDropHighlight(false);
                                                }}
                                                onDragOver={handlePreviewDragOver}
                                                onDrop={handlePreviewDrop}
                                                className={`relative mx-auto flex aspect-video w-full max-w-[min(560px,calc(100vw-2.5rem))] flex-col items-center justify-center overflow-hidden rounded-2xl p-4 text-center shadow-2xl ring-1 ring-white/10 transition-all duration-300 max-lg:max-h-[min(30dvh,52vw)] max-lg:max-w-[min(calc(100vw-1.25rem),92vw)] sm:p-6 ${studioDropHighlight ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent' : ''}`}
                                                style={{ backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor, backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <GridOverlay visible={isCanvasDragging} snapX={activeSnap.x} snapY={activeSnap.y} />
                                                {renderStudioFixedText('verse', {
                                                    label: 'Versículo',
                                                    displayValue: studioVerseDisplay,
                                                    multiline: true,
                                                    viewContent: (
                                                        <>
                                                            {'"'}
                                                            {studioVerseDisplay}
                                                            {'"'}
                                                        </>
                                                    ),
                                                    contentClassName: 'font-serif z-20 w-full leading-tight select-none',
                                                    attachInputRef: studioTheme.orientation === 'horizontal',
                                                })}
                                                {renderStudioFixedText('ref', {
                                                    label: 'Referencia',
                                                    displayValue: studioRefDisplay,
                                                    viewContent: (
                                                        <>
                                                            — {studioRefDisplay || '\u00a0'}
                                                        </>
                                                    ),
                                                    contentClassName: 'uppercase tracking-[0.2em] z-20 mt-6 select-none',
                                                    attachInputRef: studioTheme.orientation === 'horizontal',
                                                })}
                                                {renderStudioFixedText('website', {
                                                    label: 'Sitio web',
                                                    displayValue: studioWebsiteDisplay,
                                                    viewContent: studioWebsiteDisplay || '\u00a0',
                                                    contentClassName: 'tracking-widest z-20 mt-3 select-none',
                                                    attachInputRef: studioTheme.orientation === 'horizontal',
                                                })}
                                                {renderStudioOverlayLayer(520)}
                                            </div>
                                        </div>

                                        {/* Square */}
                                        <div className={`flex-col items-center gap-3 w-full ${studioTheme.orientation !== 'square' ? 'hidden' : 'flex'}`}>
                                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center px-1">
                                                <div className="h-px w-6 sm:w-8 bg-gray-200 shrink-0 max-sm:hidden" />
                                                <span>Cuadrado 1:1 · Feed</span>
                                                <div className="h-px w-6 sm:w-8 bg-gray-200 shrink-0 max-sm:hidden" />
                                            </div>
                                            <div
                                                id="preview-square"
                                                onPointerDown={() => { setSelectedElement(null); setSelectedOverlayId(null); setStudioOverlayTextEditingId(null); setStudioFixedTextEditing(null); }}
                                                onDragEnter={(e) => { e.preventDefault(); setStudioDropHighlight(true); }}
                                                onDragLeave={(e) => {
                                                    const rt = e.relatedTarget as Node | null;
                                                    if (rt && (e.currentTarget as HTMLElement).contains(rt)) return;
                                                    setStudioDropHighlight(false);
                                                }}
                                                onDragOver={handlePreviewDragOver}
                                                onDrop={handlePreviewDrop}
                                                className={`relative mx-auto flex aspect-square w-full max-w-[min(380px,calc(100vw-2.5rem))] flex-col items-center justify-center overflow-hidden rounded-2xl p-4 text-center shadow-2xl ring-1 ring-white/10 transition-all duration-300 max-lg:max-h-[min(38dvh,78vw)] max-lg:max-w-[min(calc(100vw-1.25rem),78vw)] sm:p-6 ${studioDropHighlight ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent' : ''}`}
                                                style={{ backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor, backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <GridOverlay visible={isCanvasDragging} snapX={activeSnap.x} snapY={activeSnap.y} />
                                                {renderStudioFixedText('ref', {
                                                    label: 'Referencia',
                                                    displayValue: studioRefDisplay,
                                                    viewContent: studioRefDisplay || '\u00a0',
                                                    contentClassName: 'uppercase tracking-[0.2em] z-20 mb-8 select-none',
                                                    attachInputRef: studioTheme.orientation === 'square',
                                                })}
                                                {renderStudioFixedText('verse', {
                                                    label: 'Versículo',
                                                    displayValue: studioVerseDisplay,
                                                    multiline: true,
                                                    viewContent: (
                                                        <>
                                                            {'"'}
                                                            {studioVerseDisplay}
                                                            {'"'}
                                                        </>
                                                    ),
                                                    contentClassName: 'font-serif z-20 w-full leading-tight select-none',
                                                    attachInputRef: studioTheme.orientation === 'square',
                                                })}
                                                {renderStudioFixedText('website', {
                                                    label: 'Sitio web',
                                                    displayValue: studioWebsiteDisplay,
                                                    viewContent: studioWebsiteDisplay || '\u00a0',
                                                    contentClassName: 'tracking-widest z-20 mt-6 select-none',
                                                    attachInputRef: studioTheme.orientation === 'square',
                                                })}
                                                {renderStudioOverlayLayer(360)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Sidebar ── */}
                                <div className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-gray-100 bg-white max-lg:max-h-[min(46dvh,22rem)] lg:max-h-none lg:w-[300px] lg:border-l lg:border-t-0 xl:w-[320px]">

                                    {/* Tab Bar */}
                                    <div className="flex shrink-0 border-b border-gray-100 bg-gray-50/50">
                                        {([
                                            { id: 'formato', label: 'Formato' },
                                            { id: 'fondo',   label: 'Fondo'   },
                                            { id: 'texto',   label: 'Texto'   },
                                        ] as const).map(tab => (
                                            <button
                                                type="button"
                                                key={tab.id}
                                                onClick={() => setStudioTab(tab.id)}
                                                className={`flex-1 min-h-10 px-1 py-2 text-[11px] font-black tracking-wide transition-all border-b-2 sm:min-h-[48px] sm:py-3 sm:text-xs lg:text-[11px] ${studioTab === tab.id ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-700 active:bg-gray-100'}`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">

                                        {/* ── Tab: Formato ── */}
                                        {studioTab === 'formato' && (
                                            <div className="flex flex-col gap-4 p-3 sm:gap-7 sm:p-5">
                                                {/* Orientation */}
                                                <div>
                                                    <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-gray-400 sm:mb-3">Orientación</label>
                                                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                                        {([
                                                            { val: 'vertical',   lbl: 'Vertical',   hint: '9:16', icon: <div className="mx-auto mb-0.5 h-4 w-2.5 rounded-[2px] bg-current sm:mb-1 sm:h-5 sm:w-3 sm:rounded-[3px]" /> },
                                                            { val: 'horizontal', lbl: 'Horizontal', hint: '16:9', icon: <div className="mx-auto mb-0.5 h-2.5 w-4 rounded-[2px] bg-current sm:mb-1 sm:h-3 sm:w-5 sm:rounded-[3px]" /> },
                                                            { val: 'square',     lbl: 'Cuadrado',   hint: '1:1',  icon: <div className="mx-auto mb-0.5 h-3.5 w-3.5 rounded-[2px] bg-current sm:mb-1 sm:h-4 sm:w-4 sm:rounded-[3px]" /> },
                                                        ] as const).map(({ val, lbl, hint, icon }) => (
                                                            <button type="button" key={val} onClick={() => setStudioTheme({ ...studioTheme, orientation: val })}
                                                                className={`flex min-h-[3.25rem] flex-col items-center justify-center rounded-lg border-2 px-0.5 py-2 transition-all active:scale-[0.98] sm:min-h-0 sm:rounded-xl sm:py-4 sm:px-2 ${studioTheme.orientation === val ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white'}`}
                                                            >
                                                                {icon}
                                                                <span className="block text-[9px] font-black sm:text-[10px]">{lbl}</span>
                                                                <span className="text-[7px] font-medium text-current opacity-60 sm:text-[8px]">{hint}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Platform: fila deslizable en móvil para no consumir tanta altura */}
                                                <div>
                                                    <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-gray-400 sm:mb-3">Plataforma</label>
                                                    <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
                                                        {([
                                                            { id: 'instagram', label: 'Instagram', orientation: 'square'    as const, hint: '1:1',  activeText: 'text-[#E1306C]', activeBg: 'bg-[#E1306C]/10', activeBorder: 'border-[#E1306C]', icon: <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg> },
                                                            { id: 'facebook',  label: 'Facebook',  orientation: 'horizontal' as const, hint: '16:9', activeText: 'text-[#1877F2]', activeBg: 'bg-[#1877F2]/10', activeBorder: 'border-[#1877F2]', icon: <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                                                            { id: 'twitter',   label: 'X',         orientation: 'square'    as const, hint: '1:1',  activeText: 'text-gray-900',  activeBg: 'bg-gray-900/10',   activeBorder: 'border-gray-900',   icon: <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.986l4.265 5.639zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                                                            { id: 'pinterest', label: 'Pinterest', orientation: 'vertical'  as const, hint: '2:3',  activeText: 'text-[#E60023]', activeBg: 'bg-[#E60023]/10',  activeBorder: 'border-[#E60023]',  icon: <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg> },
                                                            { id: 'tiktok',    label: 'TikTok',    orientation: 'vertical'  as const, hint: '9:16', activeText: 'text-gray-900',  activeBg: 'bg-gray-900/10',   activeBorder: 'border-gray-900',   icon: <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z"/></svg> },
                                                        ] as const).map(({ id, label, orientation, hint, activeText, activeBg, activeBorder, icon }) => (
                                                            <button type="button" key={id} onClick={() => {
                                                                const isActive = selectedPlatform === id;
                                                                setSelectedPlatform(isActive ? null : id);
                                                                if (!isActive) setStudioTheme(t => ({ ...t, orientation }));
                                                            }}
                                                                className={`flex min-h-0 min-w-[5.25rem] shrink-0 snap-start flex-row items-center gap-2 rounded-lg border-2 px-2.5 py-2 transition-all active:scale-[0.98] sm:min-h-[4.25rem] sm:w-auto sm:min-w-0 sm:flex-col sm:gap-1 sm:rounded-xl sm:px-1 sm:py-3 ${selectedPlatform === id ? `${activeBg} ${activeBorder} ${activeText}` : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white'}`}
                                                            >
                                                                {icon}
                                                                <span className="flex min-w-0 flex-1 flex-col items-start text-left sm:items-center sm:text-center">
                                                                    <span className="text-[8px] font-black leading-tight tracking-wide sm:leading-none">{label}</span>
                                                                    <span className="text-[7px] font-medium leading-none opacity-60">{hint}</span>
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Tab: Fondo ── */}
                                        {studioTab === 'fondo' && (
                                            <div className="p-4 sm:p-5 flex flex-col gap-6 sm:gap-7">
                                                {/* Colors */}
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Color de fondo</label>
                                                    <div className="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:overflow-visible snap-x snap-mandatory [scrollbar-width:thin]">
                                                        <button type="button" onClick={() => customColorRef.current?.click()} className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 hover:bg-blue-100 transition-colors shrink-0 snap-start" title="Personalizado">
                                                            <Palette className="w-4 h-4" />
                                                        </button>
                                                        <input ref={customColorRef} type="color" className="sr-only" value={studioTheme.bgColor} onChange={(e) => setStudioTheme({ ...studioTheme, bgColor: e.target.value, bgImage: null })} />
                                                        {(swatchesExpanded ? ALL_SWATCHES : ALL_SWATCHES.slice(0, 14)).map(color => (
                                                            <button type="button" key={color} onClick={() => setStudioTheme({ ...studioTheme, bgColor: color, bgImage: null })}
                                                                className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl border-2 transition-all shrink-0 snap-start ${studioTheme.bgColor === color && !studioTheme.bgImage ? 'ring-2 ring-offset-1 ring-blue-500 scale-110 border-transparent' : 'border-gray-100 active:scale-95 sm:hover:scale-105'}`}
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                    {!swatchesExpanded && (
                                                        <button type="button" onClick={() => setSwatchesExpanded(true)} className="mt-3 w-full min-h-11 py-3 sm:py-2 rounded-xl border border-gray-100 text-sm sm:text-[11px] font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                                                            Ver más colores
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Gallery */}
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Galería de fondos</label>
                                                        <button type="button" onClick={() => document.getElementById('studio-upload')?.click()} className="text-xs sm:text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors shrink-0 min-h-11 min-w-[4.5rem] justify-center rounded-lg active:bg-blue-50 px-2">
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
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2">
                                                        {studioGallery.slice(0, galleryVisibleCount).map((url, idx) => (
                                                            <div key={url + idx} className="relative group aspect-square">
                                                                <button type="button" onClick={() => setStudioTheme({ ...studioTheme, bgImage: url })}
                                                                    className={`w-full h-full rounded-xl bg-cover bg-center border-2 transition-all active:scale-[0.98] ${studioTheme.bgImage === url ? 'border-blue-500 scale-[1.02] shadow-md' : 'border-transparent sm:hover:scale-105'}`}
                                                                    style={{ backgroundImage: `url(${url})` }}
                                                                />
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); setStudioGallery(prev => { const next = prev.filter((_, i) => i !== idx); const userUploads = next.filter(img => img.startsWith('data:')); localStorage.setItem('studioGalleryUploads', JSON.stringify(userUploads)); return next; }); if (studioTheme.bgImage === url) setStudioTheme(t => ({ ...t, bgImage: '' })); }}
                                                                    className="absolute top-1 right-1 min-w-9 min-h-9 w-9 h-9 rounded-full bg-black/65 hover:bg-red-500 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10 shadow-md"
                                                                    title="Eliminar"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {galleryVisibleCount < studioGallery.length && (
                                                        <button type="button" onClick={() => setGalleryVisibleCount(prev => prev + 6)} className="w-full mt-3 min-h-11 py-3 sm:py-2 rounded-xl border border-gray-100 text-sm sm:text-[11px] font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                                                            Ver más ({studioGallery.length - galleryVisibleCount} restantes)
                                                        </button>
                                                    )}
                                                    {studioTheme.bgImage && (
                                                        <button type="button" onClick={() => setStudioTheme(t => ({ ...t, bgImage: null }))} className="w-full mt-2 min-h-11 py-3 sm:py-2 rounded-xl text-sm sm:text-[11px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors">
                                                            Quitar imagen de fondo
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Tab: Texto ── */}
                                        {studioTab === 'texto' && (
                                            <div className="p-4 sm:p-5">
                                                {(() => {
                                                    const o = selectedOverlayId ? studioOverlays.find((x) => x.id === selectedOverlayId) : undefined;
                                                    if (o) {
                                                        return (
                                                            <div className="flex flex-col gap-5">
                                                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Elemento añadido</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeStudioOverlay(o.id)}
                                                                    className="min-h-10 w-full rounded-xl border border-red-200 bg-red-50/80 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                                                                >
                                                                    Quitar del lienzo
                                                                </button>
                                                                {o.type === 'text' ? (
                                                                    <>
                                                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Contenido</label>
                                                                        <textarea
                                                                            value={o.text}
                                                                            onChange={(e) => updateStudioOverlay(o.id, { text: e.target.value })}
                                                                            rows={4}
                                                                            className="w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                                        />
                                                                        <div>
                                                                            <div className="mb-2 flex items-center justify-between">
                                                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Tamaño</span>
                                                                                <span className="text-[11px] font-black tabular-nums text-blue-600">{o.fontSize}px</span>
                                                                            </div>
                                                                            <input
                                                                                type="range"
                                                                                min={6}
                                                                                max={72}
                                                                                value={o.fontSize}
                                                                                onChange={(e) => updateStudioOverlay(o.id, { fontSize: parseInt(e.target.value, 10) })}
                                                                                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-blue-600"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">Peso</span>
                                                                            <div className="grid grid-cols-4 gap-1.5">
                                                                                {[['300', 'Fino'], ['400', 'Normal'], ['700', 'Negrita'], ['900', 'Negra']].map(([w, lbl]) => (
                                                                                    <button
                                                                                        type="button"
                                                                                        key={w}
                                                                                        onClick={() => updateStudioOverlay(o.id, { fontWeight: w })}
                                                                                        className={`min-h-10 rounded-lg border py-2 text-[9px] font-bold transition-all ${o.fontWeight === w ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                                                                    >
                                                                                        {lbl}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">Alineación</span>
                                                                            <div className="flex gap-2">
                                                                                {(['left', 'center', 'right'] as const).map((align) => (
                                                                                    <button
                                                                                        type="button"
                                                                                        key={align}
                                                                                        onClick={() => updateStudioOverlay(o.id, { textAlign: align })}
                                                                                        className={`flex h-11 flex-1 items-center justify-center rounded-xl border transition-all ${o.textAlign === align ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                                                                    >
                                                                                        <div className="flex w-4 flex-col gap-1">
                                                                                            <div className="h-0.5 w-full rounded-full bg-current" />
                                                                                            <div className={`h-0.5 rounded-full bg-current ${align === 'left' ? 'w-2.5' : align === 'center' ? 'mx-auto w-2.5' : 'ml-auto w-2.5'}`} />
                                                                                            <div className="h-0.5 w-full rounded-full bg-current" />
                                                                                        </div>
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">Color</span>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => updateStudioOverlay(o.id, { color: 'auto' })}
                                                                                    title="Automático"
                                                                                    className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-[9px] font-black transition-all ${o.color === 'auto' ? 'scale-110 border-blue-500' : 'border-gray-200'} bg-gradient-to-br from-white to-gray-800`}
                                                                                >
                                                                                    A
                                                                                </button>
                                                                                {['#FFFFFF', '#000000', '#FEF08A', '#93C5FD', '#FCA5A5', '#6EE7B7', '#C4B5FD', '#FED7AA'].map((c) => (
                                                                                    <button
                                                                                        type="button"
                                                                                        key={c}
                                                                                        onClick={() => updateStudioOverlay(o.id, { color: c })}
                                                                                        className={`h-10 w-10 rounded-xl border-2 transition-all ${o.color === c ? 'scale-110 border-blue-500' : 'border-gray-100'}`}
                                                                                        style={{ backgroundColor: c }}
                                                                                    />
                                                                                ))}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => studioOverlayTextColorRef.current?.click()}
                                                                                    title="Personalizado"
                                                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-100 bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100"
                                                                                >
                                                                                    <Palette className="h-3.5 w-3.5" />
                                                                                </button>
                                                                                <input
                                                                                    ref={studioOverlayTextColorRef}
                                                                                    type="color"
                                                                                    className="sr-only"
                                                                                    value={o.color === 'auto' ? autoColor : o.color}
                                                                                    onChange={(e) => updateStudioOverlay(o.id, { color: e.target.value })}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div>
                                                                            <div className="mb-2 flex items-center justify-between">
                                                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Ancho</span>
                                                                                <span className="text-[11px] font-black tabular-nums text-blue-600">{o.imageWidthPercent}%</span>
                                                                            </div>
                                                                            <input
                                                                                type="range"
                                                                                min={20}
                                                                                max={100}
                                                                                value={o.imageWidthPercent}
                                                                                onChange={(e) => updateStudioOverlay(o.id, { imageWidthPercent: parseInt(e.target.value, 10) })}
                                                                                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-blue-600"
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                studioOverlayImageTargetRef.current = o.id;
                                                                                studioOverlayImageRef.current?.click();
                                                                            }}
                                                                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
                                                                        >
                                                                            <ImgIcon className="h-4 w-4" />
                                                                            Elegir imagen
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    if (selectedElement === null) {
                                                        return (
                                                            <div className="flex flex-col items-center gap-4 py-6 text-center sm:py-10">
                                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
                                                                    <Type className="h-6 w-6 text-gray-300" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-500">Selecciona un texto</p>
                                                                    <p className="mt-1 px-2 text-[11px] leading-snug text-gray-400">
                                                                        Toca un texto en el lienzo o arrastra <strong className="text-gray-600">Texto</strong> / <strong className="text-gray-600">Imagen</strong> desde abajo hasta la vista previa.
                                                                    </p>
                                                                </div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Añadir al lienzo</p>
                                                                <div className="grid w-full grid-cols-2 gap-2">
                                                                    <div
                                                                        role="button"
                                                                        tabIndex={0}
                                                                        draggable
                                                                        onDragStart={(e) => {
                                                                            e.dataTransfer.setData(STUDIO_DND_MIME, 'text');
                                                                            e.dataTransfer.effectAllowed = 'copy';
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                                e.preventDefault();
                                                                                addStudioOverlayAt('text', { x: 0, y: 40 });
                                                                            }
                                                                        }}
                                                                        onClick={() => addStudioOverlayAt('text', { x: 0, y: 40 })}
                                                                        className="flex cursor-grab flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 py-4 text-center transition-all hover:border-blue-300 hover:bg-blue-50/50 active:cursor-grabbing"
                                                                    >
                                                                        <Type className="h-6 w-6 text-blue-500" />
                                                                        <span className="text-[11px] font-black text-gray-700">Texto libre</span>
                                                                        <span className="text-[9px] text-gray-400">Arrastrar o tocar</span>
                                                                    </div>
                                                                    <div
                                                                        role="button"
                                                                        tabIndex={0}
                                                                        draggable
                                                                        onDragStart={(e) => {
                                                                            e.dataTransfer.setData(STUDIO_DND_MIME, 'image');
                                                                            e.dataTransfer.effectAllowed = 'copy';
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                                e.preventDefault();
                                                                                addStudioOverlayAt('image', { x: 0, y: 40 });
                                                                            }
                                                                        }}
                                                                        onClick={() => addStudioOverlayAt('image', { x: 0, y: 40 })}
                                                                        className="flex cursor-grab flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 py-4 text-center transition-all hover:border-blue-300 hover:bg-blue-50/50 active:cursor-grabbing"
                                                                    >
                                                                        <ImgIcon className="h-6 w-6 text-blue-500" />
                                                                        <span className="text-[11px] font-black text-gray-700">Imagen</span>
                                                                        <span className="text-[9px] text-gray-400">Arrastrar o tocar</span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 flex w-full flex-col gap-2">
                                                                    {(['ref', 'verse', 'website'] as const).map((el) => (
                                                                        <button
                                                                            type="button"
                                                                            key={el}
                                                                            onClick={() => {
                                                                                setSelectedOverlayId(null);
                                                                                setSelectedElement(el);
                                                                            }}
                                                                            className="flex min-h-12 w-full items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left text-sm font-bold text-gray-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-[0.99] sm:py-2.5 sm:text-xs"
                                                                        >
                                                                            <div className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                                                                            {el === 'ref' ? 'Referencia' : el === 'verse' ? 'Versículo' : 'Sitio web'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div className="flex flex-col gap-6">
                                                            <div className="flex gap-1.5">
                                                                {(['ref', 'verse', 'website'] as const).map((el) => (
                                                                    <button
                                                                        type="button"
                                                                        key={el}
                                                                        onClick={() => {
                                                                            setSelectedOverlayId(null);
                                                                            setSelectedElement(el);
                                                                        }}
                                                                        className={`min-h-11 flex-1 rounded-lg py-2.5 text-[10px] font-black transition-all sm:py-2 sm:text-[9px] ${selectedElement === el ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                                    >
                                                                        {el === 'ref' ? 'Ref.' : el === 'verse' ? 'Verso' : 'Web'}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <div>
                                                                <div className="mb-2 flex items-center justify-between">
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Tamaño</span>
                                                                    <span className="text-[11px] font-black tabular-nums text-blue-600">{elementStyles[selectedElement].fontSize}px</span>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min={6}
                                                                    max={72}
                                                                    value={elementStyles[selectedElement].fontSize}
                                                                    onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                                                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-blue-600"
                                                                />
                                                                <div className="mt-1 flex justify-between text-[9px] font-medium text-gray-300">
                                                                    <span>6</span>
                                                                    <span>72</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">Peso</span>
                                                                <div className="grid grid-cols-4 gap-1.5">
                                                                    {[['300', 'Fino'], ['400', 'Normal'], ['700', 'Negrita'], ['900', 'Negra']].map(([w, lbl]) => (
                                                                        <button
                                                                            type="button"
                                                                            key={w}
                                                                            onClick={() => updateElement(selectedElement, { fontWeight: w })}
                                                                            className={`min-h-10 rounded-lg border py-2.5 text-[9px] font-bold transition-all sm:py-2 ${elementStyles[selectedElement].fontWeight === w ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                                                        >
                                                                            {lbl}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">Alineación</span>
                                                                <div className="flex gap-2">
                                                                    {(['left', 'center', 'right'] as const).map((align) => (
                                                                        <button
                                                                            type="button"
                                                                            key={align}
                                                                            onClick={() => updateElement(selectedElement, { textAlign: align })}
                                                                            className={`flex h-11 min-h-11 flex-1 items-center justify-center rounded-xl border transition-all sm:h-10 ${elementStyles[selectedElement].textAlign === align ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                                                        >
                                                                            <div className="flex w-4 flex-col gap-1">
                                                                                <div className="h-0.5 w-full rounded-full bg-current" />
                                                                                <div className={`h-0.5 rounded-full bg-current ${align === 'left' ? 'w-2.5' : align === 'center' ? 'mx-auto w-2.5' : 'ml-auto w-2.5'}`} />
                                                                                <div className="h-0.5 w-full rounded-full bg-current" />
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">Color del texto</span>
                                                                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateElement(selectedElement, { color: 'auto' })}
                                                                        title="Automático (según fondo)"
                                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-[9px] font-black transition-all sm:h-9 sm:w-9 ${elementStyles[selectedElement].color === 'auto' ? 'scale-110 border-blue-500' : 'border-gray-200'} bg-gradient-to-br from-white to-gray-800`}
                                                                    >
                                                                        A
                                                                    </button>
                                                                    {['#FFFFFF', '#000000', '#FEF08A', '#93C5FD', '#FCA5A5', '#6EE7B7', '#C4B5FD', '#FED7AA'].map((c) => (
                                                                        <button
                                                                            type="button"
                                                                            key={c}
                                                                            onClick={() => updateElement(selectedElement, { color: c })}
                                                                            className={`h-10 w-10 shrink-0 rounded-xl border-2 transition-all sm:h-9 sm:w-9 ${elementStyles[selectedElement].color === c ? 'scale-110 border-blue-500' : 'border-gray-100 active:scale-95 sm:hover:scale-105'}`}
                                                                            style={{ backgroundColor: c }}
                                                                        />
                                                                    ))}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => elementColorRef.current?.click()}
                                                                        title="Personalizado"
                                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-100 bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100 sm:h-9 sm:w-9"
                                                                    >
                                                                        <Palette className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <input
                                                                        ref={elementColorRef}
                                                                        type="color"
                                                                        className="sr-only"
                                                                        value={elementStyles[selectedElement].color === 'auto' ? autoColor : elementStyles[selectedElement].color}
                                                                        onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
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
        {!compactBibleLayout && (
            <>
                <DailyVerse />
                <ReadingPlans />
            </>
        )}
        </>
    );
}
