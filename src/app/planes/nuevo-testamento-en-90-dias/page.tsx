'use client';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { useToast } from '@/app/hooks/use-toast';
import { Bookmark, CheckCircle2, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/app/components/ui/skeleton';
import { bibleData as staticBibleData } from '@/lib/bible-data';

const bibleFileMap: { [key: string]: string } = {
    'mateo': 'mt', 'marcos': 'mk', 'lucas': 'lk', 'juan': 'jo', 'hechos': 'act', 'romanos': 'rm',
    '1 corintios': '1-corinthians', '2 corintios': '2-corinthians', 'gálatas': 'gl', 'efesios': 'eph', 'filipenses': 'ph', 'colosenses': 'colossians',
    '1 tesalonicenses': '1-thessalonians', '2 tesalonicenses': '2-thessalonians', '1 timoteo': '1-timothy', '2 timoteo': '2-timothy', 'tito': 'tt', 'filemón': 'phm',
    'hebreos': 'hb', 'santiago': 'jm', '1 pedro': '1-peter', '2 pedro': '2-peter', '1 juan': '1-john', '2 juan': '2-john', '3 juan': '3-john',
    'judas': 'jd', 'apocalipsis': 're',
};

const bookOrderNT = Object.keys(staticBibleData).filter(book => staticBibleData[book].testament === 'NT');

const chaptersInBook = (bookName: string) => staticBibleData[bookName.toLowerCase()]?.chapters || 0;

const generateNT90DaysPlan = () => {
    const plan = [];
    let day = 1;
    let currentBookIndex = 0;
    let currentChapter = 1;

    while (day <= 90) {
        let chaptersReadToday = 0;
        let readingsForDay = [];

        while (chaptersReadToday < 3 && currentBookIndex < bookOrderNT.length) {
            const bookName = bookOrderNT[currentBookIndex];
            const totalChapters = chaptersInBook(bookName);

            if (currentChapter <= totalChapters) {
                readingsForDay.push(`${bookName} ${currentChapter}`);
                currentChapter++;
                chaptersReadToday++;
            } else {
                currentBookIndex++;
                currentChapter = 1;
            }
        }

        if (readingsForDay.length > 0) {
            plan.push({
                day: day,
                reading: readingsForDay.join('; '),
                summary: `Lectura del día ${day} del Nuevo Testamento.`
            });
            day++;
        } else if (currentBookIndex >= bookOrderNT.length) {
            // If all books are read but we haven't reached 90 days, pad with last book
            plan.push({
                day: day,
                reading: `${bookOrderNT[bookOrderNT.length - 1]} ${chaptersInBook(bookOrderNT[bookOrderNT.length - 1])}`,
                summary: `Lectura del día ${day} del Nuevo Testamento.`
            });
            day++;
        }
    }
    return plan;
};

interface PassageVerse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

interface SavedVerse {
  text: string;
  reference: string;
}

export default function NT90DaysPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [verses, setVerses] = useState<PassageVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const bibleCache = useRef<{ [key: string]: any }>({});
  
  const router = useRouter();
  const { toast } = useToast();

  const planDays = useMemo(() => generateNT90DaysPlan(), []);

  useEffect(() => {
    const saved = localStorage.getItem('savedVerses');
    if (saved) {
      setSavedVerses(JSON.parse(saved));
    }
  }, []);

  const getBookData = async (bookName: string) => {
    if (bibleCache.current[bookName]) {
        return bibleCache.current[bookName];
    }
    const fileName = bibleFileMap[bookName.toLowerCase()];
    if (fileName) {
        try {
            const module = await import(`@/app/lib/bible_rvr/${fileName}.json`);
            const bookData = module.default;
            bibleCache.current[bookName] = bookData;
            return bookData;
        } catch (error) {
            console.error(`Error loading book: ${bookName}`, error);
            return null;
        }
    }
    return null;
  }

  const handleReadPassage = async (reading: string): Promise<PassageVerse[]> => {
    const allVerses: PassageVerse[] = [];
    let currentBookKey = '';
  
    const references = reading.split(';').map(r => r.trim());
  
    for (const ref of references) {
      let passage = ref;
      const bookMatch = ref.match(/^(\d?\s?[a-zA-Záéíóúñ]+)\s/);
  
      if (bookMatch && bookMatch[1]) {
        const bookName = bookMatch[1].trim().toLowerCase();
        if (bibleFileMap[bookName]) {
          currentBookKey = bookName;
          passage = ref.substring(bookMatch[0].length).trim();
        }
      }
  
      if (!currentBookKey) continue;
  
      const book = await getBookData(currentBookKey);
      if (!book) continue;
  
      const passageParts = passage.split(',').map(p => p.trim());
  
      for (const part of passageParts) {
        let match;
  
        match = part.match(/^(\d+)-(\d+)$/);
        if (match) {
          const startChapter = parseInt(match[1], 10);
          const endChapter = parseInt(match[2], 10);
          for (let c = startChapter; c <= endChapter; c++) {
            const verses = book.chapters[c - 1] || [];
            verses.forEach((text: string, i: number) => {
              allVerses.push({ book: currentBookKey, chapter: c, verse: i + 1, text });
            });
          }
          continue;
        }
        
        match = part.match(/^(\d+):(\d+)$/);
        if (match) {
            const chapter = parseInt(match[1], 10);
            const verse = parseInt(match[2], 10);
            const chapterVerses = book.chapters[chapter - 1] || [];
            if(chapterVerses[verse-1]) {
                allVerses.push({ book: currentBookKey, chapter, verse, text: chapterVerses[verse - 1] });
            }
            continue;
        }
  
        match = part.match(/^(\d+)$/);
        if (match) {
          const chapter = parseInt(match[1], 10);
          const verses = book.chapters[chapter - 1] || [];
          verses.forEach((text: string, i: number) => {
            allVerses.push({ book: currentBookKey, chapter, verse: i + 1, text });
          });
        }
      }
    }
    return allVerses;
  };

  useEffect(() => {
    if (selectedDay !== null) {
      const dayData = planDays.find(d => d.day === selectedDay);
      if (dayData) {
        setLoading(true);
        handleReadPassage(dayData.reading)
          .then(setVerses)
          .finally(() => setLoading(false));
      }
    }
  }, [selectedDay, planDays]);

  const toggleDayCompletion = (day: number) => {
    setCompletedDays(
      completedDays.includes(day)
        ? completedDays.filter((d) => d !== day)
        : [...completedDays, day]
    );
  };

  const progressPercentage = (completedDays.length / planDays.length) * 100;

  const handleSaveVerse = (verse: PassageVerse) => {
    const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
    const newVerse = { text: verse.text, reference };
    
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

  if (selectedDay !== null) {
    const dayData = planDays.find(d => d.day === selectedDay);
    if (!dayData) return null;

    return (
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Button onClick={() => setSelectedDay(null)} variant="outline" className="mb-4">
            &larr; Volver al plan
          </Button>
          <h1 className="text-4xl font-bold font-headline text-center mb-2">{dayData.reading}</h1>
          <p className="text-center text-muted-foreground mb-8">{dayData.summary}</p>
          
          <Card>
            <CardContent className="p-6 space-y-4 text-lg leading-relaxed">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : verses.length > 0 ? verses.map((v, index) => {
                const reference = `${v.book} ${v.chapter}:${v.verse}`;
                const isSaved = savedVerses.some(sv => sv.reference === reference);
                return (
                    <div key={index} className="flex items-start gap-2">
                        <p className="flex-grow">
                            <sup className="font-bold mr-2">{v.chapter}:{v.verse}</sup>
                            {v.text}
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShareVerse(v)}
                        >
                            <Share2 className="h-6 w-6 text-gray-400" />
                            <span className="sr-only">Compartir versículo</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveVerse(v)}
                        >
                            <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current text-black' : 'text-gray-400'}`} />
                            <span className="sr-only">Guardar versículo</span>
                        </Button>
                    </div>
                );
              }) : <p>No se encontró el contenido para este día.</p>}
            </CardContent>
          </Card>
          <div className="flex justify-center mt-6">
            <Button onClick={() => {
                if (selectedDay !== null) {
                    toggleDayCompletion(selectedDay);
                }
                setSelectedDay(null);
            }} disabled={loading}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {selectedDay !== null && completedDays.includes(selectedDay) ? 'Marcar como no completado' : 'Marcar como completado'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <Button onClick={() => router.back()} variant="outline">
                &larr; Regresar
            </Button>
            <Link href="/biblia/guardados">
                <Button variant="outline">Versículos Guardados</Button>
            </Link>
        </div>
        <h1 className="text-4xl font-bold font-headline text-center mb-4">
          Nuevo Testamento en 90 Días
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Un ritmo excelente para nuevos creyentes o grupos de estudio. Lectura diaria: 3 capítulos.
        </p>

        <div className="mb-8">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground text-center mt-2">{Math.round(progressPercentage)}% completado ({completedDays.length} de {planDays.length} días)</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {planDays.map((item) => (
            <Card 
              key={item.day} 
              className={`cursor-pointer transition-all hover:shadow-lg ${completedDays.includes(item.day) ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
              onClick={() => setSelectedDay(item.day)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Día {item.day}</span>
                  {completedDays.includes(item.day) && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.reading}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
