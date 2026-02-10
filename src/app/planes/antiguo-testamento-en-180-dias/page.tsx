'use client';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { useToast } from '@/app/hooks/use-toast';
import { Bookmark, CheckCircle2, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// Import all Old Testament bible_rvr books
import c1 from '@/app/lib/bible_rvr/1-chronicles.json';
import k1 from '@/app/lib/bible_rvr/1-kings.json';
import sa1 from '@/app/lib/bible_rvr/1-samuel.json';
import c2 from '@/app/lib/bible_rvr/2-chronicles.json';
import k2 from '@/app/lib/bible_rvr/2-kings.json';
import sa2 from '@/app/lib/bible_rvr/2-samuel.json';
import am from '@/app/lib/bible_rvr/am.json';
import dn from '@/app/lib/bible_rvr/dn.json';
import dt from '@/app/lib/bible_rvr/dt.json';
import ec from '@/app/lib/bible_rvr/ec.json';
import et from '@/app/lib/bible_rvr/et.json';
import ex from '@/app/lib/bible_rvr/ex.json';
import ez from '@/app/lib/bible_rvr/ez.json';
import ezr from '@/app/lib/bible_rvr/ezr.json';
import gn from '@/app/lib/bible_rvr/gn.json';
import hg from '@/app/lib/bible_rvr/hg.json';
import hk from '@/app/lib/bible_rvr/hk.json';
import ho from '@/app/lib/bible_rvr/ho.json';
import is from '@/app/lib/bible_rvr/is.json';
import jl from '@/app/lib/bible_rvr/jl.json';
import jn from '@/app/lib/bible_rvr/jn.json';
import job from '@/app/lib/bible_rvr/job.json';
import jr from '@/app/lib/bible_rvr/jr.json';
import js from '@/app/lib/bible_rvr/js.json';
import jud from '@/app/lib/bible_rvr/jud.json';
import lm from '@/app/lib/bible_rvr/lm.json';
import lv from '@/app/lib/bible_rvr/lv.json';
import mi from '@/app/lib/bible_rvr/mi.json';
import ml from '@/app/lib/bible_rvr/ml.json';
import na from '@/app/lib/bible_rvr/na.json';
import ne from '@/app/lib/bible_rvr/ne.json';
import nm from '@/app/lib/bible_rvr/nm.json';
import ob from '@/app/lib/bible_rvr/ob.json';
import prv from '@/app/lib/bible_rvr/prv.json';
import ps from '@/app/lib/bible_rvr/ps.json';
import rt from '@/app/lib/bible_rvr/rt.json';
import so from '@/app/lib/bible_rvr/so.json';
import zc from '@/app/lib/bible_rvr/zc.json';
import zp from '@/app/lib/bible_rvr/zp.json';
import Link from 'next/link';

const bibleData: { [key: string]: any } = {
    'génesis': gn, 'éxodo': ex, 'levítico': lv, 'números': nm, 'deuteronomio': dt, 'josué': js, 'jueces': jud, 'rut': rt,
    '1 samuel': sa1, '2 samuel': sa2, '1 reyes': k1, '2 reyes': k2, '1 crónicas': c1, '2 crónicas': c2, 'esdras': ezr,
    'nehemías': ne, 'ester': et, 'job': job, 'salmos': ps, 'proverbios': prv, 'eclesiastés': ec, 'cantar de los cantares': so,
    'isaías': is, 'jeremías': jr, 'lamentaciones': lm, 'ezequiel': ez, 'daniel': dn, 'oseas': ho, 'joel': jl,
    'amós': am, 'abdías': ob, 'jonás': jn, 'miqueas': mi, 'nahúm': na, 'habacuc': hk, 'sofonías': zp, 'hageo': hg,
    'zacarías': zc, 'malaquías': ml,
};

const bookOrderOT = [
    'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel',
    '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios',
    'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel',
    'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías'
];

const chaptersInBook = (bookName: string) => bibleData[bookName.toLowerCase()]?.chapters?.length || 0;

const generateOT180DaysPlan = () => {
    const plan = [];
    let day = 1;
    let currentBookIndex = 0;
    let currentChapter = 1;

    while (day <= 180 && currentBookIndex < bookOrderOT.length) {
        let chaptersReadToday = 0;
        let readingsForDay = [];

        while (chaptersReadToday < 3 && currentBookIndex < bookOrderOT.length) {
            const bookName = bookOrderOT[currentBookIndex];
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
                summary: `Lectura del día ${day} del Antiguo Testamento.`
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

export default function OT180DaysPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  
  const router = useRouter();
  const { toast } = useToast();

  const planDays = useMemo(() => generateOT180DaysPlan(), []);

  useEffect(() => {
    const saved = localStorage.getItem('savedVerses');
    if (saved) {
      setSavedVerses(JSON.parse(saved));
    }
  }, []);

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

  const handleReadPassage = (reading: string): PassageVerse[] => {
    const allVerses: PassageVerse[] = [];
    let currentBookKey = '';
  
    const references = reading.split(';').map(r => r.trim());
  
    for (const ref of references) {
      let passage = ref;
      const bookMatch = ref.match(/^(\d?\s?[a-zA-Záéíóúñ]+)\s/);
  
      if (bookMatch && bookMatch[1]) {
        const bookName = bookMatch[1].trim().toLowerCase();
        if (bibleData[bookName]) {
          currentBookKey = bookName;
          passage = ref.substring(bookMatch[0].length).trim();
        }
      }
  
      if (!currentBookKey) continue;
  
      const book = bibleData[currentBookKey];
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

  if (selectedDay) {
    const dayData = planDays.find(d => d.day === selectedDay);
    if (!dayData) return null;

    const verses = handleReadPassage(dayData.reading);

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
              {verses.length > 0 ? verses.map((v, index) => {
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
                toggleDayCompletion(selectedDay);
                setSelectedDay(null);
            }}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {completedDays.includes(selectedDay) ? 'Marcar como no completado' : 'Marcar como completado'}
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
          Antiguo Testamento en 180 Días
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Lectura profunda pero alcanzable. Muy útil para liderazgo y discipulado.
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
