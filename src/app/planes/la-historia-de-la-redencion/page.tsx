'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Import all necessary bible books
import gn from '@/lib/bible/gn.json';
import ex from '@/lib/bible/ex.json';
import le from '@/lib/bible/lv.json';
import nu from '@/lib/bible/nm.json';
import de from '@/lib/bible/dt.json';
import jos from '@/lib/bible/js.json';
import jue from '@/lib/bible/jud.json';
import sa1 from '@/lib/bible/1-samuel.json';
import sa2 from '@/lib/bible/2-samuel.json';
import re1 from '@/lib/bible/1-kings.json';
import re2 from '@/lib/bible/2-kings.json';
import job from '@/lib/bible/job.json';
import sa from '@/lib/bible/ps.json';
import pr from '@/lib/bible/prv.json';
import is from '@/lib/bible/is.json';
import je from '@/lib/bible/jr.json';
import ez from '@/lib/bible/ez.json';
import da from '@/lib/bible/dn.json';
import mt from '@/lib/bible/mt.json';
import lu from '@/lib/bible/lk.json';
import jo from '@/lib/bible/jo.json';
import ro from '@/lib/bible/rm.json';
import ga from '@/lib/bible/gl.json';
import ef from '@/lib/bible/eph.json';
import he from '@/lib/bible/hb.json';
import ap from '@/lib/bible/re.json';

const bibleData: { [key: string]: any } = {
    'génesis': gn,
    'éxodo': ex,
    'levítico': le,
    'números': nu,
    'deuteronomio': de,
    'josué': jos,
    'jueces': jue,
    '1 samuel': sa1,
    '2 samuel': sa2,
    '1 reyes': re1,
    '2 reyes': re2,
    'job': job,
    'salmos': sa,
    'proverbios': pr,
    'isaías': is,
    'jeremías': je,
    'ezequiel': ez,
    'daniel': da,
    'mateo': mt,
    'lucas': lu,
    'juan': jo,
    'romanos': ro,
    'gálatas': ga,
    'efesios': ef,
    'hebreos': he,
    'apocalipsis': ap,
};


const planDays = [
    { day: 1, reading: 'Génesis 1;2;3;', summary: 'La creación del mundo y la caída del hombre.' },
    { day: 2, reading: 'Génesis 12:1-9; 15:1-6', summary: 'El llamado de Abram y el pacto de Dios con él.' },
    { day: 3, reading: 'Éxodo 12;13;14;', summary: 'La Pascua y el cruce del Mar Rojo.' },
    { day: 4, reading: 'Éxodo 19;20;', summary: 'Dios entrega los Diez Mandamientos en el Monte Sinaí.' },
    { day: 5, reading: 'Levítico 16', summary: 'Instrucciones para el Día de la Expiación.' },
    { day: 6, reading: 'Números 13;14;', summary: 'Los espías exploran Canaán y la rebelión de Israel.' },
    { day: 7, reading: 'Deuteronomio 6; 30:11-20', summary: 'El gran mandamiento de amar a Dios y la elección entre la vida y la muerte.' },
    { day: 8, reading: 'Josué 1; 24', summary: 'Josué lidera a Israel y el pueblo renueva el pacto.' },
    { day: 9, reading: 'Jueces 2:6-23; 6-7', summary: 'El ciclo de desobediencia de Israel y la historia de Gedeón.' },
    { day: 10, reading: '1 Samuel 16;17;', summary: 'David es ungido rey y derrota a Goliat.' },
    { day: 11, reading: '2 Samuel 7; 11;12;', summary: 'El pacto de Dios con David y su pecado con Betsabé.' },
    { day: 12, reading: '1 Reyes 8; 18;', summary: 'La dedicación del templo de Salomón y el enfrentamiento de Elías con los profetas de Baal.' },
    { day: 13, reading: '2 Reyes 17; 25;', summary: 'La caída de Israel y Judá.' },
    { day: 14, reading: 'Job 1-2; 42;', summary: 'El sufrimiento de Job y su restauración.' },
    { day: 15, reading: 'Salmos 1; 23; 51', summary: 'Poemas de sabiduría, confianza y arrepentimiento.' },
    { day: 16, reading: 'Proverbios 1;2;3;', summary: 'La búsqueda de la sabiduría.' },
    { day: 17, reading: 'Isaías 1; 9:1-7', summary: 'Un llamado al arrepentimiento y la profecía del nacimiento de un niño que será Rey.' },
    { day: 18, reading: 'Isaías 52:13;53:12', summary: 'La profecía del Siervo Sufriente.' },
    { day: 19, reading: 'Jeremías 1; 31:31-34', summary: 'El llamado de Jeremías y la promesa de un nuevo pacto.' },
    { day: 20, reading: 'Ezequiel 36:22-38; 37', summary: 'La promesa de un corazón nuevo y el valle de los huesos secos.' },
    { day: 21, reading: 'Daniel 7;8;9;', summary: 'Las visiones de Daniel y su oración por su pueblo.' },
    { day: 22, reading: 'Mateo 1;2; Lucas 1;2;', summary: 'El nacimiento de Jesús.' },
    { day: 23, reading: 'Mateo 5;6;7;', summary: 'El Sermón del Monte.' },
    { day: 24, reading: 'Juan 1;2;3;', summary: 'El Verbo se hizo carne y la conversación de Jesús con Nicodemo.' },
    { day: 25, reading: 'Romanos 3;4;5;', summary: 'La justificación por la fe.' },
    { day: 26, reading: 'Romanos 8', summary: 'La vida en el Espíritu.' },
    { day: 27, reading: 'Gálatas 5', summary: 'La libertad en Cristo y el fruto del Espíritu.' },
    { day: 28, reading: 'Efesios 1;2;', summary: 'Las bendiciones espirituales en Cristo y la salvación por gracia.' },
    { day: 29, reading: 'Hebreos 11;12;', summary: 'La fe y la perseverancia.' },
    { day: 30, reading: 'Apocalipsis 1; 21;22;', summary: 'La visión de Juan y la promesa de un cielo nuevo y una tierra nueva.' },
  ];

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

export default function RedemptionStoryPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const router = useRouter();
  const { toast } = useToast();

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
  
        match = part.match(/^(\d+):(\d+)-(\d+)$/);
        if (match) {
          const chapter = parseInt(match[1], 10);
          const startVerse = parseInt(match[2], 10);
          const endVerse = parseInt(match[3], 10);
          const verses = book.chapters[chapter - 1] || [];
          for (let i = startVerse; i <= endVerse; i++) {
            if (verses[i - 1]) {
              allVerses.push({ book: currentBookKey, chapter, verse: i, text: verses[i - 1] });
            }
          }
          continue;
        }
  
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
          const verses = book.chapters[chapter - 1] || [];
          if (verses[verse - 1]) {
            allVerses.push({ book: currentBookKey, chapter, verse, text: verses[verse - 1] });
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
                <Button variant="outline">Ver Versículos Guardados</Button>
            </Link>
        </div>
        <h1 className="text-4xl font-bold font-headline text-center mb-4">
          La Historia de la Redención
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Sigue la gran narrativa de la Biblia desde Génesis hasta Apocalipsis en este plan de 30 días.
        </p>

        <div className="mb-8">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground text-center mt-2">{Math.round(progressPercentage)}% completado</p>
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
