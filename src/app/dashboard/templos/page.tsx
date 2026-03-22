'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin, BadgeCheck, Plus } from 'lucide-react';

const temples = [
  {
    id: 1,
    name: 'Salt Lake Temple',
    slug: 'salt-lake',
    location: '50 N West Temple St, Salt Lake City, UT 84150',
    image: 'https://images.unsplash.com/photo-1548625361-24838421ccec',
    status: 'Open until 9:00 PM',
    statusColor: 'bg-green-500',
    featured: true,
  },
  {
    id: 2,
    name: 'Rome Italy Temple',
    slug: 'rome-italy',
    location: 'Via di Settebagni, 376, 00138 Roma RM, Italy',
    image: 'https://images.unsplash.com/photo-1533667688223-955a02e6c52a',
    status: 'Open until 8:30 PM',
    statusColor: 'bg-green-500',
    featured: false,
  },
  {
    id: 3,
    name: 'San Diego Temple',
    slug: 'san-diego',
    location: '7474 Charmant Dr, San Diego, CA 92122',
    image: 'https://images.unsplash.com/photo-1544485549-3733c713b1ab',
    status: 'Closing soon',
    statusColor: 'bg-yellow-500',
    featured: false,
  },
  {
    id: 4,
    name: 'London England Temple',
    slug: 'london-england',
    location: 'West Park Rd, Newchapel, Lingfield RH7 6HW, UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    status: 'Open until 9:30 PM',
    statusColor: 'bg-green-500',
    featured: false,
  },
  {
    id: 5,
    name: 'São Paulo Brazil Temple',
    slug: 'sao-paulo',
    location: 'Av. Prof. Francisco Morato, 2430 - Caxingui, Brazil',
    image: 'https://images.unsplash.com/photo-1518063319800-4775d7b579de',
    status: 'Open until 9:00 PM',
    statusColor: 'bg-green-500',
    featured: true,
  },
  {
    id: 6,
    name: 'Washington D.C. Temple',
    slug: 'washington-dc',
    location: '9900 Stoneybrook Dr, Kensington, MD 20895',
    image: 'https://images.unsplash.com/photo-1584989679124-bca5de5bfa4a',
    status: 'Closed for Maintenance',
    statusColor: 'bg-gray-400',
    featured: false,
  }
];

export default function TemplosDirectoryPage() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-20 w-full font-sans relative">
      
      {/* Header Area */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto pt-8 mb-10 block">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-[32px] font-bold text-gray-900 mb-2.5 font-display tracking-tight">Temple Directory</h1>
            <p className="text-sm font-medium text-gray-500">Access and manage international temple locations and operating hours.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or location..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm shrink-0">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          
          {temples.map((temple) => (
            <div key={temple.id} className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all hover:-translate-y-1 group">
              
              {/* Image Section */}
              <div className="relative h-56 md:h-64 w-full overflow-hidden bg-gray-100">
                <Image 
                  src={temple.image} 
                  alt={temple.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
                {temple.featured && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-blue-500 text-white text-[9px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
                      Featured
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{temple.name}</h3>
                  <BadgeCheck className="w-5 h-5 text-blue-400 shrink-0 fill-blue-50" />
                </div>
                
                <div className="flex items-start gap-2.5 text-xs text-gray-500 mb-8 font-medium">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
                  <span className="leading-snug pr-4">{temple.location}</span>
                </div>
                
                {/* Footer Section */}
                <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${temple.statusColor}`}></div>
                    <span className="text-[11px] font-semibold text-gray-600">{temple.status}</span>
                  </div>
                  <Link 
                    href={`/dashboard/templos/${temple.slug}`} 
                    className="text-blue-600 text-xs font-bold hover:text-blue-800 transition-colors flex items-center gap-1.5 group/link"
                  >
                    View Details 
                    <span className="group-hover/link:translate-x-0.5 transition-transform duration-200">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Load More Button */}
        <div className="mt-12 flex justify-center">
          <button className="bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 hover:shadow transition-all">
            Load More Temples
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
