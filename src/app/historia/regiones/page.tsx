import Link from 'next/link';
import { ChevronLeft, MapPin } from 'lucide-react';
import Footer from '@/app/components/footer';

const regions = [
  {
    country: 'México',
    flag: '🇲🇽',
    desc: 'Cuna y corazón de nuestro movimiento, con presencia en todo el territorio nacional.',
    color: 'border-[#B88A44]/30 bg-[#FDF8EF]',
    headerColor: 'bg-[#B88A44]',
    groups: [
      {
        name: 'Región Centro',
        items: ['Presbiterio de la Iglesia Central', 'Metropolitano México–Hidalgo', 'Sur-Oriente del Valle de México', 'Estado de México', 'Morelos', 'Guanajuato'],
      },
      {
        name: 'Región Sur y Sureste',
        items: ['Puebla–Tlaxcala', 'Guerrero', 'Veracruz', 'Oaxaca', 'Chiapas', 'Sureste', 'Peninsular del Sur', 'Región Chinanteca'],
      },
      {
        name: 'Región Norte y Pacífico',
        items: ['Tamaulipas', 'Nuevo León y Coahuila', 'Chihuahua', 'Sinaloa', 'Baja California', 'Baja California Sur', 'Pacífico', 'Pacífico Norte'],
      },
    ],
  },
  {
    country: 'Estados Unidos',
    flag: '🇺🇸',
    desc: 'Llevando el mensaje a través de las fronteras para la comunidad hispana en Norteamérica.',
    color: 'border-[#B88A44]/30 bg-[#FDF8EF]',
    headerColor: 'bg-[#8a6432]',
    groups: [
      {
        name: 'Presbiterios USA',
        items: ['Centro-Este USA', 'Centro-Oeste USA', 'Noreste USA', 'Región Noroeste USA'],
      },
    ],
  },
  {
    country: 'Centro y Sudamérica',
    flag: '🌎',
    desc: 'Expansión misionera que lleva el evangelio a través del continente americano desde el año 2002.',
    color: 'border-[#B88A44]/30 bg-[#FDF8EF]',
    headerColor: 'bg-[#6b4c24]',
    groups: [
      {
        name: 'Regiones Internacionales',
        items: ['Región Centroamérica — Honduras', 'Región Centroamérica — Nicaragua', 'Región Centroamérica — Guatemala', 'Región Centroamérica — El Salvador', 'Región Sudamérica — Argentina'],
      },
    ],
  },
];

const stats = [
  { num: '30+', label: 'Presbiterios y Regiones' },
  { num: '3', label: 'Países principales' },
  { num: '10+', label: 'Naciones alcanzadas' },
  { num: '100+', label: 'Años de presencia' },
];

export default function RegionesPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3d2a0e] via-gray-900 to-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/historia" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-semibold mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Historia
          </Link>
          <div className="inline-flex items-center gap-2 bg-[#B88A44]/20 text-[#B88A44] border border-[#B88A44]/30 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4">
            <MapPin className="w-3 h-3" /> Geografía Espiritual
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Nuestra <span className="text-[#B88A44]">Presencia</span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl text-base leading-relaxed">
            Desde un pequeño grupo en La Ladrillera hasta convertirnos en un movimiento con alcance continental.
            ICIAR tiene presencia en México, Estados Unidos y América Latina.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#B88A44] py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(({ num, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-white">{num}</p>
              <p className="text-xs text-white/80 font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 text-lg leading-relaxed">
            Cada uno de estos presbiterios representa <strong>miles de vidas transformadas</strong> por el Evangelio.
            Al celebrar nuestro centenario, honramos el esfuerzo misionero que ha llevado nuestra fe
            desde México a todo el continente americano.
          </p>
        </div>
      </section>

      {/* Regions */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {regions.map(({ country, flag, desc, color, headerColor, groups }) => (
            <div key={country} className={`rounded-3xl border-2 overflow-hidden ${color}`}>
              {/* Country header */}
              <div className={`${headerColor} px-5 py-5 flex items-center gap-4`}>
                <span className="text-3xl shrink-0">{flag}</span>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-white leading-snug">{country}</h2>
                  <p className="text-white/70 text-sm mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>

              {/* Presbytery groups */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(({ name, items }) => (
                  <div key={name}>
                    <h3 className="text-xs font-black text-[#B88A44] uppercase tracking-widest mb-3">{name}</h3>
                    <ul className="space-y-2">
                      {items.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                          <MapPin className="w-3 h-3 mt-1 shrink-0 text-[#B88A44]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Growth note */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-black text-[#B88A44] uppercase tracking-widest mb-4">Un Siglo de Crecimiento</p>
          <h2 className="text-2xl md:text-3xl font-black mb-6">De La Ladrillera al Mundo</h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            Lo que comenzó como reuniones familiares en una colonia de la Ciudad de México se ha convertido
            en un movimiento continental. La visión de nuestros fundadores, combinada con el trabajo fiel de
            miles de creyentes, ha hecho posible que el mensaje del Evangelio llegue a cada rincón del continente americano.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link href="/historia" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 min-h-[44px]">
            <ChevronLeft className="w-4 h-4" /> Volver a Historia
          </Link>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/historia/legado" className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-amber-50 text-sm font-bold text-[#B88A44] hover:bg-amber-100 transition-colors min-h-[44px]">Ver Legado →</Link>
            <Link href="/doctrina" className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-amber-50 text-sm font-bold text-[#B88A44] hover:bg-amber-100 transition-colors min-h-[44px]">Ver Doctrina →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
