'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Bell, Bookmark, Share2 } from 'lucide-react';
import Footer from '@/app/components/footer';
import { featuredAnnouncement, recentAnnouncements, slugify } from '@/app/lib/announcements';

const ITEMS_PER_PAGE = 4;
const filters = ['Todos', 'Eventos', 'Comunidad', 'Avisos', 'Misiones'];

const CategoryTag = ({ category }: { category: string }) => {
  let colorClass = 'bg-gray-500';
  switch (category.toLowerCase()) {
    case 'destacado': colorClass = 'bg-[#B88A44]'; break;
    case 'comunidad': colorClass = 'bg-gray-500'; break;
    case 'evento': colorClass = 'bg-gray-500'; break;
    case 'misiones': colorClass = 'bg-gray-500'; break;
    case 'aviso': colorClass = 'bg-gray-500'; break;
  }
  return (
    <span className={`text-white text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
      {category}
    </span>
  );
};

export default function AvisosPage() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [savedAvisos, setSavedAvisos] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setVisibleCount(ITEMS_PER_PAGE); // reset pagination on filter change
  };

  const toggleSave = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedAvisos(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const handleShare = async (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/avisos/${slugify(title)}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Aviso: ${title}`, url }); } catch (err) { }
    } else {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  };

  const filteredAnnouncements = recentAnnouncements.filter(a => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Eventos') return a.category === 'Evento';
    return a.category === activeFilter;
  });

  const visibleAnnouncements = filteredAnnouncements.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAnnouncements.length;

  return (
    <>
      <div className="bg-[#F9FAFB] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-display">Avisos</h1>
            <p className="mt-3 text-lg text-gray-600">Mantente informado sobre las actividades de nuestra comunidad cristiana en Nayarit.</p>
          </header>

          {/* Featured */}
          <section className="mb-16">
            <div className="flex items-center mb-6">
              <Bell className="h-6 w-6 text-[#B88A44] mr-3" />
              <h2 className="text-2xl font-bold text-gray-700 font-display">Aviso Destacado</h2>
            </div>
            <Link href={`/avisos/${slugify(featuredAnnouncement.title)}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden md:flex hover:shadow-xl transition-shadow duration-300">
              <div className="md:w-1/2 relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <div role="button" onClick={(e) => toggleSave(e, featuredAnnouncement.title)} className="p-2 bg-white/90 rounded-full shadow-sm backdrop-blur-sm cursor-pointer transition-colors">
                    <Bookmark className={`w-5 h-5 transition-colors ${savedAvisos.includes(featuredAnnouncement.title) ? 'text-[#B88A44] fill-[#B88A44]' : 'text-gray-700 fill-none'}`} />
                  </div>
                  <div role="button" onClick={(e) => handleShare(e, featuredAnnouncement.title)} className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 hover:text-[#B88A44] transition-colors shadow-sm backdrop-blur-sm cursor-pointer">
                    <Share2 className="w-5 h-5" />
                  </div>
                </div>
                <img src={featuredAnnouncement.imageUrl} alt={featuredAnnouncement.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <CategoryTag category={featuredAnnouncement.category} />
                  <span className="text-sm text-gray-500 font-medium">{featuredAnnouncement.date}</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4 font-display">{featuredAnnouncement.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{featuredAnnouncement.description}</p>
                <div className="flex items-center text-gray-500 text-sm mb-8">
                  <MapPin className="h-4 w-4 mr-2" /><span>{featuredAnnouncement.location}</span>
                  <Calendar className="h-4 w-4 mr-2 ml-6" /><span>{featuredAnnouncement.time}</span>
                </div>
                <div className="self-start text-[#B88A44] font-bold py-3 px-8 rounded-full">Ver detalles</div>
              </div>
            </Link>
          </section>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${activeFilter === filter ? 'bg-[#B88A44] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Recent Announcements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-700 text-center md:text-left mb-8 font-display">Anuncios Recientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visibleAnnouncements.map(item => (
                <Link href={`/avisos/${slugify(item.title)}`} key={item.title} className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      <div role="button" onClick={(e) => toggleSave(e, item.title)} className="p-2 bg-white/90 rounded-full shadow-sm backdrop-blur-sm cursor-pointer transition-colors">
                        <Bookmark className={`w-4 h-4 transition-colors ${savedAvisos.includes(item.title) ? 'text-[#B88A44] fill-[#B88A44]' : 'text-gray-700 fill-none'}`} />
                      </div>
                      <div role="button" onClick={(e) => handleShare(e, item.title)} className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 hover:text-[#B88A44] transition-colors shadow-sm backdrop-blur-sm cursor-pointer">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </div>
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <CategoryTag category={item.category} />
                      <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 truncate font-display">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">{item.description}</p>
                    <div className="text-[#B88A44] font-semibold text-sm flex items-center group-hover:underline">
                      Ver detalles <ArrowRight className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-16">
              <button
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm"
              >
                Cargar avisos anteriores
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}