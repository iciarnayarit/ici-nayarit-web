'use client';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useToast } from '@/app/hooks/use-toast';
import { bibleData, handleReadPassage } from '@/lib/bible-data';
import { allPlanData, plans } from '@/lib/reading-plan-data';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bookmark, Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';


interface PassageVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export default function ReadingPlans() {
  const { toast } = useToast();
  const [savedPlans, setSavedPlans] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedPlans');
    if (saved) {
      setSavedPlans(JSON.parse(saved).map((p: any) => p.id));
    }
  }, []);

  const handleSavePlan = (plan: typeof plans[0]) => {
    let updatedSavedPlans = [];
    if (savedPlans.includes(plan.id)) {
      updatedSavedPlans = savedPlans.filter(id => id !== plan.id);
      toast({
        title: "Plan Eliminado",
        description: `Has eliminado el plan "${plan.titleKey}" de tus guardados.`
      })
    } else {
      updatedSavedPlans = [...savedPlans, plan.id];
      toast({
        title: "Plan Guardado",
        description: `Has guardado el plan "${plan.titleKey}".`,
      });
    }
    setSavedPlans(updatedSavedPlans);
    const fullSavedPlans = plans.filter(p => updatedSavedPlans.includes(p.id));
    localStorage.setItem('savedPlans', JSON.stringify(fullSavedPlans));
  };

  const handleSharePlan = async (plan: typeof plans[0]) => {
    const url = `${window.location.origin}/planes/${plan.slug}`;
    const textToShare = `¡Echa un vistazo a este plan de lectura de la Biblia: ${plan.titleKey}!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: plan.titleKey,
          text: textToShare,
          url: url,
        });
        toast({
          title: "Plan Compartido",
          description: "El plan de lectura ha sido compartido.",
        });
      } catch (error: any) {
        if (error.message !== 'Share canceled') {
          console.error('Error al compartir:', error);
          toast({
            title: "Error",
            description: "No se pudo compartir el plan.",
            variant: "destructive",
          });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${textToShare} ${url}`);
        toast({
          title: "Enlace Copiado",
          description: "El enlace al plan ha sido copiado al portapapeles.",
        });
      } catch (error) {
        console.error('Error al copiar:', error);
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace.",
          variant: "destructive",
        });
      }
    }
  };


  const handleDownloadPlan = (plan: typeof plans[0]) => {
    const doc = new jsPDF();
    const planData = allPlanData[plan.slug];

    doc.text(plan.titleKey, 10, 10);
    doc.text(plan.descriptionKey, 10, 20);

    if (planData) {
      const tableData = planData.map(day => {
        const verses = handleReadPassage(day.reading);
        const verseText = verses.map(v => `${v.chapter}:${v.verse} ${v.text}`).join('\n');
        return [day.day, day.reading, verseText];
      });

      autoTable(doc, {
        head: [['Día', 'Lectura', 'Texto']],
        body: tableData,
        startY: 30,
      });
    }

    doc.save(`${plan.slug}.pdf`);
  };

  return (
    <section id="plans" className="py-20 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-[#B88A44] mb-2 italic">
            Planes de Lectura y Devocionales
          </h2>
          <p className="text-lg text-gray-500 font-light">
            Crece en tu fe con planes que se ajustan a tu vida.
          </p>
          <div className="mt-8">
            <Link href="/planes/guardados">
              <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm">Planes Guardados</Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isSaved = savedPlans.includes(plan.id);
            const button = (
              <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm w-full">Comenzar Plan</Button>
            );
            return (
              <Card key={plan.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300 flex flex-col">
                <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={plan.imageUrl}
                    alt={plan.titleKey}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/50 hover:bg-white/75 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSharePlan(plan);
                      }}
                    >
                      <Share2 className="h-5 w-5 text-black" />
                      <span className="sr-only">Compartir plan</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/50 hover:bg-white/75 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSavePlan(plan);
                      }}
                    >
                      <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current text-[#B88A44]' : 'text-black'}`} />
                      <span className="sr-only">Guardar plan</span>
                    </Button>
                  </div>
                </div>
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="font-display text-xl font-bold text-[#B88A44] mb-2">{plan.titleKey}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">{plan.descriptionKey}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-0"></CardContent>
                <CardFooter className="p-0 mt-auto">
                  {plan.slug ? (
                    <Link href={`/planes/${plan.slug}`} className="w-full">
                      {button}
                    </Link>
                  ) : (
                    button
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
