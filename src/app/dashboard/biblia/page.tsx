'use client';

import Image from 'next/image';
import { ArrowLeft, Bell, Settings, Share2, Copy, Trash2, AlignLeft, Italic, Link2, Plus, Search, Book, Droplet, Shield, Sun, Heart } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="bg-[#F4F7F6] min-h-screen pb-12">

      {/* Main Content Area */}
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Versículos Guardados Component */}
        <div className="mb-14">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1.5 font-display tracking-tight">Versículos Guardados</h1>
            <p className="text-sm font-medium text-gray-500">Tus pasajes favoritos en un solo lugar</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar en mis versículos..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-[13px] font-semibold shadow-sm transition-colors">Todos los libros</button>
              <button className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 px-5 py-2 rounded-full text-[13px] font-semibold transition-colors">Salmos</button>
              <button className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 px-5 py-2 rounded-full text-[13px] font-semibold transition-colors">Proverbios</button>
              <button className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 px-5 py-2 rounded-full text-[13px] font-semibold transition-colors">Génesis</button>
              <button className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 px-5 py-2 rounded-full text-[13px] font-semibold transition-colors">Mateo</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Card */}
            <div className="rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center min-h-[220px] p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors group">
              <div className="text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-[15px] mb-1.5">Guardar un nuevo versículo</h3>
              <p className="text-[11px] text-gray-500 font-medium tracking-wide">Añade pasajes que te inspiren para acceder a ellos rápidamente.</p>
            </div>
            
            {/* Verse Card 1 */}
            <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Book className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">24 OCT 2023</span>
              </div>
              <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed mb-8 flex-1">
                "Porque yo sé muy bien los planes que tengo para ustedes —afirma el Señor—, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza."
              </p>
              <div className="mt-auto">
                <span className="text-sm font-bold text-blue-600">Jeremías 29:11</span>
              </div>
            </div>

            {/* Verse Card 2 */}
            <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Droplet className="w-4 h-4 text-blue-600 fill-blue-600" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">12 NOV 2023</span>
              </div>
              <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed mb-8 flex-1">
                "El Señor es mi pastor, nada me falta; en verdes pastos me hace descansar. Junto a tranquilas aguas me conduce."
              </p>
              <div className="mt-auto">
                <span className="text-sm font-bold text-blue-600">Salmos 23:1-2</span>
              </div>
            </div>

            {/* Verse Card 3 */}
            <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600 fill-blue-600" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">05 ENE 2024</span>
              </div>
              <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed mb-8 flex-1">
                "Todo lo puedo en Cristo que me fortalece."
              </p>
              <div className="mt-auto">
                <span className="text-sm font-bold text-blue-600">Filipenses 4:13</span>
              </div>
            </div>

            {/* Verse Card 4 */}
            <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">15 FEB 2024</span>
              </div>
              <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed mb-8 flex-1">
                "Tu palabra es una lámpara a mis pies y una luz en mi camino."
              </p>
              <div className="mt-auto">
                <span className="text-sm font-bold text-blue-600">Salmos 119:105</span>
              </div>
            </div>

            {/* Verse Card 5 */}
            <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-blue-600 fill-blue-600" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">20 MAR 2024</span>
              </div>
              <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed mb-8 flex-1">
                "Y sobre todas estas cosas vestíos de amor, que es el vínculo perfecto."
              </p>
              <div className="mt-auto">
                <span className="text-sm font-bold text-blue-600">Colosenses 3:14</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative w-full h-[320px] rounded-3xl overflow-hidden shadow-sm">
          <Image 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" 
            alt="Mountains" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-white text-3xl md:text-5xl font-bold leading-tight max-w-3xl font-display mt-4 font-sans">
              "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
            </h1>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-8 h-[2px] bg-blue-400"></div>
              <p className="text-white font-medium tracking-wide">Jeremiah 29:11</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors flex-1 sm:flex-none">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors flex-1 sm:flex-none">
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <button className="text-red-500 hover:text-red-600 font-semibold text-sm flex items-center justify-center gap-2 px-4 py-2 mt-3 sm:mt-0 w-full sm:w-auto transition-colors">
            <Trash2 className="w-4 h-4" /> Remove from Saved
          </button>
        </div>

        {/* content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Reflections) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
             <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Personal Reflections</h3>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest hidden sm:block">Last edited today at 2:14 PM</span>
            </div>
            
            <textarea 
              className="w-full flex-1 resize-none outline-none text-gray-500 font-medium placeholder:text-gray-300 text-base leading-relaxed"
              placeholder="Start typing your reflections on this verse..."
            ></textarea>
            
            <div className="flex justify-between items-center pt-5 border-t border-gray-100 mt-4">
              <div className="flex gap-5 text-gray-400">
                <button className="hover:text-gray-600 transition-colors"><b className="font-serif text-lg leading-none">B</b></button>
                <button className="hover:text-gray-600 transition-colors flex items-center"><Italic className="w-5 h-5" /></button>
                <button className="hover:text-gray-600 transition-colors flex items-center"><Link2 className="w-5 h-5" /></button>
              </div>
              <span className="text-xs text-gray-400 font-medium">124 Words</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Verse Details Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 text-sm">Verse Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-4">
                  <span className="text-gray-500 font-medium">Book</span>
                  <span className="font-bold text-gray-900">Jeremiah</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-4">
                  <span className="text-gray-500 font-medium">Chapter</span>
                  <span className="font-bold text-gray-900">29</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-500 font-medium">Translation</span>
                  <span className="font-bold text-blue-600">NIV</span>
                </div>
              </div>
              <button className="w-full mt-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-6 border-t border-gray-100 flex items-center justify-center hover:text-gray-800 transition-colors">
                View Full Chapter <span className="ml-2 text-lg leading-none">›</span>
              </button>
            </div>

            {/* Similar Verses Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-blue-500 text-xl leading-none">✨</span>
                <h3 className="font-bold text-gray-900 text-sm">Similar Verses</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 italic leading-relaxed mb-3">"Being confident of this, that he who began a good work in you..."</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Philippians 1:6</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 italic leading-relaxed mb-3">"And we know that in all things God works for the good of those who love..."</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Romans 8:28</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 italic leading-relaxed mb-3">"But seek first his kingdom and his righteousness, and all these things..."</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Matthew 6:33</span>
                </div>
              </div>
              
              <button className="w-full mt-8 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                Discover More
              </button>
            </div>

          </div>
          
          {/* Below Left Column (Tags) */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Contextual Tags</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">#Hope</span>
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">#Future</span>
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">#Promise</span>
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">#Assurance</span>
              <button className="border border-gray-200 bg-white text-gray-500 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors">+ Add Tag</button>
            </div>
          </div>
          
          {/* Community Trending Block */}
          <div className="relative">
            <div className="bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-200/60 border-dashed relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-orange-200 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-green-700 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                </div>
                <span className="text-[9px] font-bold text-gray-500 ml-2 uppercase tracking-widest">+42 OTHERS STUDYING THIS</span>
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">This verse is trending in your local community group this week.</p>
              <button className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:text-blue-800 transition-colors flex items-center gap-2">
                JOIN DISCUSSION 💬
              </button>
            </div>
            
            {/* Floating Action Button */}
            <button className="absolute -bottom-5 -right-2 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 z-10">
              <Plus className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
