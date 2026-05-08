import Link from 'next/link';
import { ArrowRight, BookOpen, Map, Clock, Users } from 'lucide-react';
import Footer from '@/app/components/footer';
import EngagementPageTracker from '@/app/components/engagement-page-tracker';

const highlights = [
  { year: '1920', event: 'Primeras reuniones en la Colonia La Ladrillera, Ciudad de México.' },
  { year: '1932', event: 'Fundación oficial de la Iglesia de Portales (Iglesia Central).' },
  { year: '1945', event: 'Fundación del Templo La Fe en Monterrey, Nuevo León.' },
  { year: '1980', event: 'Expansión a más de 10 presbiterios en toda la República Mexicana.' },
  { year: '2000', event: 'Inicio de presbiterios en Estados Unidos y expansión internacional.' },
  { year: '2026', event: 'Celebración del Centenario — 100 años de fe y crecimiento.' },
];

const sections = [
  {
    href: '/historia/legado',
    icon: Clock,
    color: 'bg-[#FDF8EF] text-[#7a5c2e] border-[#B88A44]/30',
    iconColor: 'text-[#B88A44]',
    title: 'Legado',
    desc: 'Línea de tiempo decade a decade — desde 1920 hasta el presente.',
  },
  {
    href: '/doctrina',
    icon: BookOpen,
    color: 'bg-[#FDF8EF] text-[#7a5c2e] border-[#B88A44]/30',
    iconColor: 'text-[#B88A44]',
    title: 'Doctrina',
    desc: 'Los 8 puntos doctrinales que rigen nuestra fe cristiana.',
  },
  {
    href: '/historia/regiones',
    icon: Map,
    color: 'bg-[#FDF8EF] text-[#7a5c2e] border-[#B88A44]/30',
    iconColor: 'text-[#B88A44]',
    title: 'Regiones',
    desc: 'Presencia en México, Estados Unidos y América Latina.',
  },
];

export default function HistoriaPage() {
  return (
    <main className="min-h-screen bg-white">
      <EngagementPageTracker dedupeKey="historia-read" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-[#1a1209] py-24 md:py-36 px-4">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #B88A44 0%, transparent 60%), radial-gradient(circle at 80% 20%, #B88A44 0%, transparent 50%)' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#B88A44]/20 text-[#B88A44] border border-[#B88A44]/30 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-6">
            <Users className="w-3 h-3" /> Desde 1926
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Un Siglo de<br />
            <span className="text-[#B88A44]">Historia Viva</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Desde un pequeño grupo de familias reunidas en La Ladrillera, ICIAR ha crecido
            para convertirse en un movimiento de fe con presencia en todo el continente americano.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/historia/legado" className="inline-flex items-center gap-2 bg-[#B88A44] hover:bg-[#a07939] text-white font-bold px-8 py-3.5 rounded-full transition-colors text-sm">
              Ver Línea de Tiempo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/historia/regiones" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-full border border-white/20 transition-colors text-sm">
              Nuestra Presencia <Map className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stat banner */}
      <section className="bg-[#B88A44] py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[['100+', 'Años de historia'], ['30+', 'Presbiterios y regiones'], ['3', 'Continentes']].map(([num, label]) => (
            <div key={label} className="py-2">
              <p className="text-4xl md:text-5xl font-black text-white">{num}</p>
              <p className="text-sm text-white/80 font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Narrative */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-black text-[#B88A44] uppercase tracking-widest mb-4">Nuestra Historia</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">
            Crónica de Fe
          </h2>
          <div className="prose prose-lg text-gray-600 space-y-5">
            <p>
              El presbiterio de la Iglesia Central surge con la misma iglesia en los años 20&apos;s del siglo pasado;
              en un principio no fue identificado como tal, sino simplemente como iglesia y después como iglesia central,
              sin embargo su estructura, organización y membresía pronto hicieron necesario su reconocimiento como presbiterio.
            </p>
            <p>
              Su inicio fue cuando en los años mencionados se juntan familias de la colonia <strong>La Ladrillera</strong> en
              un pozo que pertenecía al Hno. Heliodoro Flores en la calle de Tokio, para hablar de la Palabra de Dios.
              La iglesia de Portales como tal empieza a funcionar el <strong>1° de Enero de 1932</strong> y oficialmente
              el pastor titular fue el Hno. Josué Mejía.
            </p>
            <p>
              A lo largo de décadas de crecimiento sostenido, la iglesia se expandió desde el centro del país hacia
              todos sus rincones, y posteriormente cruzó fronteras para llegar a Estados Unidos, Centroamérica y Sudamérica.
              Cada presbiterio representa miles de vidas transformadas por el Evangelio.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline highlights */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-black text-[#B88A44] uppercase tracking-widest mb-3 text-center">Hitos Principales</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-12 text-center">Momentos que Definieron Nuestra Historia</h2>
          <div className="relative">
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-gradient-to-b from-[#B88A44] via-amber-200 to-transparent hidden sm:block" />
            <div className="space-y-6">
              {highlights.map(({ year, event }) => (
                <div key={year} className="flex gap-6 items-start">
                  <div className="shrink-0 w-16 text-right">
                    <span className="text-sm font-black text-[#B88A44]">{year}</span>
                  </div>
                  <div className="hidden sm:flex shrink-0 mt-1.5 w-3 h-3 rounded-full bg-[#B88A44] ring-4 ring-amber-50 z-10" />
                  <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{event}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/historia/legado" className="inline-flex items-center gap-2 text-[#B88A44] font-bold text-sm hover:underline">
              Ver línea de tiempo completa <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section cards */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-black text-[#B88A44] uppercase tracking-widest mb-3 text-center">Explorar</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-10 text-center">Conoce Más Sobre Nosotros</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {sections.map(({ href, icon: Icon, color, iconColor, title, desc }) => (
              <Link key={href} href={href} className={`group flex flex-col p-6 rounded-2xl border-2 hover:shadow-md transition-all ${color}`}>
                <div className={`w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center mb-4 ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg mb-1">{title}</h3>
                <p className="text-sm opacity-70 leading-relaxed flex-1">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-black opacity-60 group-hover:opacity-100 transition-opacity">
                  Ver más <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pastors */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-black text-[#B88A44] uppercase tracking-widest mb-3">Liderazgo</p>
          <h2 className="text-2xl md:text-3xl font-black mb-10">Pastores Generales</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { num: '01', name: 'Hno. Josué Mejía', period: '≈1920–1950', note: 'Fundador y primer pastor de la Iglesia Central.' },
              { num: '02', name: 'Hno. Felipe Sánchez Muñiz', period: '1950–1998', note: 'Consolidación doctrinal y expansión de presbiterios.' },
              { num: '03', name: 'Hno. Aarón Cortés Hernández', period: '1998–Presente', note: 'Reorganización y expansión internacional.' },
            ].map(({ num, name, period, note }) => (
              <div key={num} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
                <span className="text-4xl font-black text-[#B88A44] opacity-40">{num}</span>
                <h3 className="font-black text-base mt-2 leading-tight">{name}</h3>
                <p className="text-xs text-[#B88A44] font-bold mt-1">{period}</p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
