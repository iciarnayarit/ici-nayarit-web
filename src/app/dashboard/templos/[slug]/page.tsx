'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Navigation, Bookmark, Phone, Share2, Clock, Map, Plus, Minus, MapPin } from 'lucide-react';

export default function TemplosDashboardPage() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16 w-full relative font-sans">
      
      {/* Top Header Breadcrumbs */}
      <header className="px-6 md:px-10 py-5 w-full max-w-7xl mx-auto flex items-center bg-white border-b border-gray-200/50 hidden md:flex sticky top-0 z-20 shadow-sm mb-6">
        <div className="flex items-center gap-4 text-sm font-bold">
          <Link href="/" className="text-gray-900 hover:text-blue-600 transition-colors">Azure Meridian</Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 font-medium">Dashboard</span>
          <span className="text-blue-600 ml-4 font-bold tracking-wide">Temples</span>
        </div>
      </header>

      <div className="px-6 md:px-10 max-w-7xl mx-auto space-y-8 mt-4 md:mt-0">
        
        {/* Hero Section */}
        <div className="relative w-full h-[400px] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-md group">
          <Image 
            src="https://images.unsplash.com/photo-1548625361-24838421ccec" 
            alt="Temple Interior" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          {/* Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent p-8 md:p-12 flex flex-col justify-end">
            <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full w-fit mb-4 shadow-sm">
              Featured Sanctuary
            </span>
            <div className="flex justify-between items-end w-full">
              <h1 className="text-white text-3xl md:text-5xl font-bold font-display tracking-tight leading-tight">
                Azure Meridian Temple
              </h1>
              <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-105 shadow-lg group/heart">
                <Heart className="w-5 h-5 text-white fill-white/80 group-hover/heart:fill-white transition-all transform group-hover/heart:scale-110" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Address & Services) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Card */}
            <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Address</span>
                <span className="bg-green-50 text-green-600 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Open until 8:00 PM
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed mb-8 max-w-sm">
                1200 Cathedral Way,<br/>Meridian District, Portland, OR 97201
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                <button className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 shadow-sm">
                  <Navigation className="w-4 h-4 fill-white shrink-0" />
                  <span>Get Directions</span>
                </button>
                <button className="w-full sm:flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 md:py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-gray-200 transition-colors">
                  <Bookmark className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">Save to My Temples</span>
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="flex-1 sm:flex-none w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Service Times Card */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest">Service Times</h3>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="divide-y divide-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center p-6 gap-4 sm:gap-8">
                  <div className="sm:w-32 font-bold text-gray-900">Sunday</div>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-bold">
                      Morning Mass • 9:00 AM
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-bold">
                      Vespers • 5:30 PM
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center p-6 gap-4 sm:gap-8">
                  <div className="sm:w-32 font-bold text-gray-900">Tuesday</div>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-bold">
                      Midweek • 7:00 PM
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center p-6 gap-4 sm:gap-8">
                  <div className="sm:w-32 font-bold text-gray-900">Saturday</div>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-[11px] font-bold">
                      Confession • 3:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column (Map) */}
          <div className="bg-gray-200/50 rounded-[24px] shadow-sm border border-gray-100 flex flex-col relative overflow-hidden h-full min-h-[500px]">
            <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center shadow-sm z-10 w-full shrink-0">
              <h3 className="text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest">Location Map</h3>
              <Map className="w-4 h-4 text-gray-400" />
            </div>
            
            {/* Phone Bezel Container */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-200 relative">
              <div className="relative w-full max-w-[240px] aspect-[9/18] bg-white rounded-[32px] md:rounded-[40px] border-[6px] md:border-[10px] border-white shadow-xl overflow-hidden pointer-events-none group">
                
                {/* Fake map line graphics (using Tailwind gradients and shapes instead of heavy images) */}
                <div className="absolute inset-0 bg-[#E5E9F0]">
                  {/* Faux map streets */}
                  <div className="absolute top-0 right-0 w-full h-full transform skew-x-12">
                    <div className="h-full w-4 bg-white/70 ml-12 rotate-45 transform origin-top left-10 relative"></div>
                    <div className="h-full w-2 bg-white/70 ml-24 rotate-45 transform origin-top left-24 relative absolute"></div>
                    <div className="w-full h-8 bg-white/70 bottom-32 -rotate-12 absolute"></div>
                    <div className="w-full h-3 bg-white/70 bottom-12 rotate-12 absolute"></div>
                  </div>
                  {/* Faux park / shapes */}
                  <div className="absolute bottom-16 left-4 w-32 h-24 bg-green-100/50 rounded-2xl"></div>
                </div>

                {/* Map Pin */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 text-blue-600 fill-blue-600 flex items-center justify-center">
                     <MapPin className="w-full h-full" fill="currentColor" stroke="white" strokeWidth={1} />
                  </div>
                  <div className="w-3 h-1 bg-black/20 rounded-[100%] blur-[1px] -mt-1"></div>
                  {/* Pulse effect */}
                  <div className="absolute bg-blue-500/30 w-12 h-12 rounded-full scale-150 -z-10 animate-ping"></div>
                </div>
                
                {/* Top Notch simulator */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-4 bg-white rounded-b-xl shadow-sm z-20">
                  <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              
              {/* Floating Zoom Controls for the "map" card overlay */}
              <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-row overflow-hidden pointer-events-auto">
                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-r border-gray-200">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* Gallery Selection */}
        <div className="mt-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 tracking-widest uppercase mb-1">Temple Gallery</h2>
              <p className="text-xs text-gray-500 font-medium">Immersive views of our sanctuary and surrounding grounds.</p>
            </div>
            <button className="text-blue-600 text-xs font-bold hover:text-blue-800 transition-colors shrink-0">
              View All 24 Photos
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
              <div className="relative w-full h-48 md:h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1507676184212-d0330a210fec" 
                  alt="Interior" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="px-5 py-4 border-t border-gray-50">
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Sanctuary</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
              <div className="relative w-full h-48 md:h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1598902404092-2dfa84a6b262" 
                  alt="Gardens" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="px-5 py-4 border-t border-gray-50">
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">South Gardens</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
              <div className="relative w-full h-48 md:h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c" 
                  alt="Lightwell" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="px-5 py-4 border-t border-gray-50">
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">The Lightwell</p>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
