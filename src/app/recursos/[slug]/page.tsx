import { resourceItems, slugify } from '@/app/lib/resources-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/app/components/footer';
import { ArrowLeft, Download } from 'lucide-react';

export default async function RecursoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  // Find the resource
  const resource = resourceItems.find(r => slugify(r.title) === resolvedParams.slug);
  
  // Check if it's the featured resource (Plan de Predicación 2026)
  const isFeatured = resolvedParams.slug === slugify("Plan de Predicación 2026");

  if (!resource && !isFeatured) {
    notFound();
  }

  // If it's featured, use custom data since it's not in the array (OR use from array if available)
  const item = resource || {
    category: 'DOCUMENTO - PLAN',
    title: 'Plan de Predicación Anual 2026',
    description: 'Calendario oficial y ejes temáticos para la exposición de la Palabra durante el año 2026. Una guía indispensable para la unidad doctrinal en todas nuestras congregaciones.',
    imageUrl: '/images/announcements/congress.png',
    actionLabel: 'Descargar PDF',
    link: '/recursos/Plan de predicación - 2026.pdf',
    badge: 'PDF',
    content: 'Este plan de predicación ha sido diseñado para guiar a nuestras congregaciones en un estudio sistemático y profundo de las Escrituras durante todo el año 2026, asegurando que cubramos los temas doctrinales y prácticos esenciales para la vida cristiana. Recomendamos seguir este calendario para mantener la unidad en las enseñanzas a nivel presbiterial.',
    actionIcon: Download
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
                <a 
                  href={item.link} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#B88A44] hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center transition-colors text-lg flex-grow sm:flex-grow-0"
                >
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
