'use client';

import { useState } from 'react';
import { Star, Download, Film, FileText, Wrench, Package, ArrowRight, BookOpen, DownloadCloud, ExternalLink, Scissors, Headphones, Mail } from 'lucide-react';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';

const resourceItems = [
    {
        category: 'MULTIMEDIA - SERMÓN',
        title: 'Viviendo en Santidad',
        description: 'Serie de sermones sobre el caminar diario del creyente en el mundo...',
        imageUrl: 'https://i.imgur.com/PvDorVd.png',
        actionLabel: 'Ver ahora',
        actionIcon: ArrowRight,
        link: '#',
        badge: '48:20'
    },
    {
        category: 'DOCUMENTO - GUÍA',
        title: 'Guía de Estudio Bíblico',
        description: 'Material complementario para el estudio personal de la epístola a los...',
        imageUrl: 'https://i.imgur.com/pIdxDkl.jpeg',
        actionLabel: 'Descargar',
        actionIcon: DownloadCloud,
        link: '#',
        badge: 'PDF'
    },
    {
        category: 'HERRAMIENTA - INTERACTIVA',
        title: 'Línea del Tiempo Bíblica',
        description: 'Explora los eventos clave de la Biblia de manera cronológica y visual.',
        imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
        actionLabel: 'Acceder',
        actionIcon: ExternalLink,
        link: '#'
    },
    {
        category: 'DESCARGA - DISEÑO',
        title: 'Wallpapers ICIAR',
        description: 'Fondos de pantalla oficiales para tu celular y computadora con versícul...',
        imageUrl: 'https://i.imgur.com/Ttvfam9.png',
        actionLabel: 'Descargar Pack',
        actionIcon: Download,
        link: '#'
    },
    {
        category: 'DOCUMENTO - BOLETÍN',
        title: 'Boletín Mensual Mayo',
        description: 'Noticias, eventos y planes de oración para el mes de Mayo en Nayarit.',
        imageUrl: 'https://i.imgur.com/YWlQCbQ.png',
        actionLabel: 'Leer Boletín',
        actionIcon: BookOpen,
        link: '#'
    },
    {
        category: 'DESCARGA - LOGOS',
        title: 'Identidad Visual ICIAR',
        description: 'Logos en alta resolución, fuentes y manual de uso para congregaciones...',
        imageUrl: 'https://i.imgur.com/ZrwSADZ.png',
        actionLabel: 'Kit de Marca',
        actionIcon: Download,
        link: '#'
    },
    {
        category: 'HERRAMIENTA - GENERADOR',
        title: 'Creador de Imágenes',
        description: 'Herramienta web para crear versículos visuales con el logo de...',
        imageUrl: 'https://i.imgur.com/NZYoeBJ.jpeg',
        actionLabel: 'Abrir Creador',
        actionIcon: Scissors,
        link: '#'
    },
    {
        category: 'MULTIMEDIA - AUDIO',
        title: 'Podcast: Fe y Cultura',
        description: 'Conversaciones semanales sobre cómo vivir la fe en la cultura mayorita.',
        imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
        actionLabel: 'Escuchar Audio',
        actionIcon: Headphones,
        link: '#'
    }
];

const filters = [
  { label: 'Todos', icon: Package },
  { label: 'Multimedia', icon: Film },
  { label: 'Documentos', icon: FileText },
  { label: 'Herramientas Bíblicas', icon: Wrench },
  { label: 'Descargas', icon: Download },
];

export default function RecursosPage() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [filteredResources, setFilteredResources] = useState(resourceItems);

  const handleFilterClick = (filterLabel: string) => {
    setActiveFilter(filterLabel);

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

  return (
    <>
      <Header />
      <div className="bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <section 
            className="bg-cover bg-center rounded-2xl p-8 md:p-12 mb-12 text-white relative overflow-hidden"
            style={{ backgroundImage: 'url(https://i.imgur.com/YhJc6R0.jpeg)' }}
          >
            <div className="absolute inset-0 bg-slate-800 opacity-80"></div>
            <div className="relative z-10 md:flex items-center">
                <div className="md:w-3/5">
                    <div className="flex items-center text-[#E5C573] text-sm font-semibold mb-3">
                        <Star className="w-5 h-5 mr-2" />
                        <span>RECURSO DESTACADO</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        Manual Doctrinario <span className="text-[#E5C573]">Anual 2024</span>
                    </h1>
                    <p className="text-lg text-gray-200 mb-8 max-w-xl">
                        Guía completa para el crecimiento espiritual y enseñanzas doctrinales de este año. Incluye planes de estudio, lecturas diarias y guías para grupos pequeños.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-[#B88A44] hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-colors">
                            <Download className="w-5 h-5 mr-2" />
                            Descargar PDF
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            Ver Detalles
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
            {filteredResources.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col">
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
                  <a href={item.link} className="w-full mt-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors text-sm">
                    <item.actionIcon className="w-4 h-4 mr-2" />
                    {item.actionLabel}
                  </a>
                </div>
              </div>
            ))}
          </section>

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