'use client';

import { bibleData } from '@/lib/bible-data';
import { allPlanData } from '@/lib/reading-plan-data';
import { palabraDeDios } from '@/lib/reading-plan-data';
import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';

interface PassageVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

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

export default function PlanDetailPage({ params }: { params: { slug: string } }) {
  const planData: palabraDeDios[] = allPlanData[params.slug];
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`completedDays_${params.slug}`);
    if (saved) {
      setCompletedDays(JSON.parse(saved));
    }
  }, [params.slug]);

  const handleToggleCompleteDay = (day: number) => {
    const updatedCompletedDays = completedDays.includes(day)
      ? completedDays.filter(d => d !== day)
      : [...completedDays, day];
    
    setCompletedDays(updatedCompletedDays);
    localStorage.setItem(`completedDays_${params.slug}`, JSON.stringify(updatedCompletedDays));
  };

  if (!planData) {
    return <div className="text-center py-12">Plan no encontrado</div>;
  }

  const planTitle = params.slug.replace(/-/g, ' ');

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 capitalize">{planTitle}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {planData.map((day) => {
            const isCompleted = completedDays.includes(day.day);
            return (
              <div key={day.day} className={`border rounded-lg p-4 flex flex-col transition-colors ${isCompleted ? 'bg-yellow-50' : 'bg-white'}`}>
                <h2 className="text-2xl font-bold mb-2">Día {day.day}</h2>
                <p className="text-lg mb-4 text-gray-700">{day.reading}</p>
                <div className="flex-grow mb-4 prose prose-sm max-w-none">
                    <details>
                        <summary className="cursor-pointer text-sm font-semibold text-gray-600">Ver pasaje</summary>
                        <div className="mt-2 space-y-2">
                            {handleReadPassage(day.reading).map((verse, index) => (
                                <p key={index} className="text-sm">
                                    <span className="font-bold">{verse.book} {verse.chapter}:{verse.verse}</span> {verse.text}
                                </p>
                            ))}
                        </div>
                    </details>
                </div>
                <Button
                    onClick={() => handleToggleCompleteDay(day.day)}
                    className={`w-full font-bold py-2 px-4 rounded transition-colors ${
                        isCompleted
                        ? 'bg-[#B88A44] text-white hover:bg-yellow-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {isCompleted ? 'Completado' : 'Marcar como completado'}
                </Button>
              </div>
            )
        })}
      </div>
    </div>
  );
}
