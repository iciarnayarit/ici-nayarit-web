'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const planDays = [
  { day: 1, reading: 'Génesis 1-3' },
  { day: 2, reading: 'Génesis 12:1-9; 15:1-6' },
  { day: 3, reading: 'Éxodo 12-14' },
  { day: 4, reading: 'Éxodo 19-20' },
  { day: 5, reading: 'Levítico 16' },
  { day: 6, reading: 'Números 13-14' },
  { day: 7, reading: 'Deuteronomio 6; 30:11-20' },
  { day: 8, reading: 'Josué 1; 24' },
  { day: 9, reading: 'Jueces 2:6-23; 6-7' },
  { day: 10, reading: '1 Samuel 16-17' },
  { day: 11, reading: '2 Samuel 7; 11-12' },
  { day: 12, reading: '1 Reyes 8; 18' },
  { day: 13, reading: '2 Reyes 17; 25' },
  { day: 14, reading: 'Job 1-2; 42' },
  { day: 15, reading: 'Salmos 1; 23; 51' },
  { day: 16, reading: 'Proverbios 1-3' },
  { day: 17, reading: 'Isaías 1; 9:1-7' },
  { day: 18, reading: 'Isaías 52:13-53:12' },
  { day: 19, reading: 'Jeremías 1; 31:31-34' },
  { day: 20, reading: 'Ezequiel 36:22-38; 37' },
  { day: 21, reading: 'Daniel 7; 9' },
  { day: 22, reading: 'Mateo 1-2; Lucas 1-2' },
  { day: 23, reading: 'Mateo 5-7' },
  { day: 24, reading: 'Juan 1; 3' },
  { day: 25, reading: 'Romanos 3-5' },
  { day: 26, reading: 'Romanos 8' },
  { day: 27, reading: 'Gálatas 5' },
  { day: 28, reading: 'Efesios 1-2' },
  { day: 29, reading: 'Hebreos 11-12' },
  { day: 30, reading: 'Apocalipsis 1; 21-22' },
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
            <div className="space-y-4">
              {planDays.map((item) => (
                <div
                  key={item.day}
                  className={`flex items-center space-x-4 p-3 rounded-md transition-colors ${
                    completedDays.includes(item.day) ? 'bg-accent/50' : ''
                  }`}
                >
                  <Checkbox
                    id={`day-${item.day}`}
                    checked={completedDays.includes(item.day)}
                    onCheckedChange={() => toggleDay(item.day)}
                  />
                  <label
                    htmlFor={`day-${item.day}`}
                    className={`flex-1 cursor-pointer ${
                      completedDays.includes(item.day) ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    <span className="font-bold">Día {item.day}:</span> {item.reading}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
