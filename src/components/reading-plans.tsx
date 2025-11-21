'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bookmark } from 'lucide-react';

const plans = [
  {
    id: '1',
    title: 'Viaje a través de Juan',
    description: 'Explora la vida y las enseñanzas de Jesús en este plan de 30 días.',
    imageUrl: 'https://images.unsplash.com/photo-1603284569248-821525309698?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxyZWFkaW5nJTIwYm9va3xlbnwwfHx8fDE3NjM1ODc0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'viaje-a-traves-de-juan'
  },
  {
    id: '2',
    title: 'Proverbios: Una Dosis Diaria de Sabiduría',
    description: 'Obtén sabiduría práctica para la vida diaria con un capítulo de Proverbios cada día.',
    imageUrl: 'https://images.unsplash.com/photo-1646598990880-cb5b64582f2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxiaWJsZSUyMHRhYmxlfGVufDB8fHx8MTc2MzU4NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'proverbios-sabiduria-diaria'
  },
  {
    id: '3',
    title: 'La Historia de la Redención',
    description: 'Sigue la gran narrativa de la Biblia desde Génesis hasta Apocalipsis.',
    imageUrl: 'https://images.unsplash.com/photo-1692685820393-fcf174d59b2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBqb3VybmV5fGVufDB8fHx8MTc2MzU4NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    slug: 'la-historia-de-la-redencion'
  },
  {
    id: '4',
    title: 'Plan de la Biblia en un Año (Clásico)',
    description: 'Lecturas diarias: Antiguo Testamento + Nuevo Testamento (1–3 capítulos al día).',
    imageUrl: 'https://i.imgur.com/mm2tx3n.png',
    slug: 'biblia-en-un-ano-clasico'
  },
  {
    id: '5',
    title: 'Plan Cronológico',
    description: 'Ordena los eventos tal como ocurrieron históricamente.',
    imageUrl: 'https://i.imgur.com/YWlQCbQ.png',
    slug: 'plan-cronologico'
  },
  {
    id: '6',
    title: 'Plan de “Un Evangelio al Mes”',
    description: 'Fortalece tu relación con Jesús y tu comprensión de su ministerio.',
    imageUrl: 'https://i.imgur.com/ASc0Xj0.png',
    slug: 'un-evangelio-al-mes'
  },
  {
    id: '7',
    title: 'Plan Temático',
    description: 'Cada mes un tema: Fe, Oración, El Espíritu Santo, La iglesia, Sabiduría, Evangelismo.',
    imageUrl: 'https://i.imgur.com/XWW0el7.jpeg',
    slug: 'plan-tematico'
  },
  {
    id: '8',
    title: 'Salmos en 150 Días',
    description: 'Un salmo por día. Perfecto para fortalecer la oración y la adoración.',
    imageUrl: 'https://i.imgur.com/Ttvfam9.png',
    slug: 'salmos-en-150-dias'
  },
  {
    id: '9',
    title: 'Nuevo Testamento en 90 Días',
    description: 'Un ritmo excelente para nuevos creyentes o grupos de estudio. Lectura diaria: 3 capítulos.',
    imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
    slug: 'nuevo-testamento-en-90-dias'
  },
  {
    id: '10',
    title: 'Antiguo Testamento en 180 Días',
    description: 'Lectura profunda pero alcanzable. Muy útil para liderazgo y discipulado.',
    imageUrl: 'https://i.imgur.com/XhKVju1.png',
    slug: 'antiguo-testamento-en-180-dias'
  },
  {
    id: '11',
    title: 'Plan “Toda la Biblia con Jesús en el Centro”',
    description: 'Un plan cristocéntrico. Lecturas que conectan directamente con la obra de Cristo.',
    imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
    slug: 'toda-la-biblia-con-jesus-en-el-centro'
  },
  {
    id: '12',
    title: '10 Días para Renovar tu Fe',
    description: 'Este plan de 10 días te guía por pasajes clave del Antiguo y del Nuevo Testamento para fortalecer tu relación con Dios, renovar tu mente y profundizar en tu vida espiritual. A través de los Evangelios, Salmos, Proverbios, Hechos y las cartas apostólicas, experimentarás un recorrido equilibrado que combina enseñanza, sabiduría, adoración y crecimiento práctico en Cristo. Es un plan perfecto para reiniciar tu vida devocional, comenzar un nuevo hábito o compartirlo con tu familia o grupo de estudio.',
    imageUrl: 'https://i.imgur.com/pIdxDkl.jpeg',
    slug: '10-dias-para-renovar-tu-fe'
  }
];

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
        description: `Has eliminado el plan "${plan.title}" de tus guardados.`,
      });
    } else {
      updatedSavedPlans = [...savedPlans, plan.id];
      toast({
        title: "Plan Guardado",
        description: `Has guardado el plan "${plan.title}".`,
      });
    }
    setSavedPlans(updatedSavedPlans);
    const fullSavedPlans = plans.filter(p => updatedSavedPlans.includes(p.id));
    localStorage.setItem('savedPlans', JSON.stringify(fullSavedPlans));
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
              <Button>Ver Planes Guardados</Button>
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
                    alt={plan.title}
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/50 hover:bg-white/75"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSavePlan(plan);
                    }}
                  >
                    <Bookmark className={`h-6 w-6 text-black ${isSaved ? 'fill-current' : ''}`} />
                    <span className="sr-only">Guardar plan</span>
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="font-headline">{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
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
