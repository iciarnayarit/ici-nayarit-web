import Link from 'next/link';
import { headers } from 'next/headers';
import { Lightbulb } from 'lucide-react';
import type { EncyclopediaEntry } from '@/lib/bible-encyclopedia-data';

type Props = {
  entry: EncyclopediaEntry;
};

type RecommendationsApiResponse = {
  ok?: boolean;
  recommendations?: Array<{ slug: string; label: string }>;
};

function fallbackRecommendations(entry: EncyclopediaEntry) {
  return (entry.seeAlso ?? []).map((r) => ({ slug: r.slug, label: r.label }));
}

export default async function EncyclopediaArticleRelatedSlot({ entry }: Props) {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    process.env.VERCEL_URL ??
    'localhost:3000';
  const proto = requestHeaders.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  let recommendations = fallbackRecommendations(entry);
  try {
    const res = await fetch(
      `${baseUrl}/api/enciclopedia/recommendations?slug=${encodeURIComponent(entry.slug)}&limit=6`,
      {
        cache: 'no-store',
      }
    );
    if (res.ok) {
      const data = (await res.json()) as RecommendationsApiResponse;
      if (data.ok && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        recommendations = data.recommendations;
      }
    }
  } catch {
    // fallback a seeAlso local si la fuente async falla.
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-gray-800">
        <Lightbulb className="h-4 w-4 text-[#B88A44]" aria-hidden />
        Ver también
      </h2>
      <ul className="flex flex-wrap gap-2">
        {recommendations.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/enciclopedia/${r.slug}`}
              className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:border-[#B88A44]/40 hover:bg-amber-50/60 hover:text-[#B88A44]"
            >
              {r.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
