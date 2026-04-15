/**
 * Enciclopedia bíblica: definiciones en public/enciclopedia/encyclopedia.json
 */

import encyclopediaJson from '../../public/enciclopedia/encyclopedia.json';

export type EncyclopediaSection = {
  id: string;
  title: string;
  /** Texto plano o párrafos separados por línea en blanco. */
  body: string;
};

export type EncyclopediaEntry = {
  slug: string;
  title: string;
  /** Etiqueta bajo el título: Ciudad, Persona, región… */
  kind: string;
  summary: string;
  sections: EncyclopediaSection[];
  seeAlso?: { slug: string; label: string }[];
};

type EncyclopediaJsonFile = {
  version: number;
  entries: EncyclopediaEntry[];
};

const { entries: ENTRIES } = encyclopediaJson as EncyclopediaJsonFile;

const bySlug = new Map(ENTRIES.map((e) => [e.slug, e]));

export function getEncyclopediaEntry(slug: string): EncyclopediaEntry | undefined {
  return bySlug.get(slug);
}

export function listEncyclopediaEntries(): EncyclopediaEntry[] {
  return ENTRIES;
}

export function encyclopediaSlugs(): string[] {
  return ENTRIES.map((e) => e.slug);
}

export const ENCICLOPEDIA_PAGE_SIZE = 30;

export function getEncyclopediaIndexPage(page1Based: number): {
  entries: EncyclopediaEntry[];
  total: number;
  page: number;
  totalPages: number;
} {
  const total = ENTRIES.length;
  const totalPages = Math.max(1, Math.ceil(total / ENCICLOPEDIA_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(page1Based) || 1), totalPages);
  const start = (page - 1) * ENCICLOPEDIA_PAGE_SIZE;
  return {
    entries: ENTRIES.slice(start, start + ENCICLOPEDIA_PAGE_SIZE),
    total,
    page,
    totalPages,
  };
}
