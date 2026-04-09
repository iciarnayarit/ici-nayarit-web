'use client';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useToast } from '@/app/hooks/use-toast';
import {
    Bookmark, CheckCircle2, Share2, ArrowLeft, Type,
    StickyNote, Copy, Bold, Italic, List, Link as LinkIcon,
    Quote, Clock, X, Save, Plus, Instagram, Facebook, Youtube, Palette,
    Download, Eye, Share2 as ShareIcon, Image as ImageIcon, BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { handleReadPassage, type BibleBookData, type PassageVerse } from '@/lib/bible-data';
import {
    DEFAULT_BIBLE_VERSION_ID,
    DEFAULT_BIBLE_VERSION_LABEL,
    READING_PLAN_VERSIONS,
    READING_PLAN_VERSION_STORAGE_KEY,
    isValidReadingPlanVersionId,
    loadFullBibleLookup,
    type VersionId,
} from '@/lib/bible-versions';
import { useAuth, useClerk } from '@clerk/nextjs';
import {
    ensureClerkSignedIn,
    ensureClerkSignedInForFavoriteAdd,
    goToDashboardBibliaSavedVerses,
} from '@/lib/require-clerk-sign-in';
import { ReadingDay } from '@/lib/reading-plan-data';

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

interface ReadingPlanLayoutProps {
    planData: ReadingDay[];
    planSlug: string;
    title: string;
    description: string;
}

type DayChapterItem = {
    id: string;
    label: string;
    book: string;
    chapter: number;
};

function parseReadingChapters(reading: string): DayChapterItem[] {
    const tokens = reading
        .split(/[;,]/)
        .map(t => t.trim())
        .filter(Boolean);

    const items: DayChapterItem[] = [];
    const seen = new Set<string>();
    let currentBook = '';

    const addChapter = (book: string, chapter: number) => {
        if (!book || !Number.isFinite(chapter)) return;
        const normalizedBook = book.trim();
        const id = `${normalizedBook} ${chapter}`;
        if (seen.has(id)) return;
        seen.add(id);
        items.push({ id, label: id, book: normalizedBook, chapter });
    };

    for (const token of tokens) {
        const hasLetters = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(token);
        let chapterPart = token;

        if (hasLetters) {
            const match = token.match(/^(.+?)\s+(\d.*)$/);
            if (!match) continue;
            currentBook = match[1].trim();
            chapterPart = match[2].trim();
        }

        if (!currentBook) continue;

        const chapterOnly = chapterPart.split(':')[0]?.trim() ?? '';
        if (!chapterOnly) continue;

        if (chapterOnly.includes('-')) {
            const [startRaw, endRaw] = chapterOnly.split('-');
            const start = Number.parseInt(startRaw, 10);
            const end = Number.parseInt(endRaw, 10);
            if (Number.isFinite(start) && Number.isFinite(end)) {
                const from = Math.min(start, end);
                const to = Math.max(start, end);
                for (let ch = from; ch <= to; ch += 1) {
                    addChapter(currentBook, ch);
                }
            }
            continue;
        }

        const chapter = Number.parseInt(chapterOnly, 10);
        if (Number.isFinite(chapter)) {
            addChapter(currentBook, chapter);
        }
    }

    return items;
}

function formatBookName(book: string): string {
    return book
        .split(' ')
        .filter(Boolean)
        .map((token) => {
            if (/^\d+$/.test(token)) return token;
            return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
        })
        .join(' ');
}

export default function ReadingPlanLayout({ planData, planSlug, title, description }: ReadingPlanLayoutProps) {
    const [completedDays, setCompletedDays] = useState<number[]>([]);
    const [completedChaptersByDay, setCompletedChaptersByDay] = useState<Record<number, string[]>>({});
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
    const [highlightedVerses, setHighlightedVerses] = useState<Record<string, string>>({});
    const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedHighlightColor, setSelectedHighlightColor] = useState('blue');

    // Note State
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const [notes, setNotes] = useState<CustomNote[]>([]);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [noteTags, setNoteTags] = useState<string[]>([]);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const contentEditableRef = useRef<HTMLDivElement>(null);

    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [linkInput, setLinkInput] = useState("");
    const [savedSelection, setSavedSelection] = useState<Range | null>(null);

    // Typography State
    const [fontSize, setFontSize] = useState(100);
    const [lineHeight, setLineHeight] = useState<'tight' | 'normal' | 'loose'>('normal');
    const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');

    // Social Studio State
    const [isStudioOpen, setIsStudioOpen] = useState(false);
    const [socialFormat, setSocialFormat] = useState<'vertical' | 'horizontal'>('vertical');
    const [studioTheme, setStudioTheme] = useState({
        bgColor: '#2563EB',
        bgImage: null as string | null,
        fontSize: 18,
        fontWeight: 'bold',
        alignment: 'center' as 'left' | 'center' | 'right',
        orientation: 'vertical' as 'vertical' | 'horizontal' | 'square',
        motionEffects: false
    });

    const DEFAULT_GALLERY = [
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
        'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
        'https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?w=600&q=80'
    ];
    const [studioGallery] = useState(DEFAULT_GALLERY);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    const [planVersionId, setPlanVersionId] = useState<VersionId>(DEFAULT_BIBLE_VERSION_ID);
    const [planLookup, setPlanLookup] = useState<Record<string, BibleBookData> | null>(null);
    const [planLookupLoading, setPlanLookupLoading] = useState(false);

    const router = useRouter();
    const { toast } = useToast();
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { redirectToSignIn } = useClerk();

    useEffect(() => {
        setMounted(true);
        const savedCompleted = localStorage.getItem(`completedDays_${planSlug}`);
        if (savedCompleted) {
            setCompletedDays(JSON.parse(savedCompleted));
        }
        const savedChapterProgress = localStorage.getItem(`completedChaptersByDay_${planSlug}`);
        if (savedChapterProgress) {
            setCompletedChaptersByDay(JSON.parse(savedChapterProgress));
        }
        const savedV = localStorage.getItem('savedVerses');
        if (savedV) {
            setSavedVerses(JSON.parse(savedV));
        }
        const highlights = localStorage.getItem('highlightedVerses');
        if (highlights) {
            setHighlightedVerses(JSON.parse(highlights));
        }
        const savedNotes = localStorage.getItem('userNotes');
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
        const savedSize = localStorage.getItem('bibleFontSize');
        if (savedSize) setFontSize(Number(savedSize));
        const savedLH = localStorage.getItem('bibleLineHeight');
        if (savedLH) setLineHeight(savedLH as any);
        const savedTheme = localStorage.getItem('bibleTheme');
        if (savedTheme) setTheme(savedTheme as any);
        const savedPlanVersion = localStorage.getItem(READING_PLAN_VERSION_STORAGE_KEY);
        if (savedPlanVersion && isValidReadingPlanVersionId(savedPlanVersion)) {
            setPlanVersionId(savedPlanVersion);
        }
    }, [planSlug]);

    useEffect(() => {
        let cancelled = false;
        setPlanLookupLoading(true);
        loadFullBibleLookup(planVersionId)
            .then((lookup) => {
                if (!cancelled) {
                    setPlanLookup(lookup);
                    setPlanLookupLoading(false);
                }
            })
            .catch((err) => {
                console.error('No se pudo cargar la Biblia para el plan:', err);
                if (!cancelled) {
                    setPlanLookup(null);
                    setPlanLookupLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [planVersionId]);

    const toggleDayCompletion = (day: number) => {
        const updated = completedDays.includes(day)
            ? completedDays.filter((d) => d !== day)
            : [...completedDays, day];
        setCompletedDays(updated);
        localStorage.setItem(`completedDays_${planSlug}`, JSON.stringify(updated));

        // Si se marca manualmente completo, llenamos todos los capítulos/partes del día.
        const dayData = planData.find(d => d.day === day);
        if (!dayData) return;
        const dayItems = parseReadingChapters(dayData.reading).map(item => item.id);
        if (dayItems.length === 0) return;
        setCompletedChaptersByDay(prev => {
            const next = {
                ...prev,
                [day]: updated.includes(day) ? dayItems : [],
            };
            localStorage.setItem(`completedChaptersByDay_${planSlug}`, JSON.stringify(next));
            return next;
        });
    };

    const getCompletedChapterIdsForDay = (day: number) => completedChaptersByDay[day] ?? [];

    const getDayProgress = (day: number, reading: string) => {
        const parts = parseReadingChapters(reading);
        if (parts.length === 0) {
            return { total: 0, completed: 0, percent: completedDays.includes(day) ? 100 : 0 };
        }
        const completedSet = new Set(getCompletedChapterIdsForDay(day));
        const completed = parts.filter(p => completedSet.has(p.id)).length;
        const percent = Math.round((completed / parts.length) * 100);
        return { total: parts.length, completed, percent };
    };

    const toggleChapterCompletion = (day: number, chapterId: string, reading: string) => {
        const dayItems = parseReadingChapters(reading).map(item => item.id);
        setCompletedChaptersByDay(prev => {
            const current = new Set(prev[day] ?? []);
            if (current.has(chapterId)) {
                current.delete(chapterId);
            } else {
                current.add(chapterId);
            }
            const nextDayValues = Array.from(current);
            const nextByDay = { ...prev, [day]: nextDayValues };
            localStorage.setItem(`completedChaptersByDay_${planSlug}`, JSON.stringify(nextByDay));

            const completedAll = dayItems.length > 0 && dayItems.every(id => current.has(id));
            setCompletedDays(prevDays => {
                const already = prevDays.includes(day);
                let nextDays = prevDays;
                if (completedAll && !already) {
                    nextDays = [...prevDays, day];
                } else if (!completedAll && already) {
                    nextDays = prevDays.filter(d => d !== day);
                }
                if (nextDays !== prevDays) {
                    localStorage.setItem(`completedDays_${planSlug}`, JSON.stringify(nextDays));
                }
                return nextDays;
            });

            return nextByDay;
        });
    };

    const handleHighlightSubmit = (reference: string, color: string): boolean => {
        if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) return false;
        const newHighlights = { ...highlightedVerses, [reference]: color };
        setHighlightedVerses(newHighlights);
        localStorage.setItem('highlightedVerses', JSON.stringify(newHighlights));
        setSelectedHighlightColor(color);
        return true;
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
        e.target.value = '';
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

    const handleSaveCustomNote = (refStr: string) => {
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
                date: new Date().toISOString()
            } : n);
            setNotes(updatedNotes);
            localStorage.setItem('userNotes', JSON.stringify(updatedNotes));
            toast({ title: "Reflexión actualizada correctamente 📓" });
        } else {
            const newNote: CustomNote = {
                id: Date.now().toString(),
                title: noteTitle.trim(),
                text: noteContent.trim(),
                reference: refStr,
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
        const trimmedText = tagInput.trim().replace(/^#/, '');
        if (trimmedText && !noteTags.includes(trimmedText)) {
            setNoteTags([...noteTags, trimmedText]);
        }
        setTagInput('');
        setIsAddingTag(false);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setNoteTags(noteTags.filter(t => t !== tagToRemove));
    };

    const handleDownloadPreview = async () => {
        const node = document.getElementById(`preview-${studioTheme.orientation}`);
        if (!node) {
            toast({ title: "Error", description: "No se encontró el contenedor visual.", variant: "destructive" });
            return;
        }
        toast({ title: "Generando imagen..." });
        const disabledSheets: (HTMLStyleElement | HTMLLinkElement)[] = [];
        const styleSheets = Array.from(document.styleSheets);
        styleSheets.forEach(sheet => {
            try {
                const rules = sheet.cssRules;
            } catch (e) {
                if (sheet.ownerNode instanceof HTMLStyleElement || sheet.ownerNode instanceof HTMLLinkElement) {
                    sheet.ownerNode.disabled = true;
                    disabledSheets.push(sheet.ownerNode);
                }
            }
        });
        try {
            const dataUrl = await toPng(node, {
                quality: 1,
                pixelRatio: 3,
                cacheBust: true,
                fontEmbedCSS: '',
            });
            const link = document.createElement('a');
            link.download = `ici-nayarit-${studioTheme.orientation}.png`;
            link.href = dataUrl;
            link.click();
            toast({ title: "¡Imagen descargada exitosamente!" });
        } catch (err) {
            console.error("Error generating image:", err);
            toast({ title: "Error al descargar la imagen", description: "Ocurrió un error de seguridad en el navegador.", variant: "destructive" });
        } finally {
            disabledSheets.forEach(node => {
                node.disabled = false;
            });
        }
    };

    const handleVerseClick = (verseNumber: number, book: string, chapter: number) => {
        const newSelectedVerse = verseNumber === selectedVerse ? null : verseNumber;
        setSelectedVerse(newSelectedVerse);
        setShowColorPicker(false);

        if (newSelectedVerse) {
            const reference = `${book} ${chapter}:${newSelectedVerse}`;
            setSelectedHighlightColor(highlightedVerses[reference] || 'blue');
        } else {
            setIsNoteOpen(false);
        }
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

    const getThemeStyles = () => {
        switch (theme) {
            case 'dark': return { bg: 'bg-[#0B1120]', card: 'bg-[#151D2C] border-gray-800 shadow-xl', text: 'text-gray-300', title: 'text-gray-100', subtitle: 'text-gray-400', verseHighlight: 'bg-blue-900/30 text-blue-400', buttonHover: 'hover:bg-gray-800 hover:text-gray-200' };
            case 'sepia': return { bg: 'bg-[#F4ECE3]', card: 'bg-[#FDF6E3] border-[#EADAB8] shadow-md', text: 'text-[#5C4D3C]', title: 'text-[#3B2C1C]', subtitle: 'text-[#8A7967]', verseHighlight: 'bg-[#EADAB8]/50 text-[#8B5A2B]', buttonHover: 'hover:bg-[#F4ECE3] hover:text-[#3B2C1C]' };
            default: return { bg: 'bg-[#F8F9FA]', card: 'bg-white border-gray-100/50 shadow-lg', text: 'text-[#4B5563]', title: 'text-[#111827]', subtitle: 'text-[#9CA3AF]', verseHighlight: 'bg-[#EEF4FF] text-[#3B82F6]', buttonHover: 'hover:bg-gray-50 hover:text-gray-700' };
        }
    };
    const themeStyles = getThemeStyles();

    const planVersionLabel =
        READING_PLAN_VERSIONS.find((v) => v.id === planVersionId)?.label ?? DEFAULT_BIBLE_VERSION_LABEL;

    const getLineHeightClass = () => {
        switch (lineHeight) {
            case 'tight': return 'leading-[1.5]';
            case 'loose': return 'leading-[2.2]';
            default: return 'leading-[1.8]';
        }
    };

    const progressPercentage = planData.length > 0 ? (completedDays.length / planData.length) * 100 : 0;

    const handleSaveVerse = (verse: PassageVerse) => {
        const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
        const alreadyIn = savedVerses.some(v => v.reference === reference);
        if (
            !ensureClerkSignedInForFavoriteAdd(
                authLoaded,
                isSignedIn === true,
                redirectToSignIn,
                alreadyIn
            )
        ) {
            return;
        }
        const newVerse: SavedVerse = {
            text: verse.text,
            reference,
            source: 'plan',
            planSlug,
            planTitle: title,
        };

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

    const handleShareVerse = async (verse: PassageVerse) => {
        const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
        const textToShare = `"${verse.text}" - ${reference}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Versículo de la Biblia',
                    text: textToShare,
                });
            } catch (error: any) {
                if (error.message !== 'Share canceled') {
                    console.error('Error al compartir:', error);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(textToShare);
                toast({
                    title: "Enlace Copiado",
                    description: "El versículo ha sido copiado al portapapeles.",
                });
            } catch (error) {
                console.error('Error al copiar:', error);
            }
        }
    };

    if (!mounted) {
        return (
            <div className="container mx-auto px-4 py-12 md:px-6">
                <div className="max-w-4xl mx-auto animate-pulse">
                    <div className="h-10 bg-gray-100 rounded-xl w-32 mb-12"></div>
                    <div className="text-center mb-12 space-y-4">
                        <div className="h-12 bg-gray-100 rounded-2xl w-3/4 mx-auto"></div>
                        <div className="h-6 bg-gray-50 rounded-xl w-1/2 mx-auto"></div>
                    </div>
                    <div className="h-24 bg-gray-50 rounded-2xl mb-12"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-50 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (selectedDay) {
        const dayData = planData.find(d => d.day === selectedDay);
        if (!dayData) return null;

        const verses =
            planLookup && !planLookupLoading ? handleReadPassage(dayData.reading, planLookup) : [];
        const dayChapterItems = parseReadingChapters(dayData.reading);
        const chapterLabelByKey = new Map(
            dayChapterItems.map((item) => [`${item.book.toLowerCase()}-${item.chapter}`, item.label.toUpperCase()])
        );
        const completedChapterIds = new Set(getCompletedChapterIdsForDay(selectedDay));
        const dayCompletedCount = dayChapterItems.filter(item => completedChapterIds.has(item.id)).length;
        const dayPercent = dayChapterItems.length > 0 ? Math.round((dayCompletedCount / dayChapterItems.length) * 100) : 0;

        return (
            <div className={`min-h-screen transition-colors duration-300 ${themeStyles.bg}`}>
                <div className="container mx-auto px-4 py-12 md:px-6">
                    <div className={`mx-auto transition-all duration-700 ease-in-out flex flex-col xl:flex-row gap-8 ${isNoteOpen && selectedVerse ? 'max-w-[1400px]' : 'max-w-4xl'}`}>

                        {/* Main Passage Column */}
                        <div className={`transition-all duration-700 w-full ${isNoteOpen && selectedVerse ? 'xl:w-1/2' : 'max-w-4xl mx-auto'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <Button onClick={() => { setSelectedDay(null); setSelectedVerse(null); setIsNoteOpen(false); }} variant="outline" className={`rounded-xl ${themeStyles.buttonHover}`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al plan
                                </Button>

                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <Select
                                        value={planVersionId}
                                        onValueChange={(v) => {
                                            const id = v as VersionId;
                                            setPlanVersionId(id);
                                            localStorage.setItem(READING_PLAN_VERSION_STORAGE_KEY, id);
                                        }}
                                    >
                                        <SelectTrigger
                                            className={`h-10 w-[min(100%,220px)] rounded-xl border text-sm font-semibold ${theme === 'dark' ? 'border-gray-700 bg-[#151D2C] text-gray-200' : 'border-gray-200 bg-white text-gray-800'}`}
                                        >
                                            <SelectValue placeholder="Versión" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[min(70vh,320px)]">
                                            {READING_PLAN_VERSIONS.map((v) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon" className={`rounded-xl ${themeStyles.buttonHover}`}>
                                                <Type className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className={`w-80 p-6 rounded-2xl shadow-2xl border-0 ${themeStyles.card}`} sideOffset={12}>
                                            <div className="space-y-8">
                                                <div className="space-y-4">
                                                    <label className={`text-[10px] font-black uppercase tracking-widest ${themeStyles.subtitle}`}>Tamaño del texto</label>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-bold text-gray-400">A</span>
                                                        <input type="range" min="80" max="200" step="10" value={fontSize} onChange={(e) => { setFontSize(Number(e.target.value)); localStorage.setItem('bibleFontSize', e.target.value); }} className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                                        <span className="text-xl font-bold text-gray-400">A</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className={`text-[10px] font-black uppercase tracking-widest ${themeStyles.subtitle}`}>Espaciado</label>
                                                    <div className="grid grid-cols-3 gap-2 p-1 bg-gray-50/50 rounded-xl">
                                                        {(['tight', 'normal', 'loose'] as const).map((lh) => (
                                                            <button key={lh} onClick={() => { setLineHeight(lh); localStorage.setItem('bibleLineHeight', lh); }} className={`py-2 text-[11px] font-bold rounded-lg transition-all ${lineHeight === lh ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                                                {lh === 'tight' ? 'Sli' : lh === 'normal' ? 'Std' : 'Esp'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className={`text-[10px] font-black uppercase tracking-widest ${themeStyles.subtitle}`}>Tema de lectura</label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <button onClick={() => { setTheme('light'); localStorage.setItem('bibleTheme', 'light'); }} className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-blue-500' : 'border-gray-100'}`}>
                                                            <div className="w-full h-8 bg-white border border-gray-100 rounded-md mb-2"></div>
                                                            <span className="text-[11px] font-bold text-gray-700">Claro</span>
                                                        </button>
                                                        <button onClick={() => { setTheme('sepia'); localStorage.setItem('bibleTheme', 'sepia'); }} className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${theme === 'sepia' ? 'border-[#8B5A2B]' : 'border-gray-100'}`}>
                                                            <div className="w-full h-8 bg-[#F4ECE3] rounded-md mb-2"></div>
                                                            <span className="text-[11px] font-bold text-[#8B5A2B]">Sepia</span>
                                                        </button>
                                                        <button onClick={() => { setTheme('dark'); localStorage.setItem('bibleTheme', 'dark'); }} className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-blue-500' : 'border-gray-100'}`}>
                                                            <div className="w-full h-8 bg-[#0B1120] rounded-md mb-2"></div>
                                                            <span className="text-[11px] font-bold text-gray-700">Oscuro</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-xl font-bold text-[#B88A44] mb-2">{dayData.title || `Día ${dayData.day}`}</h2>
                                <h1 className={`text-4xl font-bold font-display mb-4 ${themeStyles.title}`}>{dayData.reading}</h1>
                                <p className={`text-lg leading-relaxed ${themeStyles.subtitle}`}>{dayData.summary}</p>
                            </div>

                            {dayChapterItems.length > 0 && (
                                <Card className={`mb-6 border-0 rounded-3xl transition-all duration-300 ${themeStyles.card}`}>
                                    <CardContent className="p-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className={`text-sm font-bold uppercase tracking-wider ${themeStyles.subtitle}`}>Avance del día</h3>
                                            <span className="text-sm font-bold text-[#B88A44]">{dayCompletedCount}/{dayChapterItems.length} ({dayPercent}%)</span>
                                        </div>
                                        <Progress value={dayPercent} className="h-2.5 bg-gray-100" />
                                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {dayChapterItems.map(item => {
                                                const done = completedChapterIds.has(item.id);
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => toggleChapterCompletion(selectedDay, item.id, dayData.reading)}
                                                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                                                            done ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${done ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                        <span>{item.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className={`border-0 rounded-3xl overflow-visible transition-all duration-300 ${themeStyles.card}`}>
                                <CardContent className="p-8">
                                    <div className={`space-y-4 text-left font-sans transition-all duration-500 ${themeStyles.text} ${getLineHeightClass()}`} style={{ fontSize: `${(fontSize / 100) * 16}px` }}>
                                        {verses.length > 0 ? verses.map((v, index) => {
                                            const prev = index > 0 ? verses[index - 1] : null;
                                            const showSectionTitle =
                                                Boolean(v.sectionTitle?.trim()) &&
                                                (!prev || prev.sectionTitle !== v.sectionTitle);
                                            const chapterKey = `${v.book.toLowerCase()}-${v.chapter}`;
                                            const showPassageTitle =
                                                !prev || prev.book !== v.book || prev.chapter !== v.chapter;
                                            const passageTitle =
                                                chapterLabelByKey.get(chapterKey) ??
                                                `${formatBookName(v.book)} ${v.chapter}`.toUpperCase();
                                            const reference = `${v.book} ${v.chapter}:${v.verse}`;
                                            const isSelected = selectedVerse === v.verse;
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
                                                <div key={`${v.book}-${v.chapter}-${v.verse}-${index}`} className={`relative rounded-xl transition-all duration-200 ${isSelected ? 'z-40' : ''} ${containerClasses}`}>
                                                    {showPassageTitle && (
                                                        <p className={`text-center text-xs font-extrabold tracking-[0.18em] uppercase mb-3 ${index === 0 ? 'mt-0' : 'mt-7'} ${themeStyles.subtitle}`}>
                                                            {passageTitle}
                                                        </p>
                                                    )}
                                                    {showSectionTitle && (
                                                        <p className={`text-sm font-bold tracking-wide mb-2 whitespace-pre-line leading-snug ${showPassageTitle ? 'mt-0' : index === 0 ? 'mt-0' : 'mt-5'} ${themeStyles.subtitle}`}>
                                                            {v.sectionTitle}
                                                        </p>
                                                    )}
                                                    {isSelected && (
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
                                                                                if (!handleHighlightSubmit(reference, c.id)) return;
                                                                                setShowColorPicker(false);
                                                                                toast({ title: 'Resaltado guardado' });
                                                                            }}
                                                                            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${c.color} ${selectedHighlightColor === c.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="relative bg-[#1F2937] shadow-xl rounded-[10px] min-w-0 max-w-[calc(100vw-2rem)]">
                                                                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#1F2937] rotate-45 rounded-sm pointer-events-none z-0" aria-hidden />
                                                                <div className="flex items-center space-x-0.5 relative z-40 px-1.5 py-1 overflow-x-auto">
                                                                    <button type="button" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!showColorPicker && !ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) return;
                                                                        setShowColorPicker(!showColorPicker);
                                                                    }} className={`flex shrink-0 items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md text-white text-[11px] font-semibold tracking-wide transition-colors ${showColorPicker ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1F2937]' : ''}`}>
                                                                        <span className="text-white text-[9px] -mt-0.5" aria-hidden>▲</span> Subrayar
                                                                    </button>
                                                                    <button type="button" onClick={(e) => { e.stopPropagation(); setIsNoteOpen(true); }} className="flex shrink-0 items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md text-white text-[11px] font-semibold tracking-wide transition-colors">
                                                                        <StickyNote className="h-3.5 w-3.5" /> Notas
                                                                    </button>
                                                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleSaveVerse(v); }} className="p-2 hover:bg-white/10 rounded-md transition-colors shrink-0">
                                                                        {savedVerses.some(sv => sv.reference === reference) ? <Bookmark className="h-3.5 w-3.5 fill-white text-white" /> : <Bookmark className="h-3.5 w-3.5 text-gray-300" />}
                                                                    </button>
                                                                    <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />
                                                                    <button type="button" onClick={async (e) => { e.stopPropagation(); await navigator.clipboard.writeText(`"${v.text}" (${reference})`); toast({ title: "Copiado" }); }} className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors shrink-0">
                                                                        <Copy className="h-4 w-4" />
                                                                    </button>
                                                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleShareVerse(v); }} className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors shrink-0">
                                                                        <Share2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className={`transition-colors duration-300 ${(isSelected || isHighlighted) ? 'font-medium' : ''}`} onClick={() => handleVerseClick(v.verse, v.book, v.chapter)}>
                                                        <sup className={`font-bold mr-2.5 text-[65%] ${(isSelected || isHighlighted) ? '' : themeStyles.subtitle}`}>{v.verse}</sup>
                                                        {v.text}
                                                    </p>
                                                </div>
                                            );
                                        }) : planLookupLoading || !planLookup ? (
                                            <p className="text-center text-gray-500 italic py-8">Cargando pasaje...</p>
                                        ) : (
                                            <p className="text-center text-gray-500 italic py-8">No se encontró el texto para esta lectura.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center mt-12 pb-12">
                                <Button
                                    size="lg"
                                    onClick={() => { toggleDayCompletion(selectedDay); setSelectedDay(null); setSelectedVerse(null); setIsNoteOpen(false); }}
                                    className={`rounded-2xl px-12 h-14 font-bold text-lg shadow-xl shadow-[#B88A44]/20 ${completedDays.includes(selectedDay) ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-gradient-to-r from-[#B88A44] to-[#A67B3D] hover:scale-105 transition-transform text-white"}`}
                                >
                                    <CheckCircle2 className="mr-2 h-6 w-6" />
                                    {completedDays.includes(selectedDay) ? 'Marcar como no leído' : 'Marcar Día como Completo'}
                                </Button>
                            </div>
                        </div>

                        {/* Note Editor Side Panel */}
                        {isNoteOpen && selectedVerse && (
                            <div className="w-full xl:w-1/2 flex flex-col md:flex-row gap-6 animate-in slide-in-from-right-8 duration-500 fade-in h-fit mt-8 xl:mt-0 relative top-0 xl:top-[80px] pb-32">
                                {/* Column 1: Context & Resources */}
                                <div className="w-full md:w-5/12 flex flex-col gap-6">
                                    {/* Contexto Bíblico */}
                                    <Card className={`border-0 rounded-2xl shadow-sm ${themeStyles.card}`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-5">
                                                <div className={`flex items-center gap-2 font-bold ${themeStyles.title}`}>
                                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                                    <span>Contexto Bíblico</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase truncate max-w-[120px]">
                                                        {dayData.reading} ({selectedVerse})
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-medium mt-1 truncate max-w-[140px] text-right">
                                                        {planVersionLabel}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative mb-6">
                                                <span className="absolute -left-2 -top-2 text-4xl text-gray-200">"</span>
                                                <p className={`text-lg font-serif italic relative z-10 pl-4 ${themeStyles.title}`}>
                                                    {verses.find(v => v.verse === selectedVerse)?.text}
                                                </p>
                                                <span className="absolute right-0 -bottom-6 text-4xl text-gray-200">"</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Social Network Generator */}
                                    <Card className={`border-0 rounded-2xl shadow-sm ${themeStyles.card}`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Share2 className="w-4 h-4 text-blue-500" />
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recursos para Redes Sociales</h5>
                                            </div>

                                            <div className="flex bg-[#F8F9FA] p-1.5 rounded-xl mb-8">
                                                <button
                                                    onClick={() => setSocialFormat('vertical')}
                                                    className={`flex-1 flex justify-center py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all duration-200 ${socialFormat === 'vertical' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Vertical
                                                </button>
                                                <button
                                                    onClick={() => setSocialFormat('horizontal')}
                                                    className={`flex-1 flex justify-center py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all duration-200 ${socialFormat === 'horizontal' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Horizontal
                                                </button>
                                            </div>

                                            <div
                                                className={`relative rounded-xl flex flex-col items-center justify-center p-6 text-center mx-auto mb-6 shadow-md transition-all duration-300 overflow-hidden ${socialFormat === 'vertical' ? 'aspect-[9/16] w-[85%]' : 'aspect-video w-full'}`}
                                                style={{
                                                    backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor,
                                                    backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-4 relative z-10 opacity-70 transition-colors" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>
                                                    {dayData.reading} ({selectedVerse})
                                                </p>
                                                <p className="font-serif italic text-[13px] leading-snug relative z-10 transition-colors px-4" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>
                                                    “{verses.find(v => v.verse === selectedVerse)?.text}”
                                                </p>
                                                <p className="text-[8px] font-bold uppercase tracking-[0.1em] mt-4 relative z-10 opacity-60 transition-colors" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>
                                                    www.iciarnayarit.com
                                                </p>

                                                <button
                                                    onClick={() => setIsStudioOpen(true)}
                                                    className="absolute bottom-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors z-10"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex gap-2 mb-4">
                                                <button onClick={() => setSocialFormat('vertical')} className={`flex-1 py-2 border rounded-xl flex items-center justify-center transition-all ${socialFormat === 'vertical' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`} title="TikTok">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                                                </button>
                                                <button onClick={() => setSocialFormat('vertical')} className={`flex-1 py-2 border rounded-xl flex items-center justify-center transition-all ${socialFormat === 'vertical' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`} title="Instagram">
                                                    <Instagram className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setSocialFormat('horizontal')} className={`flex-1 py-2 border rounded-xl flex items-center justify-center transition-all ${socialFormat === 'horizontal' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`} title="Facebook">
                                                    <Facebook className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setSocialFormat('horizontal')} className={`flex-1 py-2 border rounded-xl flex items-center justify-center transition-all ${socialFormat === 'horizontal' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`} title="YouTube">
                                                    <Youtube className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button onClick={() => setIsStudioOpen(true)} className="w-full bg-[#EEF2FF] hover:bg-[#E0E7FF] text-blue-600 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                                <Palette className="w-3.5 h-3.5" />
                                                Personalizar
                                            </button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Column 2: Note Editor */}
                                <div className="w-full md:w-7/12 flex-1 flex flex-col">
                                    <Card className={`border-0 rounded-2xl shadow-sm flex-1 flex flex-col ${themeStyles.card}`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className={`text-xl font-bold ${themeStyles.title}`}>{editingNoteId ? 'Editar Reflexión' : 'Añadir Nota'}</h3>
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-medium">
                                                        {mounted && `Sesión activa: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2 block">Título de la reflexión</label>
                                                <input
                                                    type="text"
                                                    value={noteTitle}
                                                    onChange={(e) => setNoteTitle(e.target.value)}
                                                    placeholder="Ej: El poder de la palabra creadora"
                                                    className="w-full bg-transparent border-0 border-b border-gray-200 text-[#111827] text-lg font-bold placeholder-gray-300 focus:ring-0 focus:border-blue-500 px-0 pb-2 transition-colors focus:outline-none"
                                                />
                                            </div>

                                            {/* Rich Text Toolbar */}
                                            <div className="flex items-center gap-4 bg-[#F8F9FA] rounded-xl p-3 mb-6">
                                                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="text-gray-600 hover:text-black transition-colors" title="Negrita"><Bold className="w-[18px] h-[18px]" /></button>
                                                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="text-gray-600 hover:text-black transition-colors" title="Cursiva"><Italic className="w-[18px] h-[18px]" /></button>
                                                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="text-gray-600 hover:text-black transition-colors" title="Lista"><List className="w-[18px] h-[18px]" /></button>

                                                <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }}
                                                            onClick={() => setIsLinkPopoverOpen(true)}
                                                            className="text-gray-600 hover:text-black transition-colors"
                                                            title="Enlace"
                                                        >
                                                            <LinkIcon className="w-[18px] h-[18px]" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80 p-4 rounded-xl shadow-xl border-gray-100" sideOffset={12}>
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Añadir Enlace</label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="url"
                                                                    autoFocus
                                                                    value={linkInput}
                                                                    onChange={(e) => setLinkInput(e.target.value)}
                                                                    placeholder="https://..."
                                                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            confirmLink();
                                                                        } else if (e.key === 'Escape') {
                                                                            setIsLinkPopoverOpen(false);
                                                                        }
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={confirmLink}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
                                                                >
                                                                    Insertar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>

                                                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('formatBlock', 'blockquote'); }} className="text-gray-600 hover:text-black transition-colors" title="Cita"><Quote className="w-[18px] h-[18px]" /></button>
                                                <div className="w-px h-5 bg-gray-300 mx-1"></div>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                />
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-gray-600 hover:text-black transition-colors"
                                                    title="Añadir Imagen"
                                                >
                                                    <ImageIcon className="w-[18px] h-[18px]" />
                                                </button>
                                            </div>

                                            <style>{`
                                            .rich-text-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
                                            .rich-text-editor blockquote { border-left: 4px solid #E5E7EB; padding-left: 1rem; color: #6B7280; font-style: italic; }
                                            .rich-text-editor img { max-width: 100%; border-radius: 0.5rem; margin-top: 1rem; }
                                            .rich-text-editor a { color: #3B82F6; text-decoration: underline; }
                                        `}</style>
                                            <div className="relative w-full flex-1 min-h-[350px]">
                                                {(!noteContent || noteContent === '<br>') && (
                                                    <div className="absolute top-0 left-0 text-gray-300 pointer-events-none text-base">Escribe lo que Dios puso en tu corazón...</div>
                                                )}
                                                <div
                                                    ref={contentEditableRef}
                                                    contentEditable
                                                    onInput={(e) => setNoteContent(e.currentTarget.innerHTML)}
                                                    className="w-full h-full bg-transparent border-0 p-0 text-gray-600 text-base focus:outline-none overflow-y-auto rich-text-editor"
                                                />
                                            </div>

                                            <div className="mt-6 border-t border-gray-100 pt-6">
                                                {/* Tags */}
                                                <div className="flex flex-wrap items-center gap-2 mb-8">
                                                    {noteTags.map((tag, i) => (
                                                        <span key={i} className="bg-[#EEF2FF] text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors group">
                                                            #{tag}
                                                            <button onClick={() => handleRemoveTag(tag)} className="text-blue-400 opacity-50 hover:opacity-100 hover:text-black transition-all">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}

                                                    {isAddingTag ? (
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            value={tagInput}
                                                            onChange={e => setTagInput(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleAddTag();
                                                                } else if (e.key === 'Escape') {
                                                                    setIsAddingTag(false);
                                                                }
                                                            }}
                                                            onBlur={handleAddTag}
                                                            className="border border-blue-500 text-blue-600 outline-none text-xs font-bold px-3 py-1.5 rounded-full w-[120px] bg-[#EEF2FF] transition-colors"
                                                            placeholder="tag..."
                                                        />
                                                    ) : (
                                                        <button onClick={() => setIsAddingTag(true)} className="border border-dashed border-gray-300 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:border-gray-500 hover:text-gray-600 transition-colors">
                                                            + Añadir Tag
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-end gap-6">
                                                    <button onClick={() => { handleClearNoteFields(); setIsNoteOpen(false); }} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
                                                    <button onClick={() => handleSaveCustomNote(`${dayData.reading} (${selectedVerse})`)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors shadow-blue-500/20">
                                                        <Save className="w-4 h-4" /> Guardar Nota
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Social Asset Preview Studio Modal */}
                {isStudioOpen && selectedVerse !== null && (
                    <div className="fixed inset-0 z-[100] flex p-0 md:p-4 lg:p-8" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
                        <div className="w-full h-full bg-white rounded-none md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border-0 md:border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between px-4 lg:px-8 py-4 border-b border-gray-100 bg-white z-10 shrink-0">
                                <div>
                                    <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        STUDIO / {dayData.reading} ({selectedVerse})
                                    </p>
                                    <h2 className="text-lg lg:text-[22px] font-black text-gray-900 tracking-tight leading-none">Social Asset Preview</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsStudioOpen(false)} className="p-2 lg:px-5 lg:py-2.5 rounded-xl text-xs lg:text-[13px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                        Cancelar
                                    </button>
                                    <button onClick={handleDownloadPreview} className="px-4 lg:px-6 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl text-xs lg:text-[13px] font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-colors">
                                        <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                        Descargar
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F8FAFC]">
                                <div className="flex-1 overflow-y-auto p-4 lg:p-12">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                                        <div className="flex flex-col gap-4">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">VERTICAL (9:16) &bull; TIKTOK &bull; STORY</p>
                                            <div id="preview-vertical" className="w-full max-w-[340px] mx-auto xl:max-w-none aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-10 text-center transition-all duration-300"
                                                style={{
                                                    backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor,
                                                    backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none',
                                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                                    color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF'
                                                }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10 mb-8 opacity-80">{dayData.reading} ({selectedVerse})</p>
                                                <p className="font-serif relative z-10 w-full leading-tight px-4" style={{ fontSize: `${studioTheme.fontSize * 1.4}px`, fontWeight: studioTheme.fontWeight, textAlign: studioTheme.alignment }}>
                                                    “{verses.find(v => v.verse === selectedVerse)?.text}”
                                                </p>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] relative z-20 mt-8 opacity-70 w-full text-center">www.iciarnayarit.com</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">HORIZONTAL (16:9) &bull; YOUTUBE &bull; POST</p>
                                            <div id="preview-horizontal" className="w-full aspect-video rounded-3xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-12 text-center transition-all duration-300"
                                                style={{
                                                    backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor,
                                                    backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none',
                                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                                    color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF'
                                                }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10 mb-6 opacity-80">{dayData.reading} ({selectedVerse})</p>
                                                <p className="font-serif relative z-10 w-full leading-tight px-4" style={{ fontSize: `${studioTheme.fontSize * 1.1}px`, fontWeight: studioTheme.fontWeight, textAlign: studioTheme.alignment }}>
                                                    “{verses.find(v => v.verse === selectedVerse)?.text}”
                                                </p>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] relative z-20 mt-6 opacity-70 w-full text-center">www.iciarnayarit.com</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-96 border-l border-gray-100 bg-white overflow-y-auto p-6 lg:p-8">
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Formato</label>
                                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                                {(['vertical', 'horizontal'] as const).map(mode => (
                                                    <button key={mode} onClick={() => setStudioTheme(prev => ({ ...prev, orientation: mode }))}
                                                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${studioTheme.orientation === mode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Galería de Fondos</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {studioGallery.map((img, i) => (
                                                    <button key={i} onClick={() => setStudioTheme(prev => ({ ...prev, bgImage: img }))}
                                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${studioTheme.bgImage === img ? 'border-blue-500 scale-95' : 'border-transparent hover:scale-105'}`}>
                                                        <img src={img} className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                                    <Plus className="w-4 h-4 text-gray-400" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleSocialBgUpload} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Colores</label>
                                            <div className="flex flex-wrap gap-2.5">
                                                {['#FFFFFF', '#000000', '#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706', '#FEF08A'].map(color => (
                                                    <button key={color} onClick={() => setStudioTheme(prev => ({ ...prev, bgColor: color, bgImage: null }))}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all ${studioTheme.bgColor === color && !studioTheme.bgImage ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-110'}`}
                                                        style={{ backgroundColor: color }} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tamaño Fuente</label>
                                                <span className="text-xs font-bold text-gray-600">{studioTheme.fontSize}px</span>
                                            </div>
                                            <input type="range" min="16" max="48" value={studioTheme.fontSize}
                                                onChange={(e) => setStudioTheme(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Alineación</label>
                                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                                {(['left', 'center', 'right'] as const).map(align => (
                                                    <button key={align} onClick={() => setStudioTheme(prev => ({ ...prev, alignment: align }))}
                                                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${studioTheme.alignment === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>
                                                        {align === 'left' ? 'Izq' : align === 'center' ? 'Ctr' : 'Der'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }


    // Group days by sections/phases if available
    const sections: { title: string; days: ReadingDay[] }[] = [];
    let currentSectionTitle = "";

    planData.forEach(day => {
        if (day.section && day.section !== currentSectionTitle) {
            currentSectionTitle = day.section;
            sections.push({ title: currentSectionTitle, days: [day] });
        } else if (sections.length > 0) {
            sections[sections.length - 1].days.push(day);
        } else {
            // No section yet
            sections.push({ title: "Días", days: [day] });
            currentSectionTitle = "Días";
        }
    });

    return (
        <div className="container mx-auto px-4 py-12 md:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Button onClick={() => router.back()} variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
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

                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold font-display text-[#B88A44] mb-4 italic">
                        {title}
                    </h1>
                    <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border mb-12 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tu Progreso</span>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
                            <Select
                                value={planVersionId}
                                onValueChange={(v) => {
                                    const id = v as VersionId;
                                    setPlanVersionId(id);
                                    localStorage.setItem(READING_PLAN_VERSION_STORAGE_KEY, id);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[260px] rounded-xl border-gray-200 text-sm font-semibold text-gray-800">
                                    <SelectValue placeholder="Versión de la Biblia" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[min(70vh,320px)]">
                                    {READING_PLAN_VERSIONS.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm font-bold text-[#B88A44] text-center sm:text-right shrink-0">
                                {Math.round(progressPercentage)}%
                            </span>
                        </div>
                    </div>
                    <Progress value={progressPercentage} className="h-3 bg-gray-100" />
                    <p className="text-xs text-gray-400 mt-2 text-center">{completedDays.length} de {planData.length} días completados</p>
                </div>

                <div className="space-y-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-6">
                            {section.title !== "Días" && (
                                <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-[#B88A44] pl-4">
                                    {section.title}
                                </h3>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {section.days.map((item) => (
                                    <Card
                                        key={item.day}
                                        className={`cursor-pointer transition-all hover:shadow-md border-none ring-1 ring-gray-100 ${completedDays.includes(item.day) ? 'bg-amber-50/50 ring-amber-200' : 'bg-white'}`}
                                        onClick={() => setSelectedDay(item.day)}
                                    >
                                        <div className="p-5 flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${completedDays.includes(item.day) ? 'bg-[#B88A44] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                {completedDays.includes(item.day) ? <CheckCircle2 className="h-6 w-6" /> : item.day}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-[#B88A44] transition-colors">{item.title || `Día ${item.day}`}</h4>
                                                <p className="text-sm text-[#B88A44] font-medium">{item.reading}</p>
                                                {(() => {
                                                    const p = getDayProgress(item.day, item.reading);
                                                    if (p.total === 0) return null;
                                                    return (
                                                        <p className="mt-1 text-xs font-semibold text-gray-500">
                                                            Avance del día: {p.completed}/{p.total} ({p.percent}%)
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
