import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const plans = [
  {
    id: '1',
    title: 'Journey Through John',
    description: 'Explore the life and teachings of Jesus in this 30-day plan.',
    imageUrlId: 'plan-1'
  },
  {
    id: '2',
    title: 'Proverbs: A Daily Dose of Wisdom',
    description: 'Gain practical wisdom for everyday living with a chapter from Proverbs each day.',
    imageUrlId: 'plan-2'
  },
  {
    id: '3',
    title: 'The Story of Redemption',
    description: 'Trace the grand narrative of the Bible from Genesis to Revelation.',
    imageUrlId: 'plan-3'
  }
];

export default function ReadingPlans() {
  return (
    <section id="plans" className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl">
            Reading Plans & Devotionals
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Grow in your faith with plans that fit your life.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const image = PlaceHolderImages.find(p => p.id === plan.imageUrlId);
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
                  <Button variant="outline" className="w-full">Start Plan</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
