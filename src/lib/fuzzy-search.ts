export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshteinDistance(aRaw: string, bRaw: string): number {
  const a = normalizeSearchText(aRaw);
  const b = normalizeSearchText(bRaw);
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const prev = new Array<number>(bl + 1);
  const curr = new Array<number>(bl + 1);
  for (let j = 0; j <= bl; j += 1) prev[j] = j;

  for (let i = 1; i <= al; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= bl; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= bl; j += 1) prev[j] = curr[j];
  }
  return prev[bl];
}

export function fuzzySimilarity(a: string, b: string): number {
  const na = normalizeSearchText(a);
  const nb = normalizeSearchText(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.92;
  const dist = levenshteinDistance(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return Math.max(0, 1 - dist / maxLen);
}

export function fuzzyIncludes(text: string, query: string, threshold = 0.72): boolean {
  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  if (!normalizedText) return false;
  if (normalizedText.includes(normalizedQuery)) return true;

  const tokens = normalizedText.split(' ');
  for (const token of tokens) {
    if (fuzzySimilarity(token, normalizedQuery) >= threshold) return true;
  }
  return fuzzySimilarity(normalizedText, normalizedQuery) >= threshold;
}

