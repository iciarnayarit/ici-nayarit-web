'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const planDays = [
  { day: 1, reading: 'Juan 1:1-18', summary: 'El Verbo se hizo carne; la introducción de Jesús como la luz y la vida del mundo.' },
  { day: 2, reading: 'Juan 1:19-34', summary: 'El testimonio de Juan el Bautista sobre Jesús, identificándolo como el Cordero de Dios.' },
  { day: 3, reading: 'Juan 1:35-51', summary: 'Los primeros discípulos siguen a Jesús, incluyendo a Andrés, Pedro, Felipe y Natanael.' },
  { day: 4, reading: 'Juan 2', summary: 'Jesús convierte el agua en vino en Caná y purifica el templo en Jerusalén.' },
  { day: 5, reading: 'Juan 3:1-21', summary: 'La conversación de Jesús con Nicodemo sobre nacer de nuevo y el famoso versículo de Juan 3:16.' },
  { day: 6, reading: 'Juan 3:22-36', summary: 'Juan el Bautista da un nuevo testimonio sobre la superioridad de Jesús.' },
  { day: 7, reading: 'Juan 4:1-42', summary: 'Jesús habla con la mujer samaritana en el pozo y le revela que Él es el Mesías.' },
  { day: 8, reading: 'Juan 4:43-54', summary: 'Jesús sana al hijo de un oficial del rey, demostrando su poder incluso a distancia.' },
  { day: 9, reading: 'Juan 5:1-23', summary: 'Jesús sana a un paralítico en el estanque de Betesda y habla de su autoridad divina.' },
  { day: 10, reading: 'Juan 5:24-47', summary: 'Jesús continúa su discurso sobre su relación con el Padre y el testimonio de las Escrituras.' },
  { day: 11, reading: 'Juan 6:1-21', summary: 'La alimentación de los cinco mil y Jesús caminando sobre el agua.' },
  { day: 12, reading: 'Juan 6:22-40', summary: 'Jesús se declara a sí mismo como el Pan de Vida.' },
  { day: 13, reading: 'Juan 6:41-71', summary: 'Muchos discípulos abandonan a Jesús, pero Pedro confiesa su fe en Él.' },
  { day: 14, reading: 'Juan 7:1-31', summary: 'Jesús enseña en la fiesta de los Tabernáculos y la gente debate sobre su identidad.' },
  { day: 15, reading: 'Juan 7:32-52', summary: 'Los líderes religiosos intentan arrestar a Jesús, mientras Él habla del Espíritu Santo.' },
  { day: 16, reading: 'Juan 8:1-30', summary: 'La mujer sorprendida en adulterio y Jesús como la luz del mundo.' },
  { day: 17, reading: 'Juan 8:31-59', summary: 'Jesús habla sobre la verdad que libera y su preexistencia antes de Abraham.' },
  { day: 18, reading: 'Juan 9', summary: 'Jesús sana a un hombre ciego de nacimiento, causando controversia entre los fariseos.' },
  { day: 19, reading: 'Juan 10:1-21', summary: 'La alegoría del buen pastor que da su vida por las ovejas.' },
  { day: 20, reading: 'Juan 10:22-42', summary: 'Jesús en la fiesta de la Dedicación, declarando su unidad con el Padre.' },
  { day: 21, reading: 'Juan 11:1-44', summary: 'La resurrección de Lázaro, una de las señales más poderosas de Jesús.' },
  { day: 22, reading: 'Juan 11:45-57', summary: 'El complot para matar a Jesús se intensifica después de la resurrección de Lázaro.' },
  { day: 23, reading: 'Juan 12:1-19', summary: 'María unge a Jesús en Betania y la entrada triunfal en Jerusalén.' },
  { day: 24, reading: 'Juan 12:20-50', summary: 'Jesús predice su muerte y habla de su propósito de glorificar a Dios.' },
  { day: 25, reading: 'Juan 13', summary: 'Jesús lava los pies de sus discípulos y les da un nuevo mandamiento de amarse unos a otros.' },
  { day: 26, reading: 'Juan 14', summary: 'Jesús consuela a sus discípulos y promete enviar al Espíritu Santo.' },
  { day: 27, reading: 'Juan 15', summary: 'La analogía de la vid y los pámpanos, y el llamado a permanecer en Cristo.' },
  { day: 28, reading: 'Juan 16', summary: 'Jesús advierte a sus discípulos sobre la persecución y les promete la guía del Espíritu.' },
  { day: 29, reading: 'Juan 17', summary: 'La oración de Jesús por sí mismo, por sus discípulos y por todos los creyentes.' },
  { day: 30, reading: 'Juan 18', summary: 'El arresto de Jesús y su juicio ante Anás, Caifás y Pilato.' },
  // Simple plan, for a real app, we'd continue through Juan 21
];


export default function ReadingPlanPage() {
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
          Viaje a través de Juan
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Completa el plan de lectura de 30 días para explorar la vida y las enseñanzas de Jesús.
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
