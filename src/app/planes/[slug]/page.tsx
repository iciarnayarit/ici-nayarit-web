'use client';

import { useParams, useRouter } from 'next/navigation';
import { allPlanData, plans } from '@/lib/reading-plan-data';
import ReadingPlanLayout from '@/app/components/reading-plan-layout';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DynamicPlanPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const planDayData = allPlanData[slug];
  const planInfo = plans.find(p => p.slug === slug);

  if (!planDayData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Plan no encontrado</h1>
        <p className="text-gray-600 mb-8">Lo sentimos, no pudimos encontrar el plan de lectura que buscas.</p>
        <Button onClick={() => router.push('/planes')} variant="outline" className="rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a los planes
        </Button>
      </div>
    );
  }

  return (
    <ReadingPlanLayout
      planData={planDayData}
      planSlug={slug}
      title={planInfo?.titleKey || slug.replace(/-/g, ' ')}
      description={planInfo?.descriptionKey || 'Explora este plan de lectura bíblica y crece en tu fe.'}
    />
  );
}
