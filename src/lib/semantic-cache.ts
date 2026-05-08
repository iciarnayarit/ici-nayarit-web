type SemanticEntry<T> = {
  keyspace: string;
  text: string;
  vector: Map<string, number>;
  value: T;
  updatedAt: number;
};

const SEMANTIC_CACHE = new Map<string, SemanticEntry<unknown>[]>();
const MAX_ENTRIES_PER_KEYSPACE = 250;

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenVector(input: string): Map<string, number> {
  const normalized = normalizeText(input);
  const words = normalized.split(' ').filter(Boolean);
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [, value] of a) {
    normA += value * value;
  }
  for (const [, value] of b) {
    normB += value * value;
  }
  if (normA <= 0 || normB <= 0) return 0;

  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [token, value] of small) {
    const other = large.get(token);
    if (other) dot += value * other;
  }
  return dot / Math.sqrt(normA * normB);
}

export function getSemanticCacheMatch<T>(input: {
  keyspace: string;
  text: string;
  minSimilarity?: number;
}): { value: T; similarity: number } | null {
  const { keyspace, text } = input;
  const minSimilarity = Math.max(0, Math.min(1, input.minSimilarity ?? 0.95));
  const entries = SEMANTIC_CACHE.get(keyspace);
  if (!entries || entries.length === 0) return null;

  const queryVector = tokenVector(text);
  let best: { value: T; similarity: number; index: number } | null = null;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i] as SemanticEntry<T>;
    const sim = cosineSimilarity(queryVector, entry.vector);
    if (sim < minSimilarity) continue;
    if (!best || sim > best.similarity) {
      best = { value: entry.value, similarity: sim, index: i };
    }
  }

  if (!best) return null;

  // Reordenar para LRU semántico: el más usado pasa al final.
  const hit = entries.splice(best.index, 1)[0];
  entries.push(hit);
  SEMANTIC_CACHE.set(keyspace, entries);

  return { value: best.value, similarity: best.similarity };
}

export function setSemanticCacheValue<T>(input: { keyspace: string; text: string; value: T }) {
  const { keyspace, text, value } = input;
  const entries = SEMANTIC_CACHE.get(keyspace) ?? [];
  const normalized = normalizeText(text);
  const vector = tokenVector(normalized);

  // Si ya existe texto prácticamente igual, reemplazar.
  const exactIndex = entries.findIndex(e => normalizeText(e.text) === normalized);
  if (exactIndex >= 0) {
    entries.splice(exactIndex, 1);
  }

  entries.push({
    keyspace,
    text,
    vector,
    value,
    updatedAt: Date.now(),
  });

  while (entries.length > MAX_ENTRIES_PER_KEYSPACE) {
    entries.shift();
  }
  SEMANTIC_CACHE.set(keyspace, entries);
}

