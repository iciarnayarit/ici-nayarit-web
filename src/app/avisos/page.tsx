import { Fragment } from 'react';
import { Globe, Calendar, MapPin, ArrowRight, Bell, Tag } from 'lucide-react';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';

const featuredAnnouncement = {
  category: 'Destacado',
  date: '20 Oct 2023',
  title: 'Gran Convocatoria de Oración Regional',
  description: 'Este viernes nos reuniremos todas las iglesias de la zona para interceder por nuestra comunidad, las familias y el crecimiento espiritual de Nayarit. ¡Tu presencia es vital!',
  location: 'Templo Central, Tepic',
  time: '19:00 hrs',
  imageUrl: 'https://i.imgur.com/21A3dqQ.png',
};

const recentAnnouncements = [
  {
    category: 'Comunidad',
    date: '18 Oct 2023',
    title: 'Inicio de Escuela Dominical',
    description: 'Iniciamos un nuevo ciclo de enseñanza para los más pequeños. Inscríbelos este domingo al finalizar el culto.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/2p8b1aN.jpeg',
  },
  {
    category: 'Evento',
    date: '15 Oct 2023',
    title: 'Audiciones para el Coro',
    description: '¿Tienes talento para el canto? Te invitamos a participar en las audiciones para nuestro ministerio de alabanza.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/83oXnOb.jpeg',
  },
  {
    category: 'Misiones',
    date: '12 Oct 2023',
    title: 'Brigada de Ayuda en La Sierra',
    description: 'Estaremos visitando comunidades necesitadas el próximo mes. Estamos recolectando víveres y ropa en buen estado.',
    link: '¿Cómo ayudar?',
    imageUrl: 'https://i.imgur.com/4S2iT9P.jpeg',
  },
  {
    category: 'Aviso',
    date: '10 Oct 2023',
    title: 'Cambio de Horario: Células',
    description: 'Informamos a todos los líderes que la reunión de capacitación mensual ha sido reprogramada para el lunes a las 20:00.',
    link: 'Ver horario',
    imageUrl: 'https://i.imgur.com/o1bQ1iB.jpeg',
  },
];

const filters = ['Todos', 'Eventos', 'Comunidad', 'Avisos', 'Misiones'];

const CategoryTag = ({ category }: { category: string }) => {
    let colorClass = 'bg-gray-400';
    switch (category.toLowerCase()) {
        case 'destacado': colorClass = 'bg-orange-500'; break;
        case 'comunidad': colorClass = 'bg-blue-500'; break;
        case 'evento': colorClass = 'bg-green-500'; break;
        case 'misiones': colorClass = 'bg-yellow-500'; break;
        case 'aviso': colorClass = 'bg-red-500'; break;
    }
    return (
        <span className={`text-white text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
            {category}
        </span>
    );
};


export default function AvisosPage() {
  return (
    <>
    <Header />
    <div className="bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <header className="text-center md:text-left mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-display">Avisos y Anuncios</h1>
          <p className="mt-3 text-lg text-gray-500">Mantente informado sobre las actividades de nuestra comunidad cristiana en Nayarit.</p>
        </header>

        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Bell className="h-6 w-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-700">Aviso Destacado</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden md:flex">
            <div className="md:w-1/2">
              <img src={featuredAnnouncement.imageUrl} alt={featuredAnnouncement.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-8 md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <CategoryTag category={featuredAnnouncement.category} />
                <span className="text-sm text-gray-500 font-medium">{featuredAnnouncement.date}</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{featuredAnnouncement.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{featuredAnnouncement.description}</p>
              <div className="flex items-center text-gray-500 text-sm mb-8">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{featuredAnnouncement.location}</span>
                <Calendar className="h-4 w-4 mr-2 ml-6" />
                <span>{featuredAnnouncement.time}</span>
              </div>
              <button className="self-start bg-orange-500 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                Registrar asistencia
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {filters.map((filter, idx) => (
                <button 
                    key={filter}
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${idx === 0 ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    {filter}
                </button>
            ))}
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-700 text-center md:text-left mb-8">Anuncios Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {recentAnnouncements.map((item) => (
              <div key={item.title} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="h-48 overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                        <CategoryTag category={item.category} />
                        <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">{item.description}</p>
                    <a href="#" className="text-orange-500 font-semibold hover:text-orange-600 text-sm flex items-center group-hover:underline">
                        {item.link} <ArrowRight className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform"/>
                    </a>
                </div>
              </div>
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