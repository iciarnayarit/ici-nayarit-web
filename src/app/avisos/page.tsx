'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Globe, Calendar, MapPin, ArrowRight, Bell, Tag } from 'lucide-react';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';
import { featuredAnnouncement, recentAnnouncements, slugify } from '@/app/lib/announcements';

const filters = ['Todos', 'Eventos', 'Comunidad', 'Avisos', 'Misiones'];

const CategoryTag = ({ category }: { category: string }) => {
    let colorClass = 'bg-gray-500'; // Default color
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

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const filteredAnnouncements = recentAnnouncements.filter(announcement => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Eventos') return announcement.category === 'Evento';
    return announcement.category === activeFilter;
  });

  return (
    <>
      <Header />
      <div className="bg-[#F9FAFB] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-display">Avisos y Anuncios</h1>
            <p className="mt-3 text-lg text-gray-600">Mantente informado sobre las actividades de nuestra comunidad cristiana en Pacifico Norte.</p>
          </header>

          <section className="mb-16">
            <div className="flex items-center mb-6">
              <Bell className="h-6 w-6 text-[#B88A44] mr-3" />
              <h2 className="text-2xl font-bold text-gray-700 font-display">Aviso Destacado</h2>
            </div>
            <Link href={`/avisos/${slugify(featuredAnnouncement.title)}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden md:flex hover:shadow-xl transition-shadow duration-300">
              <div className="md:w-1/2">
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
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{featuredAnnouncement.location}</span>
                  <Calendar className="h-4 w-4 mr-2 ml-6" />
                  <span>{featuredAnnouncement.time}</span>
                </div>
                <div className="self-start text-[#B88A44] font-bold py-3 px-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B88A44]">
                  Ver detalles
                </div>
              </div>
            </Link>
          </section>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {filters.map((filter) => (
                  <button 
                      key={filter}
                      onClick={() => handleFilterClick(filter)}
                      className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${activeFilter === filter ? 'bg-[#B88A44] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                      {filter}
                  </button>
              ))}
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-700 text-center md:text-left mb-8 font-display">Anuncios Recientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredAnnouncements.map((item) => (
                <Link href={`/avisos/${slugify(item.title)}`} key={item.title} className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="h-48 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  </div>
                  <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                          <CategoryTag category={item.category} />
                          <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 truncate font-display">{item.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">{item.description}</p>
                      <div className="text-[#B88A44] font-semibold hover:text-opacity-80 text-sm flex items-center group-hover:underline">
                          Ver detalles <ArrowRight className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform"/>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          
          <div className="text-center mt-16">
            <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm">
                Cargar avisos anteriores
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}