'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const planDays = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  reading: `Proverbios ${i + 1}`,
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
