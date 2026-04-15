/**
 * Diff palabra a palabra entre dos versículos (p. ej. comparador de traducciones).
 */

export type VerseDiffOp =
  | { kind: 'equal'; baseIndex: number; targetIndex: number }
  | { kind: 'delete'; baseIndex: number }
  | { kind: 'insert'; targetIndex: number };

function normalizeToken(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[«»"'´`]/g, '');
}

function tokenizeVerse(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function compareVerseWords(
  baseText: string,
  targetText: string
): {
  ops: VerseDiffOp[];
  percentDiff: number;
  baseWords: string[];
  targetWords: string[];
} | null {
  const baseWords = tokenizeVerse(baseText);
  const targetWords = tokenizeVerse(targetText);
  if (baseWords.length === 0 && targetWords.length === 0) return null;

  const na = baseWords.map(normalizeToken);
  const nb = targetWords.map(normalizeToken);
  const m = baseWords.length;
  const n = targetWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (na[i - 1] === nb[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const lcs = dp[m][n];
  const maxLen = Math.max(m, n);
  const percentDiff = maxLen === 0 ? 0 : Math.round(100 * (1 - lcs / maxLen));

  const ops: VerseDiffOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && na[i - 1] === nb[j - 1]) {
      ops.unshift({ kind: 'equal', baseIndex: i - 1, targetIndex: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ kind: 'insert', targetIndex: j - 1 });
      j--;
    } else {
      ops.unshift({ kind: 'delete', baseIndex: i - 1 });
      i--;
    }
  }

  return { ops, percentDiff, baseWords, targetWords };
}
