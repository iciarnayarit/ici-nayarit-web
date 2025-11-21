'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import all bible books
import gn from '@/lib/bible/gn.json';
import hb from '@/lib/bible/hb.json';
import jm from '@/lib/bible/jm.json';
import mt from '@/lib/bible/mt.json';
import lk from '@/lib/bible/lk.json';
import act from '@/lib/bible/act.json';
import jo from '@/lib/bible/jo.json';
import rm from '@/lib/bible/rm.json'; // Import missing rm
import eph from '@/lib/bible/eph.json';
import prv from '@/lib/bible/prv.json';
import co1 from '@/lib/bible/1-corinthians.json';

const bibleData: { [key: string]: any } = {
    'génesis': gn,
    'hebreos': hb,
    'santiago': jm,
    'mateo': mt,
    'lucas': lk,
    'hechos': act,
    'juan': jo,
    'romanos': rm,
    'efesios': eph,
    'proverbios': prv,
    '1 corintios': co1,
};

const planDays = [
    // Mes 1: Fe
    { day: 1, reading: 'Hebreos 11', summary: 'Mes 1: Fe' },
    { day: 2, reading: 'Génesis 15', summary: 'Mes 1: Fe' },
    { day: 3, reading: 'Santiago 2', summary: 'Mes 1: Fe' },
    // Mes 2: Oración
    { day: 4, reading: 'Mateo 6', summary: 'Mes 2: Oración' },
    { day: 5, reading: 'Lucas 11', summary: 'Mes 2: Oración' },
    { day: 6, reading: 'Lucas 18', summary: 'Mes 2: Oración' },
    // Mes 3: El Espíritu Santo
    { day: 7, reading: 'Juan 14', summary: 'Mes 3: El Espíritu Santo' },
    { day: 8, reading: 'Hechos 2', summary: 'Mes 3: El Espíritu Santo' },
    { day: 9, reading: 'Romanos 8', summary: 'Mes 3: El Espíritu Santo' },
    // Mes 4: La iglesia
    { day: 10, reading: 'Hechos 2:42-47', summary: 'Mes 4: La iglesia' },
    { day: 11, reading: 'Efesios 4', summary: 'Mes 4: La iglesia' },
    { day: 12, reading: '1 Corintios 12', summary: 'Mes 4: La iglesia' },
    // Mes 5: Sabiduría
    { day: 13, reading: 'Proverbios 1', summary: 'Mes 5: Sabiduría' },
    { day: 14, reading: 'Proverbios 8', summary: 'Mes 5: Sabiduría' },
    { day: 15, reading: 'Santiago 1', summary: 'Mes 5: Sabiduría' },
    // Mes 6: Evangelismo
    { day: 16, reading: 'Mateo 28:16-20', summary: 'Mes 6: Evangelismo' },
    { day: 17, reading: 'Hechos 1:8', summary: 'Mes 6: Evangelismo' },
    { day: 18, reading: 'Romanos 10', summary: 'Mes 6: Evangelismo' },
];

interface PassageVerse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export default function ThematicPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const toggleDayCompletion = (day: number) => {
    setCompletedDays(
      completedDays.includes(day)
        ? completedDays.filter((d) => d !== day)
        : [...completedDays, day]
    );
  };

  const progressPercentage = (completedDays.length / planDays.length) * 100;

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
              {verses.length > 0 ? verses.map((v, index) => (
                <p key={index}>
                  <sup className="font-bold mr-2">{v.book.charAt(0).toUpperCase() + v.book.slice(1)} {v.chapter}:{v.verse}<br /></sup>
                  {v.text}
                </p>
              )) : <p>No se encontró el contenido para este día.</p>}
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
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
            &larr; Regresar
        </Button>
        <h1 className="text-4xl font-bold font-headline text-center mb-4">
          Plan Temático
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Cada mes un tema: Fe, Oración, El Espíritu Santo, La iglesia, Sabiduría, Evangelismo.
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
                <p className="text-sm font-bold">{item.summary}</p>
                <p className="text-sm text-muted-foreground">{item.reading}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
