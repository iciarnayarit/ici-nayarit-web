'use client';

import Link from 'next/link';
import { FileText, Music, Play, Download, Plus } from 'lucide-react';

const recursos = [
  {
    id: 1,
    type: 'pdf',
    date: '12 OCT',
    title: 'Guía de Estudio: Teología I',
    subtitle: 'Documento PDF • 2.4 MB',
  },
  {
    id: 2,
    type: 'audio',
    date: '08 OCT',
    title: 'Sermón: La Gracia Abundante',
    subtitle: 'Archivo de Audio • 15.2 MB',
  },
  {
    id: 3,
    type: 'text',
    date: '01 OCT',
    title: 'Notas de Conferencia 2023',
    subtitle: 'Documento de Texto • 450 KB',
  },
  {
    id: 4,
    type: 'pdf',
    date: '28 SEP',
    title: 'Plan de Lectura Mensual',
    subtitle: 'Documento PDF • 1.1 MB',
  },
  {
    id: 5,
    type: 'audio',
    date: '22 SEP',
    title: 'Podcasts: Liderazgo Cristiano',
    subtitle: 'Archivo de Audio • 22.8 MB',
  }
];

export default function RecursosGuardadosPage() {
  return (
    <div className="bg-[#F4F7F6] min-h-screen pb-12 w-full relative">
      <div className="px-6 md:px-10 max-w-7xl mx-auto pt-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase mb-3">
            <span className="text-gray-400 font-medium">PORTAL</span>
            <span className="text-gray-300">/</span>
            <span className="text-blue-600">RESOURCES</span>
          </nav>
          <h1 className="text-2xl md:text-4xl font-bold font-display text-gray-900 mb-6">Recursos Guardados</h1>
          
          {/* Pills / Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors">Todos</button>
            <button className="bg-white border border-gray-200 text-gray-500 hover:text-gray-900 px-5 py-2 rounded-full text-xs font-semibold transition-colors">PDFs</button>
            <button className="bg-white border border-gray-200 text-gray-500 hover:text-gray-900 px-5 py-2 rounded-full text-xs font-semibold transition-colors">Audio</button>
            <button className="bg-white border border-gray-200 text-gray-500 hover:text-gray-900 px-5 py-2 rounded-full text-xs font-semibold transition-colors">Guías</button>
          </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {recursos.map((recurso) => (
            <div key={recurso.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              
              {/* Top Row: Icon & Date */}
              <div className="flex justify-between items-start mb-6">
                {recurso.type === 'pdf' && (
                  <div className="w-12 h-12 rounded-[14px] bg-red-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                )}
                {recurso.type === 'audio' && (
                  <div className="w-12 h-12 rounded-[14px] bg-blue-50 flex items-center justify-center">
                    <Music className="w-5 h-5 text-blue-500" />
                  </div>
                )}
                {recurso.type === 'text' && (
                  <div className="w-12 h-12 rounded-[14px] bg-emerald-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                )}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {recurso.date}
                </span>
              </div>
              
              {/* Middle: Titles */}
              <div className="flex-1 mb-6">
                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-2">{recurso.title}</h3>
                <p className="text-xs text-gray-400 tracking-wide font-medium">{recurso.subtitle}</p>
              </div>
              
              {/* Bottom Row: Actions */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4">
                  <button className="text-blue-600 text-xs font-bold hover:text-blue-800 transition-colors">View Details</button>
                  <button className="text-red-500 text-xs font-bold hover:text-red-700 transition-colors">Remove</button>
                </div>
                
                {/* CTA Button */}
                {recurso.type === 'audio' ? (
                  <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 hover:scale-105 transition-all">
                    <Play className="w-4 h-4 ml-1 fill-white" />
                  </button>
                ) : (
                  <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Explore More Dashed Card */}
          <div className="rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center min-h-[220px] p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors group">
            <div className="text-gray-400 mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-1.5">Añadir Recurso</h3>
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">Sube tus archivos para acceso rápido</p>
          </div>

        </div>
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center">
          <Plus className="w-7 h-7" />
        </button>
      </div>
      
    </div>
  );
}
