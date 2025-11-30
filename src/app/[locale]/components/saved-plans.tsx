'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {Link} from '@/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/[locale]/components/ui/card';
import { Button } from '@/app/[locale]/components/ui/button';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
}

export default function SavedPlans() {
  const [savedPlans, setSavedPlans] = useState<Plan[]>([]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('savedPlans');
    if (saved) {
      setSavedPlans(JSON.parse(saved));
    }
  }, []);

  return (
    <section id="saved-plans" className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <Button onClick={() => router.push('/planes')} variant="outline" className="mb-8">
            &larr; Regresar a Todos los Planes
        </Button>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl">
            Planes Guardados
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Aquí encontrarás los planes de lectura que has guardado para más tarde.
          </p>
        </div>
        {savedPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative h-48 w-full">
                  <Image
                    src={plan.imageUrl}
                    alt={plan.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="font-headline">{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow"></CardContent>
                <CardFooter>
                  <Link href={`/planes/${plan.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">Comenzar Plan</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No tienes planes guardados.</p>
        )}
      </div>
    </section>
  );
}
