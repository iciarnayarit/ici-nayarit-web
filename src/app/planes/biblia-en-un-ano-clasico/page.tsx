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
import ex from '@/lib/bible/ex.json';
import lv from '@/lib/bible/lv.json';
import nm from '@/lib/bible/nm.json';
import dt from '@/lib/bible/dt.json';
import js from '@/lib/bible/js.json';
import jud from '@/lib/bible/jud.json';
import rt from '@/lib/bible/rt.json';
import sa1 from '@/lib/bible/1-samuel.json';
import sa2 from '@/lib/bible/2-samuel.json';
import k1 from '@/lib/bible/1-kings.json';
import k2 from '@/lib/bible/2-kings.json';
import c1 from '@/lib/bible/1-chronicles.json';
import c2 from '@/lib/bible/2-chronicles.json';
import ezr from '@/lib/bible/ezr.json';
import ne from '@/lib/bible/ne.json';
import et from '@/lib/bible/et.json';
import job from '@/lib/bible/job.json';
import ps from '@/lib/bible/ps.json';
import prv from '@/lib/bible/prv.json';
import ec from '@/lib/bible/ec.json';
import so from '@/lib/bible/so.json';
import is from '@/lib/bible/is.json';
import jr from '@/lib/bible/jr.json';
import lm from '@/lib/bible/lm.json';
import ez from '@/lib/bible/ez.json';
import dn from '@/lib/bible/dn.json';
import ho from '@/lib/bible/ho.json';
import jl from '@/lib/bible/jl.json';
import am from '@/lib/bible/am.json';
import ob from '@/lib/bible/ob.json';
import jn from '@/lib/bible/jn.json';
import mi from '@/lib/bible/mi.json';
import na from '@/lib/bible/na.json';
import hk from '@/lib/bible/hk.json';
import zp from '@/lib/bible/zp.json';
import hg from '@/lib/bible/hg.json';
import zc from '@/lib/bible/zc.json';
import ml from '@/lib/bible/ml.json';
import mt from '@/lib/bible/mt.json';
import mk from '@/lib/bible/mk.json';
import lk from '@/lib/bible/lk.json';
import jo from '@/lib/bible/jo.json';
import act from '@/lib/bible/act.json';
import rm from '@/lib/bible/rm.json';
import co1 from '@/lib/bible/1-corinthians.json';
import co2 from '@/lib/bible/2-corinthians.json';
import gl from '@/lib/bible/gl.json';
import eph from '@/lib/bible/eph.json';
import ph from '@/lib/bible/ph.json';
import col from '@/lib/bible/colossians.json';
import th1 from '@/lib/bible/1-thessalonians.json';
import th2 from '@/lib/bible/2-thessalonians.json';
import ti1 from '@/lib/bible/1-timothy.json';
import ti2 from '@/lib/bible/2-timothy.json';
import tt from '@/lib/bible/tt.json';
import phm from '@/lib/bible/phm.json';
import hb from '@/lib/bible/hb.json';
import jm from '@/lib/bible/jm.json';
import pe1 from '@/lib/bible/1-peter.json';
import pe2 from '@/lib/bible/2-peter.json';
import jn1 from '@/lib/bible/1-john.json';
import jn2 from '@/lib/bible/2-john.json';
import jn3 from '@/lib/bible/3-john.json';
import jd from '@/lib/bible/jd.json';
import re from '@/lib/bible/re.json';

const bibleData: { [key: string]: any } = {
    'génesis': gn, 'éxodo': ex, 'levítico': lv, 'números': nm, 'deuteronomio': dt, 'josué': js, 'jueces': jud, 'rut': rt,
    '1 samuel': sa1, '2 samuel': sa2, '1 reyes': k1, '2 reyes': k2, '1 crónicas': c1, '2 crónicas': c2, 'esdras': ezr,
    'nehemías': ne, 'ester': et, 'job': job, 'salmos': ps, 'proverbios': prv, 'eclesiastés': ec, 'cantares': so,
    'isaías': is, 'jeremías': jr, 'lamentaciones': lm, 'ezequiel': ez, 'daniel': dn, 'oseas': ho, 'joel': jl,
    'amós': am, 'abdías': ob, 'jonás': jn, 'miqueas': mi, 'nahúm': na, 'habacuc': hk, 'sofonías': zp, 'hageo': hg,
    'zacarías': zc, 'malaquías': ml, 'mateo': mt, 'marcos': mk, 'lucas': lk, 'juan': jo, 'hechos': act, 'romanos': rm,
    '1 corintios': co1, '2 corintios': co2, 'gálatas': gl, 'efesios': eph, 'filipenses': ph, 'colosenses': col,
    '1 tesalonicenses': th1, '2 tesalonicenses': th2, '1 timoteo': ti1, '2 timoteo': ti2, 'tito': tt, 'filemón': phm,
    'hebreos': hb, 'santiago': jm, '1 pedro': pe1, '2 pedro': pe2, '1 juan': jn1, '2 juan': jn2, '3 juan': jn3,
    'judas': jd, 'apocalipsis': re,
};

const bookOrder = [
    'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías',
    'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis'
];

const chaptersInBook = (bookName: string) => bibleData[bookName.toLowerCase()].chapters.length;

const generateClassicPlan = () => {
    const otBooks = bookOrder.slice(0, 39);
    const ntBooks = bookOrder.slice(39);

    let otChapter = 1;
    let otBookIndex = 0;
    let ntChapter = 1;
    let ntBookIndex = 0;

    const plan = [];

    for (let day = 1; day <= 365; day++) {
        const readings = [];

        // OT Reading
        if (otBookIndex < otBooks.length) {
            const currentBook = otBooks[otBookIndex];
            readings.push(`${currentBook} ${otChapter}`);
            otChapter++;
            if (otChapter > chaptersInBook(currentBook)) {
                otBookIndex++;
                otChapter = 1;
            }
        }
        
        // NT Reading
        if (ntBookIndex < ntBooks.length) {
            const currentBook = ntBooks[ntBookIndex];
            readings.push(`${currentBook} ${ntChapter}`);
            ntChapter++;
            if (ntChapter > chaptersInBook(currentBook)) {
                ntBookIndex++;
                ntChapter = 1;
            }
        } else { // Loop NT if OT is not finished
            ntBookIndex = 0;
            ntChapter = 1;
            const currentBook = ntBooks[ntBookIndex];
            readings.push(`${currentBook} ${ntChapter}`);
            ntChapter++;
        }

        plan.push({
            day,
            reading: readings.join('; '),
            summary: `Lectura del día ${day} del plan anual.`
        });
    }
    return plan;
};


interface PassageVerse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export default function BibleInAYearPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const planDays = useMemo(() => generateClassicPlan(), []);

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
          Plan de la Biblia en un Año (Clásico)
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Lecturas diarias: Antiguo Testamento + Nuevo Testamento (1–3 capítulos al día). Perfecto si buscas una visión completa de la Escritura.
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
