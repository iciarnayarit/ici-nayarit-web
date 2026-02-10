'use client';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { useToast } from '@/app/hooks/use-toast';
import { Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SavedVerse {
  text: string;
  reference: string;
}

export default function SavedVerses() {
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('savedVerses');
    if (saved) {
      setSavedVerses(JSON.parse(saved));
    }
  }, []);

  const handleShareVerse = async (verse: SavedVerse) => {
    const textToShare = `"${verse.text}" - ${verse.reference}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Versículo de la Biblia',
          text: textToShare,
        });
        toast({
          title: "Versículo Compartido",
          description: "El versículo ha sido compartido.",
        });
      } catch (error: any) {
        if (error.message !== 'Share canceled') {
          console.error('Error al compartir:', error);
          toast({
            title: "Error",
            description: "No se pudo compartir el versículo.",
            variant: "destructive",
          });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        toast({
          title: "Versículo Copiado",
          description: "El versículo ha sido copiado al portapapeles.",
        });
      } catch (error) {
        console.error('Error al copiar:', error);
        toast({
          title: "Error",
          description: "No se pudo copiar el versículo.",
          variant: "destructive",
        });
      }
    }
  };

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
                  <div className="flex justify-end items-center mt-2">
                    <p className="text-muted-foreground mr-4">{verse.reference}</p>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareVerse(verse)}
                    >
                        <Share2 className="h-6 w-6 text-gray-400" />
                        <span className="sr-only">Compartir versículo</span>
                    </Button>
                  </div>
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
