'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpen, Megaphone, Sparkles, Star } from 'lucide-react';
import { stableMergeSort } from '@/lib/perf-algorithms';
import { triviaBasePointsByDifficulty, TRIVIA_TOPICS } from '@/lib/trivia-topics';

type TriviaCategory =
  | 'Antiguo Testamento'
  | 'Nuevo Testamento'
  | 'Evangelios'
  | 'Iglesia Primitiva'
  | 'Cartas'
  | 'Profecía'
  | 'Temas generales';

const TOPIC_ORDER_BY_CATEGORY: Record<TriviaCategory, string[]> = {
  'Antiguo Testamento': [
    'tema-creacion',
    'tema-eden',
    'tema-diluvio',
    'tema-patriarcas',
    'tema-jose-egipto',
    'tema-exodo-general',
    'tema-diez-mandamientos',
    'tema-jueces-israel',
    'tema-david-goliat',
    'tema-salomon-sabiduria',
    'genesis',
    'exodo',
    'levitico',
    'numeros',
    'deuteronomio',
    'josue',
    'jueces',
    'rut',
    '1-samuel',
    '2-samuel',
    '1-reyes',
    '2-reyes',
    '1-cronicas',
    '2-cronicas',
    'esdras',
    'nehemias',
    'ester',
    'job',
    'salmos',
    'proverbios',
    'eclesiastes',
    'cantares',
  ],
  'Nuevo Testamento': ['tema-mujeres-biblia'],
  Evangelios: [
    'tema-nacimiento-jesus',
    'vida-de-jesus',
    'mateo',
    'marcos',
    'lucas',
    'juan',
    'tema-parabolas-jesus',
    'parabolas-y-sabiduria',
    'tema-milagros-jesus',
    'tema-sermon-monte',
    'tema-pasion-resurreccion',
  ],
  'Iglesia Primitiva': ['historia-de-la-iglesia', 'hechos', 'tema-12-apostoles', 'tema-viajes-pablo'],
  Cartas: ['romanos', '1-corintios', '2-corintios', 'galatas'],
  'Profecía': [
    'tema-grandes-profetas-general',
    'grandes-profetas',
    'isaias',
    'jeremias',
    'lamentaciones',
    'ezequiel',
    'daniel',
    'oseas',
    'joel',
    'amos',
    'abdias',
    'jonas',
    'miqueas',
    'nahum',
    'habacuc',
    'sofonias',
    'hageo',
    'zacarias',
    'malaquias',
    'tema-apocalipsis-general',
    'apocalipsis',
  ],
  'Temas generales': [],
};

const topicIcons = [Sparkles, BookOpen, Megaphone, Star] as const;

function formatPoints(n: number) {
  return new Intl.NumberFormat('es-MX').format(n);
}

function categoryByTopicSlug(slug: string): TriviaCategory {
  const antiguoTestamento = new Set([
    'genesis',
    'exodo',
    'levitico',
    'numeros',
    'deuteronomio',
    'josue',
    'jueces',
    'rut',
    '1-samuel',
    '2-samuel',
    '1-reyes',
    '2-reyes',
    '1-cronicas',
    '2-cronicas',
    'esdras',
    'nehemias',
    'ester',
    'job',
    'salmos',
    'proverbios',
    'eclesiastes',
    'cantares',
    'tema-creacion',
    'tema-eden',
    'tema-diluvio',
    'tema-patriarcas',
    'tema-jose-egipto',
    'tema-exodo-general',
    'tema-diez-mandamientos',
    'tema-jueces-israel',
    'tema-david-goliat',
    'tema-salomon-sabiduria',
  ]);
  const profecia = new Set([
    'isaias',
    'jeremias',
    'lamentaciones',
    'ezequiel',
    'daniel',
    'oseas',
    'joel',
    'amos',
    'abdias',
    'jonas',
    'miqueas',
    'nahum',
    'habacuc',
    'sofonias',
    'hageo',
    'zacarias',
    'malaquias',
    'apocalipsis',
    'tema-apocalipsis-general',
    'grandes-profetas',
    'tema-grandes-profetas-general',
  ]);
  const cartas = new Set(['romanos', '1-corintios', '2-corintios', 'galatas']);
  const evangelios = new Set([
    'mateo',
    'marcos',
    'lucas',
    'juan',
    'vida-de-jesus',
    'tema-nacimiento-jesus',
    'parabolas-y-sabiduria',
    'tema-parabolas-jesus',
    'tema-milagros-jesus',
    'tema-sermon-monte',
    'tema-pasion-resurreccion',
  ]);
  const iglesiaPrimitiva = new Set(['hechos', 'historia-de-la-iglesia', 'tema-12-apostoles', 'tema-viajes-pablo']);
  const nuevoTestamento = new Set(['tema-mujeres-biblia']);

  if (evangelios.has(slug)) return 'Evangelios';
  if (iglesiaPrimitiva.has(slug)) return 'Iglesia Primitiva';
  if (cartas.has(slug)) return 'Cartas';
  if (profecia.has(slug)) return 'Profecía';
  if (antiguoTestamento.has(slug)) return 'Antiguo Testamento';
  if (nuevoTestamento.has(slug)) return 'Nuevo Testamento';
  return 'Temas generales';
}

export default function TriviaTopicsExplorer() {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [topicsPage, setTopicsPage] = useState(0);
  const topicsPerPage = 20;
  const totalTopicPages = Math.max(1, Math.ceil(TRIVIA_TOPICS.length / topicsPerPage));
  const visibleTopics = useMemo(() => {
    if (!showAllTopics) return TRIVIA_TOPICS.slice(0, 6);
    const start = topicsPage * topicsPerPage;
    return TRIVIA_TOPICS.slice(start, start + topicsPerPage);
  }, [showAllTopics, topicsPage]);
  const extraTopicsCount = Math.max(0, TRIVIA_TOPICS.length - 6);

  const groupedVisibleTopics = useMemo(() => {
    const order: TriviaCategory[] = [
      'Antiguo Testamento',
      'Nuevo Testamento',
      'Evangelios',
      'Iglesia Primitiva',
      'Cartas',
      'Profecía',
      'Temas generales',
    ];
    const map = new Map<TriviaCategory, typeof visibleTopics>();
    for (const topic of visibleTopics) {
      const cat = categoryByTopicSlug(topic.slug);
      map.set(cat, [...(map.get(cat) ?? []), topic]);
    }
    return order
      .map(category => {
        const topics = map.get(category) ?? [];
        const orderList = TOPIC_ORDER_BY_CATEGORY[category];
        const orderIndex = new Map(orderList.map((slug, idx) => [slug, idx]));
        const sortedTopics = stableMergeSort(topics, (a, b) => {
          const ai = orderIndex.get(a.slug);
          const bi = orderIndex.get(b.slug);
          if (ai !== undefined && bi !== undefined) return ai - bi;
          if (ai !== undefined) return -1;
          if (bi !== undefined) return 1;
          return a.title.localeCompare(b.title, 'es-MX');
        });
        return { category, topics: sortedTopics };
      })
      .filter(group => group.topics.length > 0);
  }, [visibleTopics]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h2 className="text-3xl font-semibold tracking-tight text-[#162B4D] sm:text-4xl">Explora por Temas</h2>
        <button
          type="button"
          onClick={() => {
            setShowAllTopics(prev => {
              const next = !prev;
              if (next) setTopicsPage(0);
              return next;
            });
          }}
          className="text-xs font-black uppercase tracking-[0.16em] text-[#A37B2C] hover:underline"
        >
          {showAllTopics ? 'Ver menos' : `Ver todos (+${extraTopicsCount})`}
        </button>
      </div>
      <div className="space-y-5">
        {groupedVisibleTopics.map(group => (
          <section key={group.category} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#A37B2C]">{group.category}</h3>
              <span className="h-px flex-1 bg-[#D9DCE2]" />
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
              {group.topics.map((topic, idx) => {
                const Icon = topicIcons[idx % topicIcons.length];
                return (
                  <Link
                    key={topic.slug}
                    href={`/dashboard/trivia/${topic.slug}`}
                    className="rounded-xl bg-[#F7F7F8] p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white sm:p-4"
                  >
                    <div className="mb-5 flex items-center justify-between sm:mb-7">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#1B2E51] text-[#F5D45E]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="rounded-full bg-[#ECECEF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8E9098]">
                        {topic.level}
                      </span>
                    </div>
                    <h3 className="text-[2.05rem] font-medium leading-tight text-[#182D4D] sm:text-[31px]">{topic.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#666A73] sm:mt-2">{topic.description}</p>
                    <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#A37B2C] sm:mt-2 sm:text-xs sm:tracking-[0.08em]">
                      Valor del test: +{formatPoints(triviaBasePointsByDifficulty(topic.level))} pts
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {showAllTopics && totalTopicPages > 1 ? (
        <div className="mt-4 flex items-center justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setTopicsPage(prev => Math.max(0, prev - 1))}
            disabled={topicsPage === 0}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs"
          >
            Anterior
          </button>
          <span className="text-xs font-semibold text-slate-500">
            {topicsPage + 1}/{totalTopicPages}
          </span>
          <button
            type="button"
            onClick={() => setTopicsPage(prev => Math.min(totalTopicPages - 1, prev + 1))}
            disabled={topicsPage >= totalTopicPages - 1}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}
