'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import all necessary bible books
import jo from '@/lib/bible/jo.json';
import ps from '@/lib/bible/ps.json';
import prv from '@/lib/bible/prv.json';
import eph from '@/lib/bible/eph.json';
import act from '@/lib/bible/act.json';
import ph from '@/lib/bible/ph.json';
import rm from '@/lib/bible/rm.json';
import gn from '@/lib/bible/gn.json'; // For Genesis 3

const bibleData: { [key: string]: any } = {
    'juan': jo,
    'salmos': ps,
    'proverbios': prv,
    'efesios': eph,
    'hechos': act,
    'filipenses': ph,
    'romanos': rm,
    'génesis': gn,
};

const planDays = [
  { day: 1, reading: 'Juan 1;2;3;', summary: 'El comienzo del ministerio de Jesús' },
  { day: 2, reading: 'Juan 4;5;6;', summary: 'Milagros y enseñanzas de Jesús' },
  { day: 3, reading: 'Salmos 1;2;3;4;5;6;7;8;', summary: 'Oración, adoración y confianza' },
  { day: 4, reading: 'Proverbios 1;2;3;4;', summary: 'Fundamentos de sabiduría' },
  { day: 5, reading: 'Efesios 1;2;3;', summary: 'Identidad en Cristo' },
  { day: 6, reading: 'Efesios 4;5;6;', summary: 'Vida práctica en Cristo' },
  { day: 7, reading: 'Hechos 1;2;3;4;', summary: 'Nacimiento de la iglesia' },
  { day: 8, reading: 'Hechos 5;6;7;8;', summary: 'Expansión del evangelio' },
  { day: 9, reading: 'Filipenses 1;2;3;4;', summary: 'Gozo y madurez espiritual' },
  { day: 10, reading: 'Romanos 8', summary: 'La vida en el Espíritu' }
];

interface PassageVerse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export default function RenewFaithPlanPage() {
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
                    <sup
                        className="font-bold mr-2">{v.book.charAt(0).toUpperCase() + v.book.slice(1)} {v.chapter}:{v.verse}<br/></sup>
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
          10 Días para Renovar tu Fe
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Este plan de 10 días te guía por pasajes clave del Antiguo y del Nuevo Testamento para fortalecer tu relación con Dios, renovar tu mente y profundizar en tu vida espiritual. A través de los Evangelios, Salmos, Proverbios, Hechos y las cartas apostólicas, experimentarás un recorrido equilibrado que combina enseñanza, sabiduría, adoración y crecimiento práctico en Cristo. Es un plan perfecto para reiniciar tu vida devocional, comenzar un nuevo hábito o compartirlo con tu familia o grupo de estudio.
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
