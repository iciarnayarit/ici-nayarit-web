'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const planDays = [
  { day: 1, reading: 'Juan 1:1-18' },
  { day: 2, reading: 'Juan 1:19-34' },
  { day: 3, reading: 'Juan 1:35-51' },
  { day: 4, reading: 'Juan 2' },
  { day: 5, reading: 'Juan 3:1-21' },
  { day: 6, reading: 'Juan 3:22-36' },
  { day: 7, reading: 'Juan 4:1-42' },
  { day: 8, reading: 'Juan 4:43-54' },
  { day: 9, reading: 'Juan 5:1-23' },
  { day: 10, reading: 'Juan 5:24-47' },
  { day: 11, reading: 'Juan 6:1-21' },
  { day: 12, reading: 'Juan 6:22-40' },
  { day: 13, reading: 'Juan 6:41-71' },
  { day: 14, reading: 'Juan 7:1-31' },
  { day: 15, reading: 'Juan 7:32-52' },
  { day: 16, reading: 'Juan 8:1-30' },
  { day: 17, reading: 'Juan 8:31-59' },
  { day: 18, reading: 'Juan 9' },
  { day: 19, reading: 'Juan 10:1-21' },
  { day: 20, reading: 'Juan 10:22-42' },
  { day: 21, reading: 'Juan 11:1-44' },
  { day: 22, reading: 'Juan 11:45-57' },
  { day: 23, reading: 'Juan 12:1-19' },
  { day: 24, reading: 'Juan 12:20-50' },
  { day: 25, reading: 'Juan 13' },
  { day: 26, reading: 'Juan 14' },
  { day: 27, reading: 'Juan 15' },
  { day: 28, reading: 'Juan 16' },
  { day: 29, reading: 'Juan 17' },
  { day: 30, reading: 'Juan 18' },
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
