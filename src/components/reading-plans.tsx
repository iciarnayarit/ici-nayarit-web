import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const plans = [
  {
    id: '1',
    title: 'Viaje a través de Juan',
    description: 'Explora la vida y las enseñanzas de Jesús en este plan de 30 días.',
    imageUrlId: 'plan-1',
    slug: 'viaje-a-traves-de-juan'
  },
  {
    id: '2',
    title: 'Proverbios: Una Dosis Diaria de Sabiduría',
    description: 'Obtén sabiduría práctica para la vida diaria con un capítulo de Proverbios cada día.',
    imageUrlId: 'plan-2',
    slug: 'proverbios-sabiduria-diaria'
  },
  {
    id: '3',
    title: 'La Historia de la Redención',
    description: 'Sigue la gran narrativa de la Biblia desde Génesis hasta Apocalipsis.',
    imageUrlId: 'plan-3'
  }
];

export default function ReadingPlans() {
  return (
    <section id="plans" className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl">
            Planes de Lectura y Devocionales
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Crece en tu fe con planes que se ajustan a tu vida.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const image = PlaceHolderImages.find(p => p.id === plan.imageUrlId);
            const button = (
              <Button variant="outline" className="w-full">Comenzar Plan</Button>
            );
            return (
              <Card key={plan.id} className="flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                {image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline">{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow"></CardContent>
                <CardFooter>
                  {plan.slug ? (
                    <Link href={`/planes/${plan.slug}`} className="w-full">
                      {button}
                    </Link>
                  ) : (
                    button
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
