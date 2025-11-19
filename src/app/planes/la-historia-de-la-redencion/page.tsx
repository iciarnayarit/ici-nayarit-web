'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const planDays = [
    { day: 1, reading: 'Génesis 1-3', summary: 'La creación del mundo y la caída del hombre.' },
    { day: 2, reading: 'Génesis 12:1-9; 15:1-6', summary: 'El llamado de Abram y el pacto de Dios con él.' },
    { day: 3, reading: 'Éxodo 12-14', summary: 'La Pascua y el cruce del Mar Rojo.' },
    { day: 4, reading: 'Éxodo 19-20', summary: 'Dios entrega los Diez Mandamientos en el Monte Sinaí.' },
    { day: 5, reading: 'Levítico 16', summary: 'Instrucciones para el Día de la Expiación.' },
    { day: 6, reading: 'Números 13-14', summary: 'Los espías exploran Canaán y la rebelión de Israel.' },
    { day: 7, reading: 'Deuteronomio 6; 30:11-20', summary: 'El gran mandamiento de amar a Dios y la elección entre la vida y la muerte.' },
    { day: 8, reading: 'Josué 1; 24', summary: 'Josué lidera a Israel y el pueblo renueva el pacto.' },
    { day: 9, reading: 'Jueces 2:6-23; 6-7', summary: 'El ciclo de desobediencia de Israel y la historia de Gedeón.' },
    { day: 10, reading: '1 Samuel 16-17', summary: 'David es ungido rey y derrota a Goliat.' },
    { day: 11, reading: '2 Samuel 7; 11-12', summary: 'El pacto de Dios con David y su pecado con Betsabé.' },
    { day: 12, reading: '1 Reyes 8; 18', summary: 'La dedicación del templo de Salomón y el enfrentamiento de Elías con los profetas de Baal.' },
    { day: 13, reading: '2 Reyes 17; 25', summary: 'La caída de Israel y Judá.' },
    { day: 14, reading: 'Job 1-2; 42', summary: 'El sufrimiento de Job y su restauración.' },
    { day: 15, reading: 'Salmos 1; 23; 51', summary: 'Poemas de sabiduría, confianza y arrepentimiento.' },
    { day: 16, reading: 'Proverbios 1-3', summary: 'La búsqueda de la sabiduría.' },
    { day: 17, reading: 'Isaías 1; 9:1-7', summary: 'Un llamado al arrepentimiento y la profecía del nacimiento de un niño que será Rey.' },
    { day: 18, reading: 'Isaías 52:13-53:12', summary: 'La profecía del Siervo Sufriente.' },
    { day: 19, reading: 'Jeremías 1; 31:31-34', summary: 'El llamado de Jeremías y la promesa de un nuevo pacto.' },
    { day: 20, reading: 'Ezequiel 36:22-38; 37', summary: 'La promesa de un corazón nuevo y el valle de los huesos secos.' },
    { day: 21, reading: 'Daniel 7; 9', summary: 'Las visiones de Daniel y su oración por su pueblo.' },
    { day: 22, reading: 'Mateo 1-2; Lucas 1-2', summary: 'El nacimiento de Jesús.' },
    { day: 23, reading: 'Mateo 5-7', summary: 'El Sermón del Monte.' },
    { day: 24, reading: 'Juan 1; 3', summary: 'El Verbo se hizo carne y la conversación de Jesús con Nicodemo.' },
    { day: 25, reading: 'Romanos 3-5', summary: 'La justificación por la fe.' },
    { day: 26, reading: 'Romanos 8', summary: 'La vida en el Espíritu.' },
    { day: 27, reading: 'Gálatas 5', summary: 'La libertad en Cristo y el fruto del Espíritu.' },
    { day: 28, reading: 'Efesios 1-2', summary: 'Las bendiciones espirituales en Cristo y la salvación por gracia.' },
    { day: 29, reading: 'Hebreos 11-12', summary: 'La fe y la perseverancia.' },
    { day: 30, reading: 'Apocalipsis 1; 21-22', summary: 'La visión de Juan y la promesa de un cielo nuevo y una tierra nueva.' },
  ];

export default function RedemptionStoryPlanPage() {
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
          La Historia de la Redención
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Sigue la gran narrativa de la Biblia desde Génesis hasta Apocalipsis en este plan de 30 días.
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
