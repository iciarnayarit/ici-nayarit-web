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
import { useEffect, useState, useRef } from 'react';

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

export default function Bible() {
    const [selectedBook, setSelectedBook] = useState('Génesis');
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [verses, setVerses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
    const [highlightedVerses, setHighlightedVerses] = useState<Record<string, string>>({});
    const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
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
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [socialFormat, setSocialFormat] = useState<'vertical' | 'horizontal'>('vertical');

    const [isStudioOpen, setIsStudioOpen] = useState(false);
    const [studioTheme, setStudioTheme] = useState({
        bgColor: '#2563EB',
        bgImage: null as string | null,
        fontSize: 24,
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

    const [studioGallery, setStudioGallery] = useState(DEFAULT_GALLERY);

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedHighlightColor, setSelectedHighlightColor] = useState('blue');

    // Typography State
    const [fontSize, setFontSize] = useState(100);
    const [lineHeight, setLineHeight] = useState<'tight' | 'normal' | 'loose'>('normal');
    const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');

    const [isToolbarOpen, setIsToolbarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { toast } = useToast();

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
                const bookFileName = bookFileMap[selectedBook];
                if (bookFileName) {
                    const bookModule = await import(`@/app/lib/bible_rvr/${bookFileName}.json`);
                    const chapterVerses = bookModule.chapters[selectedChapter - 1] || [];
                    setVerses(chapterVerses);
                }
            } catch (error) {
                console.error("Failed to load chapter:", error);
                setVerses([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChapter();
    }, [selectedBook, selectedChapter]);

    const handleVerseClick = (verseNumber: number) => {
        const newSelectedVerse = verseNumber === selectedVerse ? null : verseNumber;
        setSelectedVerse(newSelectedVerse);
        setIsToolbarOpen(newSelectedVerse !== null);
        setShowColorPicker(false);

        // Set active color to saved preference if highlighted, else default blue
        if (newSelectedVerse) {
            const reference = `${selectedBook} ${selectedChapter}:${newSelectedVerse}`;
            setSelectedHighlightColor(highlightedVerses[reference] || 'blue');
        } else {
            setIsNoteOpen(false); // Esconde el menú derecho al deseleccionar
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
        const node = document.getElementById(`preview-${studioTheme.orientation}`);
        if (!node) {
            toast({ title: "Error", description: "No se encontró el contenedor visual.", variant: "destructive" });
            return;
        }

        toast({ title: "Generando imagen..." });

        // FIX: Workaround for SecurityError (Failed to read 'cssRules')
        // Temporarily disable stylesheets that don't allow rule access
        const disabledSheets: (HTMLStyleElement | HTMLLinkElement)[] = [];
        const styleSheets = Array.from(document.styleSheets);

        styleSheets.forEach(sheet => {
            try {
                // Try to access rules to check for SecurityError
                const rules = sheet.cssRules;
            } catch (e) {
                // If it fails, it's cross-origin and will break html-to-image
                if (sheet.ownerNode instanceof HTMLStyleElement || sheet.ownerNode instanceof HTMLLinkElement) {
                    sheet.ownerNode.disabled = true;
                    disabledSheets.push(sheet.ownerNode);
                }
            }
        });

        try {
            // Increase pixelRatio slightly for clearer outputs, scale down any huge native fonts
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
            // Restore disabled stylesheets
            disabledSheets.forEach(node => {
                node.disabled = false;
            });
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
                reference: `${selectedBook} ${selectedChapter}:${selectedVerse}`,
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
    };

    const totalChapters = chaptersPerBook[selectedBook] || 1;

    const goToNextChapter = () => {
        if (selectedChapter < totalChapters) {
            setSelectedChapter(selectedChapter + 1);
        }
    };

    const goToPreviousChapter = () => {
        if (selectedChapter > 1) {
            setSelectedChapter(selectedChapter - 1);
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
                <div className={`mx-auto transition-all duration-700 ease-in-out flex flex-col xl:flex-row gap-8 ${isNoteOpen ? 'max-w-[1400px]' : 'max-w-4xl'}`}>

                    {/* LADO IZQUIERDO: BIBLIA */}
                    <div className={`transition-all duration-700 w-full ${isNoteOpen ? 'xl:w-1/2' : 'max-w-4xl mx-auto'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                            <div className="flex gap-4">
                                <Select value={selectedBook} onValueChange={handleBookChange}>
                                    <SelectTrigger className="w-full sm:w-[200px] bg-white border border-gray-300 text-gray-700 hover:bg-[#B88A44] hover:text-white font-bold py-3 px-4 rounded-full transition-colors focus:outline-none text-sm">
                                        <SelectValue placeholder="Seleccionar libro" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {books.map(book => (
                                            <SelectItem key={book} value={book}>{book}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedChapter.toString()} onValueChange={(val) => setSelectedChapter(Number(val))}>
                                    <SelectTrigger className="w-full sm:w-[200px] bg-white border border-gray-300 text-gray-700 hover:bg-[#B88A44] hover:text-white font-bold py-3 px-4 rounded-full transition-colors focus:outline-none text-sm">
                                        <SelectValue placeholder="Capítulo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {chapters.map(chapter => (
                                            <SelectItem key={chapter} value={chapter.toString()}>Capítulo {chapter}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Link href="/biblia/guardados">
                                <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-[#B88A44] hover:text-white font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm">Versículos Guardados</Button>
                            </Link>
                        </div>

                        <div className="relative">
                            <Button onClick={goToPreviousChapter} disabled={selectedChapter === 1} className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+8px)] bg-white border border-gray-300 font-bold p-3 rounded-full transition-colors focus:outline-none text-sm shadow-sm z-10 hidden md:block ${themeStyles.text}`}>
                                <ChevronLeft className="h-6 w-6" />
                            </Button>

                            <Card className={`border md:rounded-[40px] overflow-visible relative mt-8 transition-colors duration-500 ${themeStyles.card}`}>
                                <CardContent className="px-6 pt-12 pb-8 md:px-16 md:pt-[100px] md:pb-16 relative overflow-visible">
                                    {/* Header Area */}
                                    <div className="flex justify-between items-start mb-12">
                                        <div>
                                            <h2 className={`text-3xl md:text-[34px] font-bold font-sans tracking-tight mb-2 ${themeStyles.title}`}>{selectedBook} {selectedChapter}</h2>
                                            <p className={`text-xs md:text-[13px] font-bold ${themeStyles.subtitle}`}>La creación • Reina-Valera 1960</p>
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
                                    >
                                        {isLoading ? (
                                            <p>Cargando...</p>
                                        ) : verses.length > 0 ? (
                                            verses.map((verse, index) => {
                                                const reference = `${selectedBook} ${selectedChapter}:${index + 1}`;
                                                const isSelected = selectedVerse === index + 1;
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
                                                    <div key={index} className={`relative rounded-xl transition-all duration-200 ${containerClasses}`}>
                                                        {/* Appears Above the Line When Selected */}
                                                        {isSelected && (
                                                            <div className="absolute -top-[52px] left-1/4 -translate-x-1/2 bg-[#1F2937] shadow-xl rounded-[10px] flex items-center px-1.5 py-1 z-30 transition-all font-sans">
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
                                                                                        handleHighlightSubmit(reference, c.id);
                                                                                        setShowColorPicker(false);
                                                                                        toast({ title: 'Resaltado guardado' });
                                                                                    }}
                                                                                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${c.color} ${selectedHighlightColor === c.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
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
                                                                        onClick={(e) => { e.stopPropagation(); handleSaveVerse(verse, index + 1); }}
                                                                        className="p-2 hover:bg-white/10 rounded-md transition-colors"
                                                                    >
                                                                        {(() => {
                                                                            const ref = `${selectedBook} ${selectedChapter}:${index + 1}`;
                                                                            const isSaved = savedVerses.some(v => v.reference === ref);
                                                                            return <Bookmark className={`h-3.5 w-3.5 transition-all ${isSaved ? 'fill-white text-white' : 'fill-none text-gray-300'}`} />;
                                                                        })()}
                                                                    </button>
                                                                    <div className="w-px h-5 bg-white/10 mx-1"></div>
                                                                    <button
                                                                        onClick={async (e) => { e.stopPropagation(); await navigator.clipboard.writeText(verse); toast({ title: "Copiado" }); }}
                                                                        className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors">
                                                                        <Copy className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleShareVerse(verse, index + 1); }}
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
                                            <p>No se encontró el contenido de este capítulo.</p>
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

                    {/* LADO DERECHO: AÑADIR NOTA (Visible cuando se selecciona "Note") */}
                    {isNoteOpen && selectedVerse !== null && (
                        <div className="w-full xl:w-1/2 flex flex-col md:flex-row gap-6 animate-in slide-in-from-right-8 duration-500 fade-in h-fit mt-8 xl:mt-0 relative top-0 xl:top-[80px]">

                            {/* Columna Izquierda del Panel de Notas: Contexto y Recientes */}
                            <div className="w-full md:w-5/12 flex flex-col gap-6">
                                {/* Contexto Bíblico */}
                                <Card className={`border-0 rounded-2xl shadow-sm ${themeStyles.card}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className={`flex items-center gap-2 font-bold ${themeStyles.title}`}>
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                                <span>Contexto Bíblico</span>
                                            </div>
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full">{selectedBook.toUpperCase()} {selectedChapter}:{selectedVerse}</span>
                                        </div>
                                        <div className="relative mb-6">
                                            <span className="absolute -left-2 -top-2 text-4xl text-gray-200">"</span>
                                            <p className={`text-lg font-serif italic relative z-10 pl-4 ${themeStyles.title}`}>
                                                {verses[selectedVerse - 1]}
                                            </p>
                                            <span className="absolute right-0 -bottom-6 text-4xl text-gray-200">"</span>
                                        </div>

                                        {/* Referencia Cruzada (Comentado temporalmente por solicitud del usuario) */}
                                        {/*
                               <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 mb-6 relative z-10">
                                   <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Referencia Cruzada</h5>
                                   <p className="text-[13px] text-gray-600 leading-relaxed font-medium">Juan 1:5 - "La luz en las tinieblas resplandece, y las tinieblas no prevalecieron contra ella."</p>
                               </div>

                               <div className="flex gap-3">
                                   <button className="flex-1 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold transition-colors">Ver Capitulo</button>
                                   <button className="flex-1 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold transition-colors">Comparar</button>
                               </div>
                               */}
                                    </CardContent>
                                </Card>

                                {/* Notas Recientes */}
                                <Card className={`border-0 rounded-2xl shadow-sm ${themeStyles.card}`}>
                                    <CardContent className="p-6">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Notas Recientes</h5>

                                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[250px] pr-2">
                                            {notes.length > 0 ? (
                                                notes.slice(0, 5).map((note, index) => (
                                                    <div
                                                        key={note.id}
                                                        onClick={() => handleEditNote(note)}
                                                        className={`border-l-2 pl-3 cursor-pointer hover:bg-gray-50 transition-colors py-1 ${index === 0 ? 'border-blue-500' : 'border-gray-200'}`}
                                                    >
                                                        <h6 className={`text-[13px] font-bold ${themeStyles.title}`}>{note.title}</h6>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">{note.reference} • {getRelativeTime(note.date)}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No hay notas guardadas aún.</p>
                                            )}
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

                                        {/* Toggle Format */}
                                        <div className="flex bg-[#F8F9FA] p-1 rounded-xl mb-6">
                                            <button
                                                onClick={() => setSocialFormat('vertical')}
                                                className={`flex-1 flex justify-center py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${socialFormat === 'vertical' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                            >
                                                Vertical
                                            </button>
                                            <button
                                                onClick={() => setSocialFormat('horizontal')}
                                                className={`flex-1 flex justify-center py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${socialFormat === 'horizontal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                            >
                                                Horizontal
                                            </button>
                                        </div>

                                        {/* Preview Box */}
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
                                            <p className="font-serif italic text-2xl leading-relaxed relative z-10 transition-colors" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF' }}>
                                                “{verses[selectedVerse - 1]}”
                                            </p>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-6 relative z-10 transition-colors" style={{ color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF', opacity: 0.7 }}>
                                                {selectedBook} {selectedChapter}:{selectedVerse}
                                            </p>

                                            <button className="absolute bottom-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors z-10">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Social Buttons */}
                                        <div className="flex gap-2 mb-4">
                                            <button className="flex-1 py-2 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                                                <Instagram className="w-4 h-4" />
                                            </button>
                                            <button className="flex-1 py-2 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                                                {/* TikTok Style SVG SVG */}
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                                            </button>
                                            <button className="flex-1 py-2 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                                                <Facebook className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Personalizar */}
                                        <button onClick={() => setIsStudioOpen(true)} className="w-full bg-[#EEF2FF] hover:bg-[#E0E7FF] text-blue-600 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                            <Palette className="w-3.5 h-3.5" />
                                            Personalizar
                                        </button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Columna Derecha del Panel de Notas: Editor */}
                            <Card className={`border-0 rounded-2xl shadow-sm w-full md:w-7/12 flex-1 flex flex-col ${themeStyles.card}`}>
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className={`text-xl font-bold ${themeStyles.title}`}>{editingNoteId ? 'Editar Reflexión' : 'Añadir Nota'}</h3>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-[11px] font-medium">
                                                {mounted && `Guardado automáticamente: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
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
                                            <ImgIcon className="w-[18px] h-[18px]" />
                                        </button>
                                    </div>

                                    {/* Editor Body */}
                                    <style>{`
                                .rich-text-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
                                .rich-text-editor blockquote { border-left: 4px solid #E5E7EB; padding-left: 1rem; color: #6B7280; font-style: italic; }
                                .rich-text-editor img { max-width: 100%; border-radius: 0.5rem; margin-top: 1rem; }
                                .rich-text-editor a { color: #3B82F6; text-decoration: underline; }
                            `}</style>
                                    <div className="relative w-full flex-1 min-h-[200px]">
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

                                        {/* Acciones para limpiar contenido del editor al cancelar */}
                                        <div className="flex items-center justify-end gap-6 mt-6 border-t border-gray-100 pt-6">
                                            <button onClick={handleClearNoteFields} className="text-sm font-bold text-rose-500 hover:text-rose-700 transition-colors">Limpiar</button>
                                            <button onClick={() => { handleClearNoteFields(); setIsNoteOpen(false); }} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
                                            <button onClick={handleSaveCustomNote} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors shadow-blue-500/20">
                                                <Save className="w-4 h-4" /> Guardar Nota
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                </div>
                {/* Social Asset Preview Studio Modal */}
                {isStudioOpen && selectedVerse !== null && (
                    <div className="fixed inset-0 z-50 flex p-0 md:p-4 lg:p-8" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
                        <div className="w-full h-full bg-white rounded-none md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border-0 md:border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 lg:px-8 py-4 border-b border-gray-100 bg-white z-10 shrink-0">
                                <div>
                                    <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 lg:gap-2">
                                        STUDIO <span className="text-gray-300">/</span> {selectedBook} {selectedChapter}:{selectedVerse}
                                    </p>
                                    <h2 className="text-lg lg:text-[22px] font-black text-gray-900 tracking-tight leading-none">Social Asset Preview</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsStudioOpen(false)} className="p-2 lg:px-5 lg:py-2.5 rounded-xl text-xs lg:text-[13px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-center">
                                        <span className="hidden sm:inline">Cancelar</span>
                                        <span className="sm:hidden"><X className="w-4 h-4" /></span>
                                    </button>
                                    <button onClick={handleDownloadPreview} className="px-4 lg:px-6 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl text-xs lg:text-[13px] font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-colors">
                                        <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                        <span className="hidden sm:inline">Descargar</span>
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F8FAFC]">
                                {/* Left: Previews Grid */}
                                <div className="flex-1 overflow-y-auto p-4 lg:p-12 custom-scrollbar">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                                        {/* Vertical Column */}
                                        <div className={`flex-col gap-4 ${studioTheme.orientation !== 'vertical' ? 'hidden xl:flex' : 'flex'}`}>
                                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                                                <span className="flex items-center gap-2">
                                                    <div className="w-3 h-4 bg-gray-300 rounded-sm"></div>
                                                    VERTICAL (9:16)
                                                </span>
                                                <span className="text-blue-400 font-black">TIKTOK • STORY</span>
                                            </div>
                                            <div id="preview-vertical" className="w-full max-w-[340px] mx-auto xl:max-w-none aspect-[9/16] rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-8 lg:p-10 text-center transition-all duration-300"
                                                style={{
                                                    backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor,
                                                    backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none',
                                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                                    color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF'
                                                }}
                                            >
                                                {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10 mb-8 opacity-80">
                                                    {selectedBook} {selectedChapter}:{selectedVerse}
                                                </p>
                                                <p className="font-serif relative z-10 w-full leading-tight transition-all duration-300"
                                                    style={{
                                                        fontSize: `${studioTheme.fontSize * 1.5}px`,
                                                        fontWeight: studioTheme.fontWeight,
                                                        textAlign: studioTheme.alignment
                                                    }}
                                                >
                                                    “{verses[selectedVerse - 1]}”
                                                </p>
                                            </div>
                                        </div>

                                        {/* Horizontal & Square Column */}
                                        <div className={`flex-col gap-6 lg:gap-10 ${studioTheme.orientation === 'vertical' ? 'hidden xl:flex' : 'flex'}`}>
                                            {/* Horizontal */}
                                            <div className={`flex-col gap-4 ${studioTheme.orientation !== 'horizontal' ? 'hidden xl:flex' : 'flex'}`}>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-3 bg-gray-300 rounded-sm"></div>
                                                        HORIZONTAL (16:9)
                                                    </span>
                                                    <span className="text-gray-400">FACEBOOK</span>
                                                </div>
                                                <div id="preview-horizontal" className="w-full max-w-[500px] mx-auto xl:max-w-none aspect-video rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-6 lg:p-8 text-center transition-all duration-300"
                                                    style={{
                                                        backgroundColor: studioTheme.bgImage ? 'transparent' : studioTheme.bgColor,
                                                        backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none',
                                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                                        color: studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#FFF'
                                                    }}
                                                >
                                                    {studioTheme.bgImage && <div className="absolute inset-0 bg-black/40" />}
                                                    <p className="font-serif relative z-10 w-full transition-all duration-300 leading-tight"
                                                        style={{
                                                            fontSize: `${studioTheme.fontSize}px`,
                                                            fontWeight: studioTheme.fontWeight,
                                                            textAlign: studioTheme.alignment
                                                        }}
                                                    >
                                                        “{verses[selectedVerse - 1]}”
                                                    </p>
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] relative z-10 mt-6 opacity-80">
                                                        — {selectedBook} {selectedChapter}:{selectedVerse}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Square */}
                                            <div className={`flex-col gap-4 ${studioTheme.orientation !== 'square' ? 'hidden xl:flex' : 'flex'}`}>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-3.5 h-3.5 bg-gray-300 rounded-sm"></div>
                                                        SQUARE (1:1)
                                                    </span>
                                                    <span className="text-gray-400">FEED</span>
                                                </div>
                                                <div id="preview-square" className="w-full max-w-[300px] lg:max-w-[340px] aspect-square rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl overflow-hidden relative flex flex-col items-center justify-center p-6 lg:p-8 text-center bg-gray-50 transition-all duration-300 mx-auto"
                                                    style={{
                                                        backgroundColor: studioTheme.bgImage ? 'transparent' : '#EEF2FF',
                                                        backgroundImage: studioTheme.bgImage ? `url(${studioTheme.bgImage})` : 'none',
                                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                                        color: studioTheme.bgImage || studioTheme.bgColor === '#FFFFFF' || studioTheme.bgColor === '#FEF08A' ? '#000' : '#2563EB'
                                                    }}
                                                >
                                                    {studioTheme.bgImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />}
                                                    <p className="font-serif relative z-10 w-full mb-6 uppercase transition-all duration-300 leading-none"
                                                        style={{
                                                            fontSize: `${studioTheme.fontSize * 1.6}px`,
                                                            fontWeight: '900',
                                                            textAlign: studioTheme.alignment,
                                                            color: studioTheme.bgImage ? '#2563EB' : 'inherit'
                                                        }}
                                                    >
                                                        {verses[selectedVerse - 1]}
                                                    </p>
                                                    <div className="w-10 h-0.5 mx-auto bg-blue-600 opacity-50 mb-4 z-10 relative"></div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest relative z-10 opacity-70" style={{ color: studioTheme.bgImage ? '#64748B' : 'inherit' }}>
                                                        {selectedBook} {selectedChapter}:{selectedVerse}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right/Bottom: Settings Sidebar */}
                                <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 p-6 lg:p-8 h-[45vh] lg:h-auto flex flex-col gap-8 lg:gap-10 overflow-y-auto shrink-0 custom-scrollbar z-20 relative shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] lg:shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] rounded-t-3xl lg:rounded-none">
                                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-1 lg:hidden shrink-0"></div>
                                    {/* Orientation */}
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">ORIENTATION</label>
                                        <div className="flex bg-gray-50 p-1 rounded-xl">
                                            <button onClick={() => setStudioTheme({ ...studioTheme, orientation: 'vertical' })} className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 text-[10px] font-bold rounded-lg transition-all ${studioTheme.orientation === 'vertical' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                                <div className={`w-2 h-3 rounded-[2px] transition-colors ${studioTheme.orientation === 'vertical' ? 'bg-blue-600' : 'bg-gray-400'}`}></div> <span className="hidden sm:inline">Vertical</span><span className="sm:hidden">Vert</span>
                                            </button>
                                            <button onClick={() => setStudioTheme({ ...studioTheme, orientation: 'horizontal' })} className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 text-[10px] font-bold rounded-lg transition-all ${studioTheme.orientation === 'horizontal' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                                <div className={`w-3.5 h-2 rounded-[2px] transition-colors ${studioTheme.orientation === 'horizontal' ? 'bg-gray-800' : 'bg-gray-400'}`}></div> <span className="hidden sm:inline">Horizontal</span><span className="sm:hidden">Horiz</span>
                                            </button>
                                            <button onClick={() => setStudioTheme({ ...studioTheme, orientation: 'square' })} className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 text-[10px] font-bold rounded-lg transition-all ${studioTheme.orientation === 'square' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                                <div className={`w-2.5 h-2.5 rounded-[2px] transition-colors ${studioTheme.orientation === 'square' ? 'bg-purple-600' : 'bg-gray-400'}`}></div> <span className="hidden sm:inline">Square</span><span className="sm:hidden">Cuadr</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Background Swatches */}
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">BACKGROUND SWATCHES</label>
                                        <div className="flex flex-wrap gap-2 lg:gap-3">
                                            {['#2563EB', '#0F172A', '#FFFFFF', '#FEF08A', '#10B981', '#F43F5E', '#6366F1', '#D1FAE5', '#94A3B8'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setStudioTheme({ ...studioTheme, bgColor: color, bgImage: null })}
                                                    className={`w-10 h-10 aspect-square rounded-xl border ${studioTheme.bgColor === color && !studioTheme.bgImage ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'border-gray-200 hover:scale-105'} transition-all`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <button className="w-10 h-10 aspect-square rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0">
                                                <Palette className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Background Gallery */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">BACKGROUND GALLERY</label>
                                            <button onClick={() => document.getElementById('studio-upload')?.click()} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">UPLOAD</button>
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
                                                        // Only persist base64 user uploads (not the default Unsplash URLs)
                                                        const userUploads = next.filter(img => img.startsWith('data:'));
                                                        localStorage.setItem('studioGalleryUploads', JSON.stringify(userUploads));
                                                        return next;
                                                    });
                                                };
                                                reader.readAsDataURL(file);
                                                e.target.value = '';
                                            }} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {studioGallery.map((url, idx) => (
                                                <button
                                                    key={url + idx}
                                                    onClick={() => setStudioTheme({ ...studioTheme, bgImage: url })}
                                                    className={`aspect-square rounded-xl bg-gray-100 bg-cover bg-center overflow-hidden border-2 transition-all ${studioTheme.bgImage === url ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent hover:scale-105'}`}
                                                    style={{ backgroundImage: `url(${url})` }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Typography Settings */}
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-6">TYPOGRAPHY SETTINGS</label>

                                        <div className="mb-6">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">FONT SIZE</span>
                                            </div>
                                            <input
                                                type="range" min="16" max="48"
                                                value={studioTheme.fontSize}
                                                onChange={(e) => setStudioTheme({ ...studioTheme, fontSize: parseInt(e.target.value) })}
                                                className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-3">FONT WEIGHT</span>
                                            <div className="flex gap-2">
                                                {['300', '400', '700', '900'].map((w, index) => (
                                                    <button
                                                        key={w}
                                                        onClick={() => setStudioTheme({ ...studioTheme, fontWeight: w })}
                                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-full border transition-colors ${studioTheme.fontWeight === w ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {['Light', 'Regular', 'Bold', 'Black'][index]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-3">ALIGNMENT</span>
                                            <div className="flex gap-2">
                                                {['left', 'center', 'right'].map((align: any) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => setStudioTheme({ ...studioTheme, alignment: align })}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${studioTheme.alignment === align ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                                                    >
                                                        <div className="flex flex-col gap-1 w-4">
                                                            <div className={`h-0.5 bg-current rounded-full transition-all ${align === 'left' ? 'w-full' : align === 'center' ? 'w-full' : 'w-full'}`}></div>
                                                            <div className={`h-0.5 bg-current rounded-full transition-all ${align === 'left' ? 'w-full' : align === 'center' ? 'w-2.5 mx-auto' : 'w-full ml-auto'}`}></div>
                                                            <div className={`h-0.5 bg-current rounded-full transition-all ${align === 'left' ? 'w-2.5' : align === 'center' ? 'w-full' : 'w-3 ml-auto'}`}></div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100 cursor-pointer" onClick={() => setStudioTheme({ ...studioTheme, motionEffects: !studioTheme.motionEffects })}>
                                            <div>
                                                <h6 className="text-[11px] font-bold text-gray-900">Motion Effects</h6>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Slow float pan on video.</p>
                                            </div>
                                            <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${studioTheme.motionEffects ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${studioTheme.motionEffects ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
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
