'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SavedVerse {
  text: string;
  reference: string;
}

export default function SavedVerses() {
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('savedVerses');
    if (saved) {
      setSavedVerses(JSON.parse(saved));
    }
  }, []);

  return (
    <section id="saved-verses" className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <Button onClick={() => router.push('/biblia')} variant="outline" className="mb-8">
            &larr; Regresar a la Biblia
        </Button>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl">
            Versículos Guardados
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Aquí encontrarás tus versículos favoritos.
          </p>
        </div>
        {savedVerses.length > 0 ? (
          <div className="space-y-4">
            {savedVerses.map((verse, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <blockquote className="text-lg font-semibold">“{verse.text}”</blockquote>
                  <p className="text-right text-muted-foreground mt-2">{verse.reference}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No tienes versículos guardados.</p>
        )}
      </div>
    </section>
  );
}
