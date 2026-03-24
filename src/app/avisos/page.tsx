'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Bell, Bookmark, Share2 } from 'lucide-react';
import Footer from '@/app/components/footer';
import { featuredAnnouncement, recentAnnouncements, slugify } from '@/app/lib/announcements';

const ITEMS_PER_PAGE = 4;
const filters = ['Todos', 'Eventos', 'Comunidad', 'Avisos', 'Misiones', 'Celebración'];
const timeFilters = ['Todos', 'Hoy', 'Esta Semana', 'Este Mes'];

const monthNames: { [key: string]: number } = {
  'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
  'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
  'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
};

const parseAnnouncementDate = (dateStr: string) => {
  const parts = dateStr.trim().split(' ');
  
  if (parts.length === 3) {
    // Format: "DD Mes YYYY" or "D-D Mes YYYY"
    const dayPart = parts[0].split('-')[0]; // Take first day if range
    const day = parseInt(dayPart);
    const month = monthNames[parts[1]];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  } else if (parts.length === 2) {
    // Format: "Mes YYYY"
    const month = monthNames[parts[0]];
    const year = parseInt(parts[1]);
    if (month !== undefined && !isNaN(year)) {
      return new Date(year, month, 1);
    }
  } else if (parts.length === 1) {
    // Potential Format: "Mes" (current year)
    const month = monthNames[parts[0]];
    if (month !== undefined) {
      return new Date(2026, month, 1);
    }
  }
  
  return new Date();
};

const CategoryTag = ({ category }: { category: string }) => {
  let colorClass = 'bg-gray-500';
  switch (category.toLowerCase()) {
    case 'destacado': colorClass = 'bg-[#B88A44]'; break;
    case 'comunidad': colorClass = 'bg-indigo-600'; break;
    case 'evento': colorClass = 'bg-purple-600'; break;
    case 'misiones': colorClass = 'bg-emerald-600'; break;
    case 'aviso': colorClass = 'bg-amber-600'; break;
    case 'celebración': colorClass = 'bg-rose-600'; break;
  }
  return (
    <span className={`text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm ${colorClass}`}>
      {category}
    </span>
  );
};

export default function AvisosPage() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [activeTimeFilter, setActiveTimeFilter] = useState('Todos');
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
    // Category Filter
    let categoryMatch = true;
    if (activeFilter !== 'Todos') {
      if (activeFilter === 'Eventos') categoryMatch = a.category === 'Evento';
      else categoryMatch = a.category === activeFilter;
    }
    if (!categoryMatch) return false;

    // Time Filter
    if (activeTimeFilter === 'Todos') return true;
    
    const announcementDate = parseAnnouncementDate(a.date);
    const today = new Date(2026, 2, 23); // Consistent with user session date (Mar 23, 2026)
    today.setHours(0,0,0,0);
    
    if (activeTimeFilter === 'Hoy') {
      return announcementDate.getTime() === today.getTime();
    }
    
    if (activeTimeFilter === 'Esta Semana') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return announcementDate >= today && announcementDate <= nextWeek;
    }
    
    if (activeTimeFilter === 'Este Mes') {
      return announcementDate.getMonth() === today.getMonth() && announcementDate.getFullYear() === today.getFullYear();
    }

    return true;
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
          <div className="space-y-6 mb-12">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeFilter === filter ? 'bg-[#B88A44] text-white shadow-md transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtrar por tiempo:</span>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {timeFilters.map(tFilter => (
                  <button
                    key={tFilter}
                    onClick={() => {
                      setActiveTimeFilter(tFilter);
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeTimeFilter === tFilter ? 'bg-white text-[#B88A44] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tFilter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Announcements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-700 text-center md:text-left mb-8 font-display">Anuncios Recientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visibleAnnouncements.map(item => (
                <div key={`${item.title}-${item.date}`} className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group relative">
                  <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <button 
                      onClick={(e) => toggleSave(e, item.title)} 
                      className="p-2 bg-white/90 rounded-full shadow-sm backdrop-blur-sm cursor-pointer transition-colors hover:bg-white z-30"
                      aria-label="Guardar"
                    >
                      <Bookmark className={`w-4 h-4 transition-colors ${savedAvisos.includes(item.title) ? 'text-[#B88A44] fill-[#B88A44]' : 'text-gray-700 fill-none'}`} />
                    </button>
                    <button 
                      onClick={(e) => handleShare(e, item.title)} 
                      className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 hover:text-[#B88A44] transition-colors shadow-sm backdrop-blur-sm cursor-pointer z-30"
                      aria-label="Compartir"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link href={`/avisos/${slugify(item.title)}`} className="block h-full">
                    <div className="h-48 overflow-hidden relative">
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
                </div>
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