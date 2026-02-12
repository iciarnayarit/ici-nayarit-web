'use client';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useToast } from '@/app/hooks/use-toast';
import { bibleData } from '@/lib/bible-data';
import { allPlanData } from '@/lib/reading-plan-data';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bookmark, Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const plans = [
  {
    id: '1',
    titleKey: 'Amor',
    descriptionKey: 'Explora lo que la Biblia dice sobre el amor en este plan.',
    imageUrl: 'https://i.imgur.com/uNso09D.png',
    slug: 'amor'
  },
  {
    id: '2',
    titleKey: 'Ansiedad',
    descriptionKey: 'Encuentra paz y consuelo en la palabra de Dios cuando te sientas ansioso.',
    imageUrl: 'https://i.imgur.com/SUnm3Ek.png',
    slug: 'ansiedad'
  },
  {
    id: '3',
    titleKey: 'Sanidad',
    descriptionKey: 'Descubre el poder de Dios para sanar tu corazón, mente y cuerpo.',
    imageUrl: 'https://i.imgur.com/PAwKtCw.png',
    slug: 'sanidad'
  },
  {
    id: '4',
    titleKey: 'Enojo',
    descriptionKey: 'Aprende a lidiar con el enojo de una manera saludable y bíblica.',
    imageUrl: 'https://i.imgur.com/wYQR2K9.jpeg',
    slug: 'enojo'
  },
  {
    id: '5',
    titleKey: 'Esperanza',
    descriptionKey: 'Encuentra esperanza en las promesas de Dios, sin importar lo que estés enfrentando.',
    imageUrl: 'https://i.imgur.com/s1Wj9dh.png',
    slug: 'esperanza'
  },
  {
    id: '6',
    titleKey: 'Territorio de Fe',
    descriptionKey: 'Un plan para fortalecer tu fe.',
    imageUrl: 'https://i.imgur.com/6MKV0Rz.png',
    slug: 'territorio-de-fe'
  },
  {
    id: '7',
    titleKey: 'Isaías: Esforzándose Menos y Confiando en Dios',
    descriptionKey: 'Aprende a confiar en Dios y a descansar en su soberanía.',
    imageUrl: 'https://i.imgur.com/MGDweky.jpeg',
    slug: 'isaias-esforzandose-menos'
  },
  {
    id: '8',
    titleKey: 'Salvación: Un Estudio en Isaías',
    descriptionKey: 'Profundiza en el tema de la salvación en el libro de Isaías.',
    imageUrl: 'https://i.imgur.com/mudqr7s.png',
    slug: 'salvacion-un-estudio-en-isaias'
  },
  {
    id: '9',
    titleKey: 'Inmersión en Isaías',
    descriptionKey: 'Sumérgete en la riqueza teológica y profética de Isaías.',
    imageUrl: 'https://i.imgur.com/HhxFX0O.jpeg',
    slug: 'inmersion-en-isaias'
  },
  {
    id: '10',
    titleKey: 'Lee y Absorbe Isaías en Cinco Días',
    descriptionKey: 'Un plan intensivo para sumergirte en el libro de Isaías.',
    imageUrl: 'https://i.imgur.com/1zzId1r.png',
    slug: 'lee-y-absorbe-isaias-en-cinco-dias'
  },
  {
    id: '11',
    titleKey: 'A Través de la Biblia: Isaías',
    descriptionKey: 'Un recorrido completo por el libro de Isaías.',
    imageUrl: 'https://i.imgur.com/4lrUcm9.jpeg',
    slug: 'a-traves-de-la-biblia-isaias'
  },
  {
    id: '12',
    titleKey: 'Sobre Esta Roca',
    descriptionKey: 'Un estudio sobre la iglesia y su fundamento en Cristo.',
    imageUrl: 'https://i.imgur.com/7yNe695.jpeg',
    slug: 'sobre-esta-roca'
  },
  {
    id: '13',
    titleKey: 'Cuaresma 2026 | Viaje Guiado a través de Mateo y Salmos',
    descriptionKey: 'Un plan de lectura para la Cuaresma.',
    imageUrl: 'https://i.imgur.com/4lrUcm9.jpeg',
    slug: 'cuaresma-2026-mateo-y-salmos'
  },
  {
    id: '14',
    titleKey: 'Los Milagros de Jesús',
    descriptionKey: 'Descubre el poder y la compasión de Jesús a través de sus milagros.',
    imageUrl: 'https://i.imgur.com/vU2lVVf.jpeg',
    slug: 'los-milagros-de-jesus'
  },
  {
    id: '15',
    titleKey: 'La Epifanía de Cristo',
    descriptionKey: 'Un plan para reflexionar sobre la manifestación de Cristo al mundo.',
    imageUrl: 'https://i.imgur.com/s1Wj9dh.png',
    slug: 'la-epifania-de-cristo'
  },
  {
    id: '16',
    titleKey: 'Proyecto Bíblico | Cómo Buscar el Reino',
    descriptionKey: 'Aprende a buscar el reino de Dios en tu vida diaria.',
    imageUrl: 'https://i.imgur.com/4lrUcm9.jpeg',
    slug: 'proyecto-biblico-como-buscar-el-reino'
  },
  {
    id: '17',
    titleKey: 'Tierra Santa',
    descriptionKey: 'Un viaje virtual por los lugares santos de la Biblia.',
    imageUrl: 'https://i.imgur.com/41hK38Z.jpeg',
    slug: 'tierra-santa'
  },
  {
    id: '18',
    titleKey: 'De Estéril a Fructífero',
    descriptionKey: 'Descubre cómo Dios puede traer fruto a tu vida.',
    imageUrl: 'https://i.imgur.com/Q4JOPWm.png',
    slug: 'de-esteril-a-fructifero'
  },
  {
    id: '19',
    titleKey: 'UNCOMMEN: Corazones Ansiosos',
    descriptionKey: 'Un plan para hombres sobre cómo lidiar con la ansiedad.',
    imageUrl: 'https://i.imgur.com/t7lYtDk.png',
    slug: 'uncommen-corazones-ansiosos'
  },
  {
    id: '36',
    titleKey: 'Viaje a través de Juan',
    descriptionKey: 'Explora la vida y las enseñanzas de Jesús en este plan de 30 días.',
    imageUrl: 'https://images.unsplash.com/photo-1603284569248-821525309698?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxyZWFkaW5nJTIwYm9va3xlbnwwfHx8fDE3NjM1ODc0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'viaje-a-traves-de-juan'
  },
  {
    id: '37',
    titleKey: 'Proverbios: Una Dosis Diaria de Sabiduría',
    descriptionKey: 'Obtén sabiduría práctica para la vida diaria con un capítulo de Proverbios cada día.',
    imageUrl: 'https://images.unsplash.com/photo-1646598990880-cb5b64582f2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxiaWJsZSUyMHRhYmxlfGVufDB8fHx8MTc2MzU4NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'proverbios-sabiduria-diaria'
  },
  {
    id: '38',
    titleKey: 'La Historia de la Redención',
    descriptionKey: 'Sigue la gran narrativa de la Biblia desde Génesis hasta Apocalipsis.',
    imageUrl: 'https://images.unsplash.com/photo-1692685820393-fcf174d59b2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBqb3VybmV5fGVufDB8fHx8MTc2MzU4NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'la-historia-de-la-redencion'
  },
  {
    id: '39',
    titleKey: 'Plan de la Biblia en un Año (Clásico)',
    descriptionKey: 'Lecturas diarias: Antiguo Testamento + Nuevo Testamento (1–3 capítulos al día).',
    imageUrl: 'https://i.imgur.com/mm2tx3n.png',
    slug: 'biblia-en-un-ano-clasico'
  },
  {
    id: '40',
    titleKey: 'Plan Cronológico',
    descriptionKey: 'Ordena los eventos tal como ocurrieron históricamente.',
    imageUrl: 'https://i.imgur.com/YWlQCbQ.png',
    slug: 'plan-cronologico'
  },
  {
    id: '41',
    titleKey: 'Plan de “Un Evangelio al Mes”',
    descriptionKey: 'Fortalece tu relación con Jesús y tu comprensión de su ministerio.',
    imageUrl: 'https://i.imgur.com/ASc0Xj0.png',
    slug: 'un-evangelio-al-mes'
  },
  {
    id: '42',
    titleKey: 'Plan Temático',
    descriptionKey: 'Cada mes un tema: Fe, Oración, El Espíritu Santo, La iglesia, Sabiduría, Evangelismo.',
    imageUrl: 'https://i.imgur.com/XWW0el7.jpeg',
    slug: 'plan-tematico'
  },
  {
    id: '43',
    titleKey: 'Salmos en 150 Días',
    descriptionKey: 'Un salmo por día. Perfecto para fortalecer la oración y la adoración.',
    imageUrl: 'https://i.imgur.com/Ttvfam9.png',
    slug: 'salmos-en-150-dias'
  },
  {
    id: '44',
    titleKey: 'Nuevo Testamento en 90 Días',
    descriptionKey: 'Un ritmo excelente para nuevos creyentes o grupos de estudio. Lectura diaria: 3 capítulos.',
    imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
    slug: 'nuevo-testamento-en-90-dias'
  },
  {
    id: '45',
    titleKey: 'Antiguo Testamento en 180 Días',
    descriptionKey: 'Lectura profunda pero alcanzable. Muy útil para liderazgo y discipulado.',
    imageUrl: 'https://i.imgur.com/XhKVju1.png',
    slug: 'antiguo-testamento-en-180-dias'
  },
  {
    id: '46',
    titleKey: 'Plan “Toda la Biblia con Jesús en el Centro”',
    descriptionKey: 'Un plan cristocéntrico. Lecturas que conectan directamente con la obra de Cristo.',
    imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
    slug: 'toda-la-biblia-con-jesus-en-el-centro'
  },
  {
    id: '47',
    titleKey: '10 Días para Renovar tu Fe',
    descriptionKey: 'Este plan de 10 días te guía por pasajes clave del Antiguo y del Nuevo Testamento para fortalecer tu relación con Dios, renovar tu mente y profundizar en tu vida espiritual. A través de los Evangelios, Salmos, Proverbios, Hechos y las cartas apostólicas, experimentarás un recorrido equilibrado que combina enseñanza, sabiduría, adoración y crecimiento práctico en Cristo. Es un plan perfecto para reiniciar tu vida devocional, comenzar un nuevo hábito o compartirlo con tu familia o grupo de estudio.',
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
        description: `Has eliminado el plan "${plan.titleKey}" de tus guardados.`})
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
    <section id="plans" className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl">
            Planes de Lectura y Devocionales
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Crece en tu fe con planes que se ajustan a tu vida.
          </p>
          <div className="mt-4">
            <Link href="/planes/guardados">
              <Button>Planes Guardados</Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isSaved = savedPlans.includes(plan.id);
            const button = (
              <Button variant="outline" className="w-full">Comenzar Plan</Button>
            );
            return (
              <Card key={plan.id} className="flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative h-48 w-full">
                  <Image
                    src={plan.imageUrl}
                    alt={plan.titleKey}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/50 hover:bg-white/75"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPlan(plan);
                      }}
                    >
                      <Download className="h-6 w-6 text-black" />
                      <span className="sr-only">Descargar Plan</span>
                    </Button> */}
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
                      <span className="sr-only">Compartir plan</span>
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
                  <CardTitle className="font-headline">{plan.titleKey}</CardTitle>
                  <CardDescription>{plan.descriptionKey}</CardDescription>
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
