'use client';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { useToast } from '@/app/hooks/use-toast';
import { BookOpen, Share2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SavedVerse {
  text: string;
  reference: string;
}

interface SavedChapter {
  book: string;
  chapter: number;
  verses: string[];
}

export default function SavedVerses() {
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [savedChapters, setSavedChapters] = useState<SavedChapter[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('savedVerses');
    if (saved) setSavedVerses(JSON.parse(saved));

    const savedCh = localStorage.getItem('savedChapters');
    if (savedCh) setSavedChapters(JSON.parse(savedCh));
  }, []);

  const handleShareVerse = async (verse: SavedVerse) => {
    const textToShare = `"${verse.text}" - ${verse.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Versículo de la Biblia', text: textToShare });
        toast({ title: "Versículo Compartido" });
      } catch (error: any) {
        if (error.message !== 'Share canceled') {
          toast({ title: "Error", variant: "destructive" });
        }
      }
    } else {
      await navigator.clipboard.writeText(textToShare);
      toast({ title: "Versículo Copiado", description: "Copiado al portapapeles." });
    }
  };

  const handleRemoveChapter = (book: string, chapter: number) => {
    const updated = savedChapters.filter(c => !(c.book === book && c.chapter === chapter));
    setSavedChapters(updated);
    localStorage.setItem('savedChapters', JSON.stringify(updated));
    toast({ title: "Capítulo eliminado" });
  };

  const hasContent = savedVerses.length > 0 || savedChapters.length > 0;

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
            Aquí encontrarás tus versículos y capítulos favoritos.
          </p>
        </div>

        {!hasContent && (
          <p className="text-center text-muted-foreground">No tienes versículos ni capítulos guardados.</p>
        )}

        {/* Saved Verses */}
        {savedVerses.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Versículos</h3>
            <div className="space-y-4">
              {savedVerses.map((verse, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <blockquote className="text-lg font-semibold">"{verse.text}"</blockquote>
                    <div className="flex justify-end items-center mt-2">
                      <p className="text-muted-foreground mr-4">{verse.reference}</p>
                      <Button variant="ghost" size="icon" onClick={() => handleShareVerse(verse)}>
                        <Share2 className="h-5 w-5 text-gray-400" />
                        <span className="sr-only">Compartir versículo</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Saved Chapters */}
        {savedChapters.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-700">Capítulos</h3>
            <div className="space-y-4">
              {savedChapters.map((ch, index) => (
                <Card key={index} className="border-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{ch.book} {ch.chapter}</h4>
                          <p className="text-sm text-muted-foreground">{ch.verses.length} versículos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs font-semibold"
                          onClick={() => router.push(`/biblia?book=${encodeURIComponent(ch.book)}&chapter=${ch.chapter}`)}
                        >
                          Abrir
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => handleRemoveChapter(ch.book, ch.chapter)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar capítulo</span>
                        </Button>
                      </div>
                    </div>

                    {/* Preview of first 3 verses */}
                    <div className="mt-4 space-y-1 pl-13">
                      {ch.verses.slice(0, 3).map((v, i) => (
                        <p key={i} className="text-sm text-gray-500 line-clamp-1">
                          <span className="font-bold text-gray-400 mr-1">{i + 1}</span>{v}
                        </p>
                      ))}
                      {ch.verses.length > 3 && (
                        <p className="text-xs text-blue-400 font-medium">+{ch.verses.length - 3} más...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
