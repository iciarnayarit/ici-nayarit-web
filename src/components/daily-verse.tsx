import { Share2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DailyVerse() {
  return (
    <section id="verse" className="w-full py-20 md:py-32 lg:py-40 bg-card">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <blockquote className="text-3xl font-headline font-bold text-foreground md:text-5xl lg:text-6xl tracking-tight">
            “For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.”
          </blockquote>
          <p className="mt-6 text-lg text-muted-foreground font-body">
            John 3:16
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Mail className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
