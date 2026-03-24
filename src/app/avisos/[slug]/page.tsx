'use client';

import { allAnnouncements, slugify } from '@/app/lib/announcements';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Footer from '@/app/components/footer';
import { Calendar, MapPin, Clock, ArrowLeft, Bookmark, Share2 } from 'lucide-react';

export default function AvisoDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const announcement = allAnnouncements.find(a => slugify(a.title) === slug);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Client-side initialization of saved state
    const saved = localStorage.getItem('savedAnnouncements');
    if (saved) {
      const savedList = JSON.parse(saved);
      if (announcement) {
        setIsSaved(savedList.includes(announcement.title));
      }
    }
  }, [announcement]);

  if (!announcement) {
    notFound();
  }

  const toggleSave = () => {
    const saved = localStorage.getItem('savedAnnouncements');
    let savedList = saved ? JSON.parse(saved) : [];
    
    if (isSaved) {
      savedList = savedList.filter((t: string) => t !== announcement.title);
      setIsSaved(false);
    } else {
      savedList.push(announcement.title);
      setIsSaved(true);
    }
    localStorage.setItem('savedAnnouncements', JSON.stringify(savedList));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Aviso: ${announcement.title}`,
          text: announcement.description,
          url,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <>
      <div className="bg-[#F9FAFB] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative">
              <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-96 object-cover" />
              <div className="absolute top-4 right-4 flex gap-3">
                <button 
                  onClick={toggleSave}
                  className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${isSaved ? 'bg-[#B88A44] text-white' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-3 bg-white/90 rounded-full shadow-lg backdrop-blur-md text-gray-700 hover:bg-white transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{announcement.category}</span>
                <span className="text-sm text-gray-400 font-medium">{announcement.date}</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 font-display mb-6">{announcement.title}</h1>
              <div className="flex flex-wrap items-center text-gray-600 text-sm gap-x-6 gap-y-2 mb-8 border-y py-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-[#B88A44]" />
                  <span>{announcement.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-[#B88A44]" />
                  <span>{announcement.time}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#B88A44]" />
                  <span>{announcement.date}</span>
                </div>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed text-lg">
                <p>{announcement.description}</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/avisos" className="inline-flex items-center text-[#B88A44] hover:text-opacity-80 font-semibold transition-colors group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Volver a todos los avisos
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}