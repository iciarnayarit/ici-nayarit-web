'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import jo from '@/lib/bible/jo.json';
import { CheckCircle2, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const planDays = [
  { day: 1, reading: 'Juan 1:1-18', summary: `Contempla al Verbo eterno: aquí se revela la preexistencia, la divinidad y la encarnación del Hijo. Medita en cómo la Palabra se hizo carne para habitar entre nosotros; deja que este asombro te conduzca a la adoración y a una vida transformada por la presencia de Dios.` },
  { day: 2, reading: 'Juan 1:19-34', summary: `Reflexiona en el ministerio de Juan el Bautista como testigo que apunta a Cristo. Ora por un corazón humilde que reconozca la superioridad de Jesús, que no busque su propio protagonismo sino señalar al Cordero que quita el pecado del mundo.` },
  { day: 3, reading: 'Juan 1:35-51', summary: `Acompaña a los primeros discípulos en su llamado personal por Jesús. Pide la gracia de una fe que responde al encuentro: que tu llamado no se quede en curiosidad sino que te lleve a seguir con fidelidad y a invitar a otros a ver al Señor.` },
  { day: 4, reading: 'Juan 2', summary: `Medita en las primeras señales de Jesús: el milagro en Caná que manifiesta su gloria y la purificación del templo que revela su celo por la verdadera adoración. Ora para que Jesús transforme tanto tu celebración como tu reverencia hacia Él.` },
  { day: 5, reading: 'Juan 3:1-21', summary: `Acércate a la enseñanza sobre nacer de nuevo: una obra del Espíritu que inaugura una vida nueva en Cristo. Pide ser renovado por la gracia, entender la profundidad del amor del Padre y vivir con la certeza de la vida eterna.` },
  { day: 6, reading: 'Juan 3:22-36', summary: `Escucha el llamado a regocijarte cuando Cristo crece y disminuir tú mismo. Ora por humildad para aceptar la autoridad de Jesús y por confianza en la obra redentora que trasciende el reconocimiento humano.` },
  { day: 7, reading: 'Juan 4:1-42', summary: `Encuentra a Jesús junto al pozo: su oferta de agua viva satisface la sed del alma. Medita en el alcance universal del evangelio y en la compasión del Señor que busca a los sedientos; pide valentía para ser testigo en ámbitos inesperados.` },
  { day: 8, reading: 'Juan 4:43-54', summary: `Contempla la fe del funcionario real: la palabra de Jesús trae vida aún a distancia. Ora por confianza en la autoridad de Cristo sobre la enfermedad y por serenidad para dejar en sus manos aquello que te preocupa.` },
  { day: 9, reading: 'Juan 5:1-23', summary: `Observa la compasión que da vida y la autoridad de Jesús frente a la ley y las tradiciones. Pide al Señor que tu fe reconozca su voz y obedezca su iniciativa liberadora, confiando en su poder para restaurar.` },
  { day: 10, reading: 'Juan 5:24-47', summary: `Escucha las razones que Jesús da para su autoridad: el testimonio del Padre, las Escrituras y su obra. Ora por discernimiento para creer en su testimonio y por valentía para vivir conforme a la verdad que salva.` },
  { day: 11, reading: 'Juan 6:1-21', summary: `Acepta al Señor como proveedor y Salvador: el pan que multiplica anuncia su suficiencia. Medita también en la paz que trae al andar sobre la tormenta; pide coraje para confiar en su provisión y presencia.` },
  { day: 12, reading: 'Juan 6:22-40', summary: `Profundiza en la enseñanza del Pan de Vida: creer en Jesús es recibir vida eterna. Ora para que tu dependencia sea diaria y que el Señor alimente tu alma con su verdad perdurable.` },
  { day: 13, reading: 'Juan 6:41-71', summary: `Cuando la doctrina resulta exigente, examina tu fe: ¿te sostienes en Cristo? Pide fidelidad para permanecer en el Señor aun cuando las palabras sean difíciles, y confía en que su revelación requiere respuesta comprometida.` },
  { day: 14, reading: 'Juan 7:1-31', summary: `Escucha a Jesús enseñando en medio de la división: su palabra rompe esquemas y convoca a la obediencia. Ora por oídos que distingan su voz en la confusión y por entrega que convierta la doctrina en vida.` },
  { day: 15, reading: 'Juan 7:32-52', summary: `Mira cómo la llegada de la verdad provoca reacciones diversas. Pide a Dios sabiduría para testificar con mansedumbre y claridad, y por el Espíritu que confirme la verdad en los corazones.` },
  { day: 16, reading: 'Juan 8:1-30', summary: `Fíjate en la gracia que corrige y la verdad que libera: Jesús confronta y restaura. Ora por humildad que reconozca la necesidad de perdón y por valentía para vivir en la libertad que Él ofrece.` },
  { day: 17, reading: 'Juan 8:31-59', summary: `Medita en la afirmación de Jesús sobre la libertad que brota de la verdad. Pide al Señor que su palabra te arraigue, rompa las cadenas del pecado y te sostenga en una fidelidad que honra al Padre.` },
  { day: 18, reading: 'Juan 9', summary: `Observa cómo Jesús abre ojos: una obra física que simboliza la revelación espiritual. Ora por visión para reconocer a Cristo y por valor para confesar públicamente el testimonio de su obra.` },
  { day: 19, reading: 'Juan 10:1-21', summary: `Escucha la imagen del Buen Pastor que da su vida por las ovejas: amor sacrificial y cuidado cercano. Pide seguridad en su guía y sensibilidad para seguir su voz día a día.` },
  { day: 20, reading: 'Juan 10:22-42', summary: `Contempla la unidad del Padre y del Hijo revelada en palabra y obra: fuente de confianza cristiana. Ora para que esa unidad te fortalezca en la fe y te impulse a la adoración y al testimonio.` },
  { day: 21, reading: 'Juan 11:1-44', summary: `Permanece con Jesús en el duelo de la muerte de Lázaro y contempla su poder sobre la muerte. Pide consuelo en la pérdida y fortaleza para creer en la esperanza que la resurrección anuncia.` },
  { day: 22, reading: 'Juan 11:45-57', summary: `Siente la tensión entre reacción humana y propósito divino: la oposición no anula el plan redentor. Ora por firmeza para sostener la verdad frente a la presión y por sabiduría para actuar según la voluntad de Dios.` },
  { day: 23, reading: 'Juan 12:1-19', summary: `Adora con María y contempla la apertura del camino hacia la pasión: entrega que honra al Mesías. Reflexiona en lo que significa honrar a Jesús con lo mejor de tu vida y pide un corazón que adore sacrificialmente.` },
  { day: 24, reading: 'Juan 12:20-50', summary: `Recibe la palabra que anuncia la finalidad de la entrega de Cristo: creer en la luz que trae vida. Pide claridad para aceptar su llamado y valor para vivir conforme a la palabra que ilumina.` },
  { day: 25, reading: 'Juan 13', summary: `Permanece en el ejemplo de servicio en la Última Cena: amor humilde y entrega total. Ora por un corazón dispuesto a servir, perdonar y amar como Jesús lo hizo, poniendo a los demás por delante.` },
  { day: 26, reading: 'Juan 14', summary: `Confía en las promesas de consuelo y en la morada preparada por el Hijo: esperanza segura. Pide al Espíritu que haga tangible esa promesa en tu vida y que te guíe en verdad y paz.` },
  { day: 27, reading: 'Juan 15', summary: `Quédate en la vid para recibir vida fructífera: comunión que produce fruto para la gloria de Dios. Ora por permanencia íntima con Cristo y por frutos que demuestren su vida en ti.` },
  { day: 28, reading: 'Juan 16', summary: `Busca la guía y el consuelo del Espíritu en medio del juicio y la prueba. Confía en que la tristeza dará paso al gozo porque el Consolador obra en ti para sostener, enseñar y glorificar a Cristo.` },
  { day: 29, reading: 'Juan 17', summary: `Únete a la oración sacerdotal de Jesús por unidad y santidad: una petición por su pueblo. Medita en su intercesión y pide por unidad, santificación y testimonio que honre al Padre.` },
  { day: 30, reading: 'Juan 18', summary: `Sigue a Jesús en su camino hacia la pasión: presencia, traición y juicio que culminan en la redención. Mantén la mirada en su fidelidad y pide valor para ser testigo fiel aun en la adversidad.` },
];

interface SavedVerse {
  text: string;
  reference: string;
}

export default function JuanPlanPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('savedVerses');
    if (saved) {
      setSavedVerses(JSON.parse(saved));
    }
  }, []);

  const toggleDayCompletion = (day: number) => {
    setCompletedDays(
      completedDays.includes(day)
        ? completedDays.filter((d) => d !== day)
        : [...completedDays, day]
    );
  };

  const progressPercentage = (completedDays.length / planDays.length) * 100;

  const parseReading = (reading: string) => {
    const match = reading.match(/^(Juan)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/i);
    if (!match) return null;
    
    const chapter = Number(match[2]);
    const verseStart = match[3] ? Number(match[3]) : 1;
    const verseEnd = match[4] ? Number(match[4]) : (jo as any).chapters[chapter - 1]?.length;

    return { chapter, verseStart, verseEnd };
  };

  const handleSaveVerse = (verseText: string, verseNumber: number, chapter: number) => {
    const reference = `Juan ${chapter}:${verseNumber}`;
    const newVerse = { text: verseText, reference };
    
    let updatedSavedVerses;
    if (savedVerses.some(v => v.reference === reference)) {
      updatedSavedVerses = savedVerses.filter(v => v.reference !== reference);
      toast({
        title: "Versículo Eliminado",
        description: "Has eliminado el versículo de tus guardados.",
      });
    } else {
      updatedSavedVerses = [...savedVerses, newVerse];
      toast({
        title: "Versículo Guardado",
        description: `Has guardado ${reference}.`,
      });
    }
    
    setSavedVerses(updatedSavedVerses);
    localStorage.setItem('savedVerses', JSON.stringify(updatedSavedVerses));
  };

  if (selectedDay) {
    const dayData = planDays.find(d => d.day === selectedDay);
    if (!dayData) return null;

    const parsed = parseReading(dayData.reading);
    if (!parsed) return null;

    const chapterVerses = (jo as any).chapters?.[parsed.chapter - 1] || [];
    const verses = chapterVerses.slice(parsed.verseStart - 1, parsed.verseEnd);

    return (
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Button onClick={() => setSelectedDay(null)} variant="outline" className="mb-4">
            &larr; Volver al plan
          </Button>
          <h1 className="text-4xl font-bold font-headline text-center mb-2">{dayData.reading}</h1>
          <p className="text-center text-muted-foreground mb-8">{dayData.summary}</p>
          
          <Card>
            <CardContent className="p-6 space-y-4 text-lg leading-relaxed">
              {verses.map((verse: string, index: number) => {
                const verseNumber = parsed.verseStart + index;
                const reference = `Juan ${parsed.chapter}:${verseNumber}`;
                const isSaved = savedVerses.some(v => v.reference === reference);
                return (
                  <div key={index} className="flex items-start gap-2">
                    <p className="flex-grow">
                      <sup className="font-bold mr-2">{verseNumber}</sup>
                      {verse}
                    </p>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveVerse(verse, verseNumber, parsed.chapter)}
                    >
                        <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current text-black' : 'text-gray-400'}`} />
                        <span className="sr-only">Guardar versículo</span>
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className="flex justify-center mt-6">
            <Button onClick={() => {
                toggleDayCompletion(selectedDay);
                setSelectedDay(null);
            }}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {completedDays.includes(selectedDay) ? 'Marcar como no completado' : 'Marcar como completado'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <Button onClick={() => router.back()} variant="outline">
                &larr; Regresar
            </Button>
            <Link href="/biblia/guardados">
                <Button variant="outline">Ver Versículos Guardados</Button>
            </Link>
        </div>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {planDays.map((item) => (
            <Card 
              key={item.day} 
              className={`cursor-pointer transition-all hover:shadow-lg ${completedDays.includes(item.day) ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
              onClick={() => setSelectedDay(item.day)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Día {item.day}</span>
                  {completedDays.includes(item.day) && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.reading}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
