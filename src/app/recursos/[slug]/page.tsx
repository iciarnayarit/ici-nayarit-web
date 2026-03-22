import { resourceItems, slugify } from '@/app/lib/resources-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/app/components/footer';
import { ArrowLeft, Download } from 'lucide-react';

export default async function RecursoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  // Find the resource
  const resource = resourceItems.find(r => slugify(r.title) === resolvedParams.slug);
  
  // Check if it's the featured resource (Manual Doctrinario)
  const isFeatured = resolvedParams.slug === slugify("Manual Doctrinario Anual 2024");

  if (!resource && !isFeatured) {
    notFound();
  }

  // If it's featured, use custom data since it's not in the array
  const item = resource || {
    category: 'DOCUMENTO - MANUAL',
    title: 'Manual Doctrinario Anual 2024',
    description: 'Guía completa para el crecimiento espiritual y enseñanzas doctrinales de este año. Incluye planes de estudio, lecturas diarias y guías para grupos pequeños.',
    imageUrl: 'https://i.imgur.com/YhJc6R0.jpeg',
    actionLabel: 'Descargar PDF',
    link: '#',
    badge: 'PDF',
    content: 'Este manual incluye planes de estudio, lecturas diarias y guías para grupos pequeños diseñadas específicamente para edificar a la iglesia a lo largo de todo el año. Nos enfocaremos en los 14 puntos doctrinales para afirmar los cimientos de nuestra fe cristiana. Recomendamos estudiar este libro en conjunto con toda la congregación.',
    actionIcon: undefined
  };

  const ActionIcon = item.actionIcon ? item.actionIcon : (isFeatured ? Download : null);

  return (
    <>
      <div className="bg-[#F9FAFB] py-12 min-h-[calc(100vh-64px)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-64 md:h-96">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                {item.badge && (
                  <span className={`absolute top-4 right-4 text-sm font-semibold px-3 py-1 rounded ${item.badge === 'PDF' ? 'bg-[#B88A44] text-white' : 'bg-black/80 text-white'}`}>
                    {item.badge}
                  </span>
                )}
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{item.category}</span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 font-display mb-6">{item.title}</h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed font-medium">
                {item.description}
              </p>

              <div className="prose max-w-none text-gray-700 leading-relaxed mb-10">
                {item.content ? (
                  <p>{item.content}</p>
                ) : (
                  <p>Detalles completos del recurso se mostrarán aquí. Disfruta de la mejor calidad de enseñanza con este material oficial de ICIAR.</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row gap-4">
                <a href={item.link} className="bg-[#B88A44] hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center transition-colors text-lg flex-grow sm:flex-grow-0">
                  {ActionIcon && <ActionIcon className="w-5 h-5 mr-3" />}
                  {item.actionLabel}
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/recursos" className="inline-flex items-center text-[#B88A44] hover:text-opacity-80 font-semibold transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a recursos
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
