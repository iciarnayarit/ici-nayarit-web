/** Sin MongoDB — seguro para Client Components. */
export type MinistryOption = { value: string; label: string };

function normalizeLabelKey(label: string): string {
  return label.trim().toLocaleLowerCase('es');
}

export function resolveMinistryForStorage(raw: string, allowed: MinistryOption[]): string | null {
  const t = raw.trim();
  if (!t) return null;
  const exact = allowed.find((o) => o.value === t);
  if (exact) return exact.value;
  const ci = allowed.find((o) => normalizeLabelKey(o.value) === normalizeLabelKey(t));
  return ci?.value ?? null;
}

export function resolveMinistryGroupsForStorage(groups: string[], allowed: MinistryOption[]): string[] | null {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const g of groups) {
    const c = resolveMinistryForStorage(g, allowed);
    if (!c) return null;
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out.length > 0 ? out : null;
}

export function ministrySelectionFromSaved(saved: string[], options: MinistryOption[]): Record<string, boolean> {
  const rec: Record<string, boolean> = {};
  if (options.length === 0) {
    for (const r of saved) {
      const t = r.trim();
      if (t) rec[t] = true;
    }
    return rec;
  }
  const byNorm = new Map(options.map((o) => [normalizeLabelKey(o.value), o.value]));
  for (const r of saved) {
    const t = r.trim();
    if (!t) continue;
    const canon = byNorm.get(normalizeLabelKey(t)) ?? t;
    rec[canon] = true;
  }
  return rec;
}

export function ministryCheckboxValues(options: MinistryOption[], selection: Record<string, boolean>): string[] {
  const fromDb = options.map((o) => o.value);
  const extra = Object.entries(selection)
    .filter(([, on]) => on)
    .map(([k]) => k)
    .filter((k) => !fromDb.some((v) => normalizeLabelKey(v) === normalizeLabelKey(k)));
  const merged = [...fromDb, ...extra];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of merged) {
    const key = normalizeLabelKey(v);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}
