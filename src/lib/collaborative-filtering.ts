type SparseVector = Record<string, number>;

export function cosineSimilarity(a: SparseVector, b: SparseVector): number {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length === 0 || keysB.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const key of keysA) {
    const va = Number(a[key] ?? 0);
    if (!Number.isFinite(va) || va <= 0) continue;
    normA += va * va;
    const vb = Number(b[key] ?? 0);
    if (Number.isFinite(vb) && vb > 0) {
      dot += va * vb;
    }
  }

  for (const key of keysB) {
    const vb = Number(b[key] ?? 0);
    if (!Number.isFinite(vb) || vb <= 0) continue;
    normB += vb * vb;
  }

  if (normA <= 0 || normB <= 0) return 0;
  return dot / Math.sqrt(normA * normB);
}

export function topKByScore<T extends { score: number }>(items: T[], k: number): T[] {
  return [...items].sort((x, y) => y.score - x.score).slice(0, Math.max(0, k));
}

export function normalizePositive(value: unknown, fallback = 0): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}
