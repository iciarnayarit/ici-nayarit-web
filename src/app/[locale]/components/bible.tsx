'use client';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/[locale]/components/ui/select';
import { Card, CardContent } from '@/app/[locale]/components/ui/card';
import { Button } from '@/app/[locale]/components/ui/button';
import { ChevronLeft, ChevronRight, Bookmark, Share2 } from 'lucide-react';
import { useToast } from '@/app/[locale]/hooks/use-toast';
import {Link} from '@/navigation';

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

export default function Bible() {
  const [selectedBook, setSelectedBook] = useState('Génesis');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('savedVerses');
    if (saved) {
      setSavedVerses(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const fetchChapter = async () => {
      setIsLoading(true);
      try {
        const bookFileName = bookFileMap[selectedBook];
        if (bookFileName) {
          const bookModule = await import(`@/app/[locale]/lib/bible_rvr/${bookFileName}.json`);
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

  return (
    <section id="bible" className="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex gap-4">
                <Select value={selectedBook} onValueChange={handleBookChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Seleccionar libro" />
                    </SelectTrigger>
                    <SelectContent>
                    {books.map(book => (
                        <SelectItem key={book} value={book}>{book}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={selectedChapter.toString()} onValueChange={(val) => setSelectedChapter(Number(val))}>
                    <SelectTrigger className="w-full sm:w-[200px]">
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
                    <Button variant="outline">Ver Versículos Guardados</Button>
                </Link>
            </div>

            <div className="relative">
                <Button onClick={goToPreviousChapter} disabled={selectedChapter === 1} variant="outline" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+8px)]">
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                <Card>
                    <CardContent className="p-6 md:p-8">
                        <h2 className="text-3xl font-bold font-headline mb-6 text-center">{selectedBook} {selectedChapter}</h2>
                        <div className="space-y-4 text-left font-body text-lg md:text-xl leading-relaxed">
                        {isLoading ? (
                        <p>Cargando...</p>
                        ) : verses.length > 0 ? (
                        verses.map((verse, index) => {
                            const reference = `${selectedBook} ${selectedChapter}:${index + 1}`;
                            const isSaved = savedVerses.some(v => v.reference === reference);
                            return (
                                <div key={index} className="flex items-start gap-2">
                                    <p className="flex-grow">
                                        <sup className="font-bold mr-2">{index + 1}</sup>{verse}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleShareVerse(verse, index + 1)}
                                    >
                                        <Share2 className="h-6 w-6 text-gray-400" />
                                        <span className="sr-only">Compartir versículo</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleSaveVerse(verse, index + 1)}
                                    >
                                        <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current text-black' : 'text-gray-400'}`} />
                                        <span className="sr-only">Guardar versículo</span>
                                    </Button>
                                </div>
                            );
                        })
                        ) : (
                        <p>No se encontró el contenido de este capítulo.</p>
                        )}
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={goToNextChapter} disabled={selectedChapter === totalChapters} variant="outline" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)]">
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
      </div>
    </section>
  );
}
