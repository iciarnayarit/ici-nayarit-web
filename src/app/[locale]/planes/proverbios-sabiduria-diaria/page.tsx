'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/[locale]/components/ui/card';
import { Progress } from '@/app/[locale]/components/ui/progress';
import { Button } from '@/app/[locale]/components/ui/button';
import { useRouter } from 'next/navigation';
import pr from '@/app/[locale]/lib/bible_rvr/prv.json';
import { CheckCircle2, Bookmark, Share2 } from 'lucide-react';
import { useToast } from '@/app/[locale]/hooks/use-toast';
import {Link} from '@/navigation';
import { allPlanData } from '@/lib/reading-plan-data';

const planDays = allPlanData['proverbios-sabiduria-diaria'];

interface SavedVerse {
  text: string;
  reference: string;
}

export default function ProverbiosPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const { toast } = useToast();
  const router = useRouter();

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

  const handleSaveVerse = (verseText: string, verseNumber: number, chapter: number) => {
    const reference = `Proverbios ${chapter}:${verseNumber}`;
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

  const handleShareVerse = async (verseText: string, verseNumber: number, chapter: number) => {
    const reference = `Proverbios ${chapter}:${verseNumber}`;
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

  if (selectedDay) {
    const dayData = planDays.find(d => d.day === selectedDay);
    if (!dayData) return null;

    const chapterVerses = (pr as any).chapters?.[selectedDay - 1] || [];

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
              {chapterVerses.map((verse: string, index: number) => {
                const verseNumber = index + 1;
                const reference = `Proverbios ${selectedDay}:${verseNumber}`;
                const isSaved = savedVerses.some(v => v.reference === reference);
                return (
                  <div key={index} className="flex items-start gap-2">
                    <p className="flex-grow">
                      <sup className="font-bold mr-2">{verseNumber}</sup>
                      {verse}
                    </p>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareVerse(verse, verseNumber, selectedDay)}
                    >
                        <Share2 className="h-6 w-6 text-gray-400" />
                        <span className="sr-only">Compartir versículo</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveVerse(verse, verseNumber, selectedDay)}
                    >
                        <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current text-black' : 'text-gray-400'}`} />
                        <span className="sr-only">Guardar versículo</span>
                    </Button>
                  </div>
                );
              })}
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
          Proverbios: Una Dosis Diaria de Sabiduría
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Completa el plan de lectura de 31 días para obtener sabiduría práctica para la vida diaria.
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
