'use client';

import { useState } from 'react';
import { Star, Download, Film, FileText, Wrench, Package, ArrowRight, BookOpen, DownloadCloud, ExternalLink, Scissors, Headphones, Mail, Bookmark, Share2 } from 'lucide-react';
import Footer from '@/app/components/footer';
import Link from 'next/link';
import { resourceItems, slugify } from '@/app/lib/resources-data';

const filters = [
  { label: 'Todos', icon: Package },
  { label: 'Multimedia', icon: Film },
  { label: 'Documentos', icon: FileText },
  { label: 'Herramientas Bíblicas', icon: Wrench },
  { label: 'Descargas', icon: Download },
];

const ITEMS_PER_PAGE = 8;

export default function RecursosPage() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [filteredResources, setFilteredResources] = useState(resourceItems);
  const [savedRecursos, setSavedRecursos] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const toggleSave = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedRecursos(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const handleShare = async (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/recursos`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Recurso: ${title}`, url });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleFilterClick = (filterLabel: string) => {
    setActiveFilter(filterLabel);
    setVisibleCount(ITEMS_PER_PAGE); // reset pagination on filter change

    if (filterLabel === 'Todos') {
      setFilteredResources(resourceItems);
      return;
    }

    let searchKeyword = '';
    if (filterLabel === 'Multimedia') {
      searchKeyword = 'MULTIMEDIA';
    } else if (filterLabel === 'Documentos') {
      searchKeyword = 'DOCUMENTO';
    } else if (filterLabel === 'Herramientas Bíblicas') {
      searchKeyword = 'HERRAMIENTA';
    } else if (filterLabel === 'Descargas') {
      searchKeyword = 'DESCARGA';
    }

    const newFilteredResources = resourceItems.filter(item =>
      item.category.toUpperCase().includes(searchKeyword)
    );
    setFilteredResources(newFilteredResources);
  };

  const visibleResources = filteredResources.slice(0, visibleCount);
  const hasMore = visibleCount < filteredResources.length;

  return (
    <>
      <div className="bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <section 
            className="bg-cover bg-center rounded-2xl p-8 md:p-12 mb-12 text-white relative overflow-hidden"
            style={{ backgroundImage: 'url(https://i.imgur.com/YhJc6R0.jpeg)' }}
          >
            <div className="absolute inset-0 bg-slate-800 opacity-80"></div>
            <div className="relative z-10 md:flex items-center">
                <div className="md:w-full">
                    <div className="flex items-center text-[#E5C573] text-sm font-semibold mb-3">
                        <Star className="w-5 h-5 mr-2" />
                        <span>RECURSO DESTACADO</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        Plan de Predicación <span className="text-[#E5C573]">Anual 2026</span>
                    </h1>
                    <p className="text-lg text-gray-200 mb-8 max-w-2xl">
                        Calendario oficial y ejes temáticos para la exposición de la Palabra durante el año 2026. Una guía indispensable para la unidad doctrinal en todas nuestras congregaciones.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a 
                            href="/recursos/Plan de predicación - 2026.pdf" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#B88A44] hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-colors"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Descargar PDF
                        </a>
                        <Link href={`/recursos/${slugify("Plan de Predicación 2026")}`} className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block">
                            Ver Detalles
                        </Link>
                        <button onClick={(e) => toggleSave(e, "Plan de Predicación 2026")} className="bg-white/20 hover:bg-white/20 p-3 rounded-lg transition-none flex items-center justify-center">
                            <Bookmark className={`w-5 h-5 transition-colors ${savedRecursos.includes("Plan de Predicación 2026") ? 'text-[#B88A44] fill-[#B88A44]' : 'text-white fill-none'}`} />
                        </button>
                        <button onClick={(e) => handleShare(e, "Plan de Predicación 2026")} className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-colors flex items-center justify-center">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {filters.map((filter) => (
                <button 
                    key={filter.label}
                    onClick={() => handleFilterClick(filter.label)}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center transition-colors ${activeFilter === filter.label ? 'bg-[#B88A44] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    <filter.icon className="w-4 h-4 mr-2" />
                    {filter.label}
                </button>
            ))}
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {visibleResources.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col relative">
                <div className="absolute top-2 left-2 z-20 flex gap-2">
                   <button 
                     onClick={(e) => toggleSave(e, item.title)} 
                     className="p-2 bg-white/90 rounded-full shadow-sm backdrop-blur-sm cursor-pointer transition-colors hover:bg-white z-30"
                     aria-label="Guardar"
                   >
                     <Bookmark className={`w-4 h-4 transition-colors ${savedRecursos.includes(item.title) ? 'text-[#B88A44] fill-[#B88A44]' : 'text-gray-700 fill-none'}`} />
                   </button>
                   <button 
                     onClick={(e) => handleShare(e, item.title)} 
                     className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 hover:text-[#B88A44] transition-colors shadow-sm backdrop-blur-sm cursor-pointer z-30"
                     aria-label="Compartir"
                   >
                     <Share2 className="w-4 h-4" />
                   </button>
                </div>
                
                <Link href={`/recursos/${slugify(item.title)}`} className="flex flex-col h-full">
                  <div className="relative h-48">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
                    {item.badge && (
                      <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded ${item.badge === 'PDF' ? 'bg-[#B88A44] text-white' : 'bg-black/60 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.category}</p>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 font-display">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">{item.description}</p>
                    <div className="w-full mt-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors text-sm">
                      <item.actionIcon className="w-4 h-4 mr-2" />
                      {item.actionLabel}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </section>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm"
              >
                Cargar más recursos
              </button>
            </div>
          )}

          <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 font-display">¿No encuentras lo que buscas?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Suscríbete para recibir notificaciones cuando subamos nuevos manuales, sermones o herramientas.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="relative flex-grow">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="email" 
                        placeholder="tu@email.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B88A44] focus:outline-none" 
                    />
                </div>
                <button type="submit" className="bg-[#1A2530] hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Suscribirme
                </button>
            </form>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}