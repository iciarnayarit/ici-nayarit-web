import { allAnnouncements, slugify } from '@/app/lib/announcements';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/app/components/footer';
import { Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react';

export default async function AvisoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const announcement = allAnnouncements.find(a => slugify(a.title) === resolvedParams.slug);

  if (!announcement) {
    notFound();
  }

  return (
    <>
      <div className="bg-[#F9FAFB] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-96 object-cover" />
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{announcement.category}</span>
                <span className="text-sm text-gray-500 font-medium">{announcement.date}</span>
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
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>{announcement.description}</p>
                {/* You can add more detailed content here if available in your data */}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/avisos" className="inline-flex items-center text-[#B88A44] hover:text-opacity-80 font-semibold transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a todos los avisos
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}