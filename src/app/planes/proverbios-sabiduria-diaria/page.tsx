'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const planDays = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  reading: `Proverbios ${i + 1}`,
  summary: `Un capítulo de sabiduría para guiar tu día, abordando temas de justicia, prudencia y vida recta. El capítulo ${i+1} ofrece consejos prácticos para las relaciones, el trabajo y la integridad personal.`,
}));

export default function ProverbiosPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  const toggleDay = (day: number) => {
    setCompletedDays(
      completedDays.includes(day)
        ? completedDays.filter((d) => d !== day)
        : [...completedDays, day]
    );
  };

  const progressPercentage = (completedDays.length / planDays.length) * 100;

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="max-w-3xl mx-auto">
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

        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {planDays.map((item) => (
                <AccordionItem value={`item-${item.day}`} key={item.day}>
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id={`day-${item.day}`}
                      checked={completedDays.includes(item.day)}
                      onCheckedChange={(e) => {
                          e.stopPropagation();
                          toggleDay(item.day);
                        }}
                      className="mt-4"
                    />
                    <AccordionTrigger className="flex-1">
                      <label
                        htmlFor={`day-${item.day}`}
                        className={`cursor-pointer ${
                          completedDays.includes(item.day) ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        <span className="font-bold">Día {item.day}:</span> {item.reading}
                      </label>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="pl-12 space-y-4">
                    <p>{item.summary}</p>
                    <Link href="/biblia" className="text-primary hover:underline">
                      Leer el pasaje completo
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
