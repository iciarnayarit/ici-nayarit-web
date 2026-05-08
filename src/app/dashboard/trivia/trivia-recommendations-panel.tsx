'use client';

import Link from 'next/link';

type TriviaRecommendation = {
  slug: string;
  title: string;
  level: string;
  description: string;
  score: number;
  reason: string;
};

type Props = {
  recommendedTopics: TriviaRecommendation[];
  recommendationStrategy: string;
};

export default function TriviaRecommendationsPanel({ recommendedTopics, recommendationStrategy }: Props) {
  if (recommendedTopics.length === 0) return null;

  return (
    <article className="rounded-xl bg-[#F7F7F8] p-3.5 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162B4D] sm:text-3xl">Recomendado para ti</h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B95A6]">
          {recommendationStrategy === 'collaborative-filtering' ? 'Collaborative Filtering' : 'Popular'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedTopics.map(topic => (
          <Link
            key={`recommended-${topic.slug}`}
            href={`/dashboard/trivia/${topic.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#A37B2C]">{topic.level}</p>
            <h3 className="mt-1 text-lg font-semibold text-[#182D4D]">{topic.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{topic.description}</p>
            <p className="mt-2 text-xs font-semibold text-[#71819A]">{topic.reason}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
