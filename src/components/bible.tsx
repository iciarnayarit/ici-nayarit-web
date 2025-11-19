'use client';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const books = [
  "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio", "Josué",
  "Jueces", "Rut", "1 Samuel", "2 Samuel", "1 Reyes", "2 Reyes",
  "1 Crónicas", "2 Crónicas", "Esdras", "Nehemías", "Ester", "Job",
  "Salmos", "Proverbios", "Eclesiastés", "Cantares", "Isaías",
  "Jeremías", "Lamentaciones", "Ezequiel", "Daniel", "Oseas", "Joel",
  "Amós", "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc", "Sofonías",
  "Hageo", "Zacarías", "Malaquías", "Mateo", "Marcos", "Lucas", "Juan",
  "Hechos", "Romanos", "1 Corintios", "2 Corintios", "Gálatas",
  "Efesios", "Filipenses", "Colosenses", "1 Tesalonicenses",
  "2 Tesalonicenses", "1 Timoteo", "2 Timoteo", "Tito", "Filemón",
  "Hebreos", "Santiago", "1 Pedro", "2 Pedro", "1 Juan", "2 Juan",
  "3 Juan", "Judas", "Apocalipsis"
];

// This is a simplified mapping. A real implementation would be more complex.
const chaptersPerBook: { [key: string]: number } = {
  "Génesis": 50, "Éxodo": 40, "Levítico": 27, "Números": 36, "Deuteronomio": 34, "Josué": 24,
  "Jueces": 21, "Rut": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Reyes": 22, "2 Reyes": 25,
  "1 Crónicas": 29, "2 Crónicas": 36, "Esdras": 10, "Nehemías": 13, "Ester": 10, "Job": 42,
  "Salmos": 150, "Proverbios": 31, "Eclesiastés": 12, "Cantares": 8, "Isaías": 66,
  "Jeremías": 52, "Lamentaciones": 5, "Ezequiel": 48, "Daniel": 12, "Oseas": 14, "Joel": 3,
  "Amós": 9, "Abdías": 1, "Jonás": 4, "Miqueas": 7, "Nahúm": 3, "Habacuc": 3, "Sofonías": 3,
  "Hageo": 2, "Zacarías": 14, "Malaquías": 4, "Mateo": 28, "Marcos": 16, "Lucas": 24, "Juan": 21,
  "Hechos": 28, "Romanos": 16, "1 Corintios": 16, "2 Corintios": 13, "Gálatas": 6,
  "Efesios": 6, "Filipenses": 4, "Colosenses": 4, "1 Tesalonicenses": 5,
  "2 Tesalonicenses": 3, "1 Timoteo": 6, "2 Timoteo": 4, "Tito": 3, "Filemón": 1,
  "Hebreos": 13, "Santiago": 5, "1 Pedro": 5, "2 Pedro": 3, "1 Juan": 5, "2 Juan": 1,
  "3 Juan": 1, "Judas": 1, "Apocalipsis": 22
};

export default function Bible() {
  const [selectedBook, setSelectedBook] = useState('Génesis');
  const [selectedChapter, setSelectedChapter] = useState(1);

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter(1);
  };

  const totalChapters = chaptersPerBook[selectedBook] || 1;

  const goToNextChapter = () => {
    if (selectedChapter < totalChapters) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const goToPreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    }
  };


  const chapters = chaptersPerBook[selectedBook] ? Array.from({ length: chaptersPerBook[selectedBook] }, (_, i) => i + 1) : [];

  return (
    <section id="bible" className="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex gap-4">
                <Select value={selectedBook} onValueChange={handleBookChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Seleccionar libro" />
                    </SelectTrigger>
                    <SelectContent>
                    {books.map(book => (
                        <SelectItem key={book} value={book}>{book}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={selectedChapter.toString()} onValueChange={(val) => setSelectedChapter(Number(val))}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Capítulo" />
                    </SelectTrigger>
                    <SelectContent>
                    {chapters.map(chapter => (
                        <SelectItem key={chapter} value={chapter.toString()}>Capítulo {chapter}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>

            <Card>
            <CardContent className="p-6 md:p-8">
                <h2 className="text-3xl font-bold font-headline mb-6 text-center">{selectedBook} {selectedChapter}</h2>
                <div className="space-y-4 text-left font-body text-lg md:text-xl leading-relaxed">
                <p><sup className="font-bold mr-2">1</sup>En el principio creó Dios los cielos y la tierra.</p>
                <p><sup className="font-bold mr-2">2</sup>Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.</p>
                <p><sup className="font-bold mr-2">3</sup>Y dijo Dios: Sea la luz; y fue la luz.</p>
                <p><sup className="font-bold mr-2">4</sup>Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.</p>
                <p><sup className="font-bold mr-2">5</sup>Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.</p>
                <p className="italic mt-8 text-center text-muted-foreground">(Contenido de muestra. La funcionalidad completa de la Biblia se implementará más adelante.)</p>
                </div>
            </CardContent>
            </Card>
            <div className="flex justify-between mt-8">
                <Button onClick={goToPreviousChapter} disabled={selectedChapter === 1} variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button onClick={goToNextChapter} disabled={selectedChapter === totalChapters} variant="outline">
                    Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
    </section>
  );
}
