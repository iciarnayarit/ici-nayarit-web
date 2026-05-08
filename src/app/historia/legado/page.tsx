import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/app/components/footer';
import EngagementPageTracker from '@/app/components/engagement-page-tracker';

const decades = [
  {
    decade: 'Década de 1920',
    color: 'border-[#B88A44]',
    dotColor: 'bg-[#B88A44]',
    events: [
      { year: '1920–1932', title: 'Orígenes en La Ladrillera', desc: 'Inician reuniones familiares en La Ladrillera, Ciudad de México. Familias se reúnen en el pozo del Hno. Heliodoro Flores en la calle de Tokio para hablar de la Palabra de Dios. Este es el origen de la Iglesia Central y el Presbiterio de la Iglesia Central.' },
      { year: '1924', title: 'Expansión en Puebla', desc: 'Llegan familias metodistas a Huejotzingo (Puebla–Tlaxcala), sembrando la semilla del evangelio en esa región.' },
    ],
  },
  {
    decade: 'Década de 1930',
    color: 'border-[#B88A44]',
    dotColor: 'bg-[#B88A44]',
    events: [
      { year: '1930', title: 'Fundación en Veracruz', desc: 'Fundación de la iglesia "El Divino Carpintero" en Veracruz, extendiendo el alcance del movimiento hacia el Golfo de México.' },
      { year: '1932', title: 'Oficialización de la Iglesia', desc: 'Se oficializa la Iglesia de Portales (Iglesia Central) el 1° de enero, con el Hno. Josué Mejía como primer pastor titular. También se organiza la iglesia "Emaús" en Huejotzingo.' },
    ],
  },
  {
    decade: 'Década de 1940',
    color: 'border-[#B88A44]',
    dotColor: 'bg-[#B88A44]',
    events: [
      { year: '1940', title: 'Presbiterio del Centro', desc: 'Nace el Presbiterio del Centro e inicia obra en el Estado de México, consolidando la presencia del movimiento en el centro del país.' },
      { year: '1945–1946', title: 'Fundación en Monterrey', desc: 'Fundación del Templo La Fe en Monterrey, Nuevo León, marcando el inicio de la expansión al norte del país.' },
    ],
  },
  {
    decade: 'Décadas de 1950–1990',
    color: 'border-[#B88A44]',
    dotColor: 'bg-[#B88A44]',
    events: [
      { year: '1950', title: 'Nuevo Liderazgo', desc: 'El Hno. Felipe Sánchez Muñiz asume la dirección general, iniciando una etapa de consolidación doctrinal y expansión masiva de presbiterios en toda la República Mexicana.' },
      { year: '1960–1990', title: 'Crecimiento Nacional', desc: 'Crecimiento sostenido con la fundación de múltiples presbiterios regionales: Guerrero, Tamaulipas, Chiapas, Oaxaca, Pacífico, Sinaloa, Baja California, entre otros.' },
    ],
  },
  {
    decade: 'Década de 2000',
    color: 'border-[#B88A44]',
    dotColor: 'bg-[#B88A44]',
    events: [
      { year: '1998', title: 'Tercer Pastor General', desc: 'El Hno. Aarón Cortés Hernández asume la dirección de la iglesia, dando inicio a una etapa de reorganización estructural y visión internacional.' },
      { year: '2000', title: 'Expansión Internacional', desc: 'Inician presbiterios en Estados Unidos y se consolida la presencia en Centro y Sudamérica, llevando el mensaje más allá de las fronteras nacionales.' },
      { year: '2002', title: 'Región Centroamérica', desc: 'Nace formalmente la Región Centroamérica, integrando Honduras, Nicaragua, Guatemala y El Salvador bajo una estructura organizada.' },
    ],
  },
  {
    decade: 'Centenario 2026',
    color: 'border-[#B88A44]',
    dotColor: 'bg-[#B88A44]',
    events: [
      { year: '22 Feb 2026', title: 'Primer Culto del Centenario', desc: 'Inicio de las celebraciones del centenario con el Primer Culto en la Iglesia Central, con presencia del Presbiterio Invitado: Misiones. Un tiempo de adoración, historia compartida y profunda gratitud.' },
      { year: '2026', title: '100 Años de Fe', desc: 'ICIAR celebra un siglo de historia viva — desde un pequeño grupo de familias en La Ladrillera hasta un movimiento con presencia en más de 30 presbiterios y regiones en tres continentes.' },
    ],
  },
];

const pastors = [
  { num: '01', name: 'Hno. Josué Mejía', period: '≈1920–1950', highlights: ['1920s — Surgimiento en La Ladrillera', '1932 — Inicio oficial de la Iglesia de Portales', 'Primer pastor titular de la Iglesia Central'] },
  { num: '02', name: 'Hno. Felipe Sánchez Muñiz', period: '1950–1998', highlights: ['Consolidación doctrinal integral', 'Crecimiento de múltiples presbiterios regionales', 'Expansión a toda la República Mexicana'] },
  { num: '03', name: 'Hno. Aarón Cortés Hernández', period: '1998–Presente', highlights: ['Reorganización estructural de la iglesia', '2002 — Nace la Región Centroamérica', 'Etapa de expansión global e internacional'] },
];

export default function LegadoPage() {
  return (
    <main className="min-h-screen bg-white">
      <EngagementPageTracker dedupeKey="historia-legado-read" />

      {/* Header */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/historia" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-semibold mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Historia
          </Link>
          <div className="inline-flex items-center gap-2 bg-[#B88A44]/20 text-[#B88A44] border border-[#B88A44]/30 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4">
            Línea de Tiempo
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            El Legado de <span className="text-[#B88A44]">ICIAR</span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-xl text-base">
            Un recorrido por más de 100 años de historia, fe y crecimiento, desde sus humildes orígenes hasta su presencia continental.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#d4a85a] via-[#B88A44] to-[#8a6432] opacity-30 hidden md:block" />

            <div className="space-y-16">
              {decades.map((d, di) => (
                <div key={d.decade}>
                  {/* Decade header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${d.dotColor} md:ml-[calc(50%-6px)] ring-4 ring-white shadow-md`} />
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] md:hidden">{d.decade}</h2>
                  </div>
                  <h2 className="hidden md:block text-xs font-black text-gray-400 uppercase tracking-[0.3em] text-center mb-8 -mt-6">{d.decade}</h2>

                  <div className="space-y-6 pl-4 md:pl-0">
                    {d.events.map((ev, ei) => (
                      <div key={ev.year} className={`md:flex ${ei % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-start`}>
                        {/* Content */}
                        <div className="md:w-[calc(50%-24px)]">
                          <div className={`bg-white border-l-4 ${d.color} rounded-r-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
                            <span className="text-[10px] font-black text-[#B88A44] uppercase tracking-widest">{ev.year}</span>
                            <h3 className="font-black text-gray-900 mt-1 mb-2">{ev.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{ev.desc}</p>
                          </div>
                        </div>
                        {/* Spacer for opposite side */}
                        <div className="hidden md:block md:w-[calc(50%-24px)]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pastors */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-black text-[#B88A44] uppercase tracking-widest mb-3 text-center">Línea por Pastor General</p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-12 text-center">Liderazgo a través de los Siglos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pastors.map(({ num, name, period, highlights }) => (
              <div key={num} className="relative bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 transition-colors">
                <span className="absolute top-5 right-5 text-5xl font-black text-white/5 select-none">{num}</span>
                <div className="w-8 h-8 rounded-full bg-[#B88A44]/20 flex items-center justify-center text-[#B88A44] font-black text-sm mb-4">{num}</div>
                <h3 className="font-black text-white text-base leading-tight mb-1">{name}</h3>
                <p className="text-xs text-[#B88A44] font-bold mb-4">{period}</p>
                <ul className="space-y-2">
                  {highlights.map(h => (
                    <li key={h} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="mt-1 w-1 h-1 rounded-full bg-[#B88A44] shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link href="/historia" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 min-h-[44px]">
            <ChevronLeft className="w-4 h-4" /> Volver a Historia
          </Link>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/doctrina" className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-amber-50 text-sm font-bold text-[#B88A44] hover:bg-amber-100 transition-colors min-h-[44px]">Ver Doctrina →</Link>
            <Link href="/historia/regiones" className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-amber-50 text-sm font-bold text-[#B88A44] hover:bg-amber-100 transition-colors min-h-[44px]">Ver Regiones →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
