'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, MapPin, Calendar, Trash2, Plus } from 'lucide-react';

const avisos = [
  {
    id: 1,
    tag: 'ESPECIAL',
    tagColor: 'bg-blue-500 text-white',
    image: 'https://images.unsplash.com/photo-1525381622345-66632490ccba', // Abstract representation / Flower
    title: 'Pentecostés 2024',
    description: 'Únete a nuestra celebración especial anual donde recordamos el descenso...',
    location: 'Templo Central, Auditorio A',
    date: '19 de Mayo, 10:00 AM',
  },
  {
    id: 2,
    tag: 'JÓVENES',
    tagColor: 'bg-purple-500 text-white',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c', // People talking
    title: 'Reunión de Jóvenes',
    description: 'Un espacio para conectar, aprender y crecer juntos en nuestra fe cada fin d...',
    location: 'Salón de Usos Múltiples',
    date: 'Cada Sábado, 6:30 PM',
  },
  {
    id: 3,
    tag: 'SERVICIO',
    tagColor: 'bg-slate-500 text-white',
    image: 'https://images.unsplash.com/photo-1593113588332-cd288d649433', // Community service
    title: 'Jornada de Donación',
    description: 'Recolección de víveres y ropa para las comunidades más necesitadas del...',
    location: 'Parqueadero Posterior',
    date: '25 de Mayo, 8:00 AM',
  },
  {
    id: 4,
    tag: 'MÚSICA',
    tagColor: 'bg-blue-600 text-white',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256', // Choir
    title: 'Audiciones Coro',
    description: '¿Te apasiona la música? Estamos buscando nuevas voces para nuestro...',
    location: 'Sala de Ensayo 2',
    date: 'Lunes y Jueves, 7:00 PM',
  }
];

export default function AvisosGuardadosPage() {
  return (
    <div className="bg-[#F4F7F6] min-h-screen pb-12 w-full">
      {/* Secondary Dashboard Header for Breadcrumbs & Actions */}
      <header className="px-6 md:px-10 py-5 w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
        <div>
          <nav className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase mb-2">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">Announcements</Link>
            <span className="text-gray-300">›</span>
            <span className="text-blue-600">Avisos Guardados</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900">Avisos Guardados</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Gestiona y revisa los anuncios importantes que has marcado como favoritos.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar en guardados..." 
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </header>

      {/* Grid Content */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {avisos.map((aviso) => (
            <div key={aviso.id} className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
              <div className="relative h-48 w-full bg-gray-50">
                <Image 
                  src={aviso.image} 
                  alt={aviso.title} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-md shadow-sm ${aviso.tagColor}`}>
                    {aviso.tag}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-2">{aviso.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6 line-clamp-2">
                  {aviso.description}
                </p>
                
                <div className="mt-auto space-y-3 mb-6">
                  <div className="flex items-center gap-2.5 text-xs text-gray-500">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{aviso.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-500">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{aviso.date}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                  <button className="text-blue-600 text-xs font-bold hover:text-blue-800 transition-colors">
                    Ver detalles
                  </button>
                  <button className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Explore More Dashed Card */}
          <div className="rounded-[20px] border-2 border-dashed border-blue-200 bg-blue-50/30 flex flex-col items-center justify-center min-h-[400px] p-8 text-center cursor-pointer hover:bg-blue-50/50 transition-colors group">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:bg-blue-600 transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-blue-600 text-lg mb-2">Explorar más anuncios</h3>
            <p className="text-sm text-blue-500/80 font-medium">Descubre nuevos eventos y noticias de tu congregación</p>
          </div>

        </div>
      </div>
    </div>
  );
}
