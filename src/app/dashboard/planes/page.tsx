'use client';

import Image from 'next/image';
import { Bookmark, Plus } from 'lucide-react';

const plans = [
  {
    id: 1,
    title: 'Amor',
    category: 'RELACIONES',
    color: 'bg-red-500',
    days: '5 DÍAS',
    description: 'Explora la naturaleza del amor incondicional a través de 1 Corintios 13.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190e7',
  },
  {
    id: 2,
    title: 'Ansiedad',
    category: 'PAZ MENTAL',
    color: 'bg-blue-400',
    days: '7 DÍAS',
    description: 'Encuentra descanso para tu alma en medio de las tormentas de la vida.',
    image: 'https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2',
  },
  {
    id: 3,
    title: 'Sanidad',
    category: 'RESTAURACIÓN',
    color: 'bg-purple-500',
    days: '10 DÍAS',
    description: 'Un estudio bíblico sobre el poder restaurador de la fe y el perdón.',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88',
  },
  {
    id: 4,
    title: 'Propósito',
    category: 'DIRECCIÓN',
    color: 'bg-yellow-500',
    days: '14 DÍAS',
    description: 'Descubre el llamado único de Dios para tu vida en esta nueva temporada.',
    image: 'https://images.unsplash.com/photo-1516245836543-20d2e8ce5baa',
  },
  {
    id: 5,
    title: 'Identidad',
    category: 'FUNDAMENTOS',
    color: 'bg-blue-600',
    days: '3 DÍAS',
    description: 'Afirmando quién eres en Cristo por encima de las etiquetas del mundo.',
    image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6',
  }
];

export default function PlanesPage() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-20 w-full font-sans relative">
      
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* Featured Hero Banner */}
        <div className="relative w-full h-[380px] rounded-3xl overflow-hidden shadow-md flex items-center">
          <Image 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" 
            alt="Mountains" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"></div>
          
          <div className="relative z-10 p-8 md:p-14 max-w-2xl">
            <span className="inline-block bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-6">
              FEATURED PLAN OF THE DAY
            </span>
            <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
              Creciendo en Sabiduría
            </h1>
            <p className="text-gray-300 text-sm md:text-base font-medium mb-10 max-w-md leading-relaxed">
              Un viaje de 21 días a través de los Proverbios para encontrar claridad en un mundo complejo.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm text-sm">
                Comenzar Plan
              </button>
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3.5 px-8 rounded-xl transition-colors backdrop-blur-sm text-sm">
                Guardar
              </button>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Browse Reading Plans</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Discover curated paths for spiritual growth.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Pills */}
            <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
              <button className="px-6 py-2.5 bg-blue-50 text-blue-600 text-[13px] font-bold rounded-lg transition-colors">All Plans</button>
              <button className="px-6 py-2.5 text-gray-500 hover:text-gray-900 text-[13px] font-semibold rounded-lg transition-colors">Trending</button>
              <button className="px-6 py-2.5 text-gray-500 hover:text-gray-900 text-[13px] font-semibold rounded-lg transition-colors">New</button>
            </div>
            
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <Bookmark className="w-4 h-4" />
              Saved Plans
            </button>
          </div>
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all group">
              
              {/* Image Banner */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                <Image 
                  src={plan.image} 
                  alt={plan.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-white/95 text-gray-800 text-[10px] font-black tracking-widest shadow-sm uppercase px-3 py-1.5 rounded-md">
                    {plan.days}
                  </span>
                </div>
              </div>
              
              {/* Content Box */}
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div className={`w-2 h-2 rounded-full ${plan.color}`}></div>
                  <span className="text-[9px] font-black text-gray-500 tracking-widest uppercase">{plan.category}</span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-xl mb-3 tracking-tight">{plan.title}</h3>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-8 flex-1">
                  {plan.description}
                </p>
                
                <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-3.5 rounded-xl transition-colors text-[13px]">
                  Comenzar Plan
                </button>
              </div>
            </div>
          ))}

          {/* Add Custom Plan Card */}
          <div className="rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center min-h-[400px] p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors group">
            <div className="w-14 h-14 bg-blue-100/50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-2">Create Custom Plan</h3>
            <p className="text-[11px] font-medium text-gray-500 max-w-[180px] leading-relaxed mx-auto">
              Tailor your own reading sequence for any book of the Bible.
            </p>
          </div>

        </div>

        {/* Load More Button & Footer Info */}
        <div className="pt-10 flex flex-col items-center justify-center gap-4 border-t border-gray-100">
          <p className="text-[11px] font-medium text-gray-400">Showing 5 of 124 curated plans</p>
          <button className="bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-[13px]">
            Load More Plans
          </button>
        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}
