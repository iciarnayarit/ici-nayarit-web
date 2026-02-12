import { bibleData } from '@/lib/bible-data';
import { allPlanData } from '@/lib/reading-plan-data';
import { ReadingDay } from '@/lib/reading-plan-data';

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
  const planData: ReadingDay[] = allPlanData[params.slug];

  if (!planData) {
    return <div>Plan no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-4xl font-bold mb-4">{params.slug.replace(/-/g, ' ')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {planData.map((day) => (
          <div key={day.day} className="border rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-2">Día {day.day}</h2>
            <p className="text-lg mb-4">{day.reading}</p>
            <div>
              {handleReadPassage(day.reading).map((verse, index) => (
                <p key={index} className="mb-2">
                  <span className="font-bold">{verse.book} {verse.chapter}:{verse.verse}</span> {verse.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
