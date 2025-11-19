import { Share2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DailyVerse() {
  return (
    <section id="verse" className="w-full py-20 md:py-32 lg:py-40 bg-background">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Versículo del Día
          </h2>
          <blockquote className="text-2xl font-headline font-bold text-foreground md:text-4xl lg:text-5xl tracking-tight">
            “Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.”
          </blockquote>
          <p className="mt-6 text-lg text-muted-foreground font-body">
            Juan 3:16
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
            <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Mail className="mr-2 h-4 w-4" />
              Suscribirse
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
