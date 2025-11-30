'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {Link} from '@/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/[locale]/components/ui/card';
import { Button } from '@/app/[locale]/components/ui/button';
import { useToast } from '@/app/[locale]/hooks/use-toast';
import { Bookmark, Share2, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { allPlanData } from '@/lib/reading-plan-data';
import { bibleData } from '@/lib/bible-data';

const plans = [
  {
    id: '1',
    titleKey: 'plan_1_title',
    descriptionKey: 'plan_1_description',
    imageUrl: 'https://images.unsplash.com/photo-1603284569248-821525309698?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxyZWFkaW5nJTIwYm9va3xlbnwwfHx8fDE3NjM1ODc0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'viaje-a-traves-de-juan'
  },
  {
    id: '2',
    titleKey: 'plan_2_title',
    descriptionKey: 'plan_2_description',
    imageUrl: 'https://images.unsplash.com/photo-1646598990880-cb5b64582f2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxiaWJsZSUyMHRhYmxlfGVufDB8fHx8MTc2MzU4NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'proverbios-sabiduria-diaria'
  },
  {
    id: '3',
    titleKey: 'plan_3_title',
    descriptionKey: 'plan_3_description',
    imageUrl: 'https://images.unsplash.com/photo-1692685820393-fcf174d59b2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBqb3VybmV5fGVufDB8fHx8MTc2MzU4NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'la-historia-de-la-redencion'
  },
  {
    id: '4',
    titleKey: 'plan_4_title',
    descriptionKey: 'plan_4_description',
    imageUrl: 'https://i.imgur.com/mm2tx3n.png',
    slug: 'biblia-en-un-ano-clasico'
  },
  {
    id: '5',
    titleKey: 'plan_5_title',
    descriptionKey: 'plan_5_description',
    imageUrl: 'https://i.imgur.com/YWlQCbQ.png',
    slug: 'plan-cronologico'
  },
  {
    id: '6',
    titleKey: 'plan_6_title',
    descriptionKey: 'plan_6_description',
    imageUrl: 'https://i.imgur.com/ASc0Xj0.png',
    slug: 'un-evangelio-al-mes'
  },
  {
    id: '7',
    titleKey: 'plan_7_title',
    descriptionKey: 'plan_7_description',
    imageUrl: 'https://i.imgur.com/XWW0el7.jpeg',
    slug: 'plan-tematico'
  },
  {
    id: '8',
    titleKey: 'plan_8_title',
    descriptionKey: 'plan_8_description',
    imageUrl: 'https://i.imgur.com/Ttvfam9.png',
    slug: 'salmos-en-150-dias'
  },
  {
    id: '9',
    titleKey: 'plan_9_title',
    descriptionKey: 'plan_9_description',
    imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
    slug: 'nuevo-testamento-en-90-dias'
  },
  {
    id: '10',
    titleKey: 'plan_10_title',
    descriptionKey: 'plan_10_description',
    imageUrl: 'https://i.imgur.com/XhKVju1.png',
    slug: 'antiguo-testamento-en-180-dias'
  },
  {
    id: '11',
    titleKey: 'plan_11_title',
    descriptionKey: 'plan_11_description',
    imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
    slug: 'toda-la-biblia-con-jesus-en-el-centro'
  },
  {
    id: '12',
    titleKey: 'plan_12_title',
    descriptionKey: 'plan_12_description',
    imageUrl: 'https://i.imgur.com/pIdxDkl.jpeg',
    slug: '10-dias-para-renovar-tu-fe'
  }
];

interface PassageVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export default function ReadingPlans() {
  const { toast } = useToast();
  const [savedPlans, setSavedPlans] = useState<string[]>([]);
  const t = useTranslations('ReadingPlans');

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
        title: t('plan_deleted'),
        description: t('plan_deleted_desc', {planTitle: t(plan.titleKey)}),
      });
    } else {
      updatedSavedPlans = [...savedPlans, plan.id];
      toast({
        title: t('plan_saved'),
        description: t('plan_saved_desc', {planTitle: t(plan.titleKey)}),
      });
    }
    setSavedPlans(updatedSavedPlans);
    const fullSavedPlans = plans.filter(p => updatedSavedPlans.includes(p.id));
    localStorage.setItem('savedPlans', JSON.stringify(fullSavedPlans));
  };

  const handleSharePlan = async (plan: typeof plans[0]) => {
    const url = `${window.location.origin}/planes/${plan.slug}`;
    const textToShare = `¡Echa un vistazo a este plan de lectura de la Biblia: "${t(plan.titleKey)}"!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t(plan.titleKey),
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
          title: t('link_copied'),
          description: t('link_copied_desc'),
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

  const handleReadPassage = (reading: string): PassageVerse[] => {
    const allVerses: PassageVerse[] = [];
    let currentBookKey = '';
  
    const references = reading.split(';').map(r => r.trim());
  
    for (const ref of references) {
      let passage = ref;
      const bookMatch = ref.match(/^(\d?\s?[a-zA-Záéíóúñ]+(?:\sde\slos\s[a-zA-Záéíóúñ]+)?)\s/);
  
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

  const handleDownloadPlan = (plan: typeof plans[0]) => {
    const doc = new jsPDF();
    const planData = allPlanData[plan.slug];

    doc.text(t(plan.titleKey), 10, 10);
    doc.text(t(plan.descriptionKey), 10, 20);

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
    <section id="plans" className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('description')}
          </p>
          <div className="mt-4">
            <Link href="/planes/guardados">
              <Button>{t('view_saved_plans')}</Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isSaved = savedPlans.includes(plan.id);
            const button = (
              <Button variant="outline" className="w-full">{t('start_plan')}</Button>
            );
            return (
              <Card key={plan.id} className="flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative h-48 w-full">
                  <Image
                    src={plan.imageUrl}
                    alt={t(plan.titleKey)}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/50 hover:bg-white/75"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPlan(plan);
                      }}
                    >
                      <Download className="h-6 w-6 text-black" />
                      <span className="sr-only">{t('download_plan')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/50 hover:bg-white/75"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSharePlan(plan);
                      }}
                    >
                      <Share2 className="h-6 w-6 text-black" />
                      <span className="sr-only">{t('share_plan')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/50 hover:bg-white/75"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSavePlan(plan);
                      }}
                    >
                      <Bookmark className={`h-6 w-6 text-black ${isSaved ? 'fill-current' : ''}`} />
                      <span className="sr-only">Guardar plan</span>
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="font-headline">{t(plan.titleKey)}</CardTitle>
                  <CardDescription>{t(plan.descriptionKey)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow"></CardContent>
                <CardFooter>
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
