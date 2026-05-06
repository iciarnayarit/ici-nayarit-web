/** Opción de templo para el formulario de miembros (valor persistido en `templeIds`). Sin dependencias de Node/Mongo — seguro para importar en Client Components. */
export type ChurchListOption = {
  value: string;
  label: string;
  municipality: string;
  addressLine: string;
};

function normalizeLabelKey(label: string): string {
  return label.trim().toLocaleLowerCase('es');
}

export function resolveChurchIdForStorage(raw: string, allowed: ChurchListOption[]): string | null {
  const t = raw.trim();
  if (!t) return null;
  const exact = allowed.find((o) => o.value === t);
  if (exact) return exact.value;
  const tl = normalizeLabelKey(t);
  const byValue = allowed.find((o) => normalizeLabelKey(o.value) === tl);
  if (byValue) return byValue.value;
  const byLabel = allowed.find((o) => normalizeLabelKey(o.label) === tl);
  if (byLabel) return byLabel.value;
  return null;
}

export function resolveChurchIdsForStorage(ids: string[], allowed: ChurchListOption[]): string[] | null {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const c = resolveChurchIdForStorage(id, allowed);
    if (!c) return null;
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out.length > 0 ? out : null;
}

export function churchSelectionFromSaved(saved: string[], options: ChurchListOption[]): Record<string, boolean> {
  const rec: Record<string, boolean> = {};
  if (options.length === 0) {
    for (const r of saved) {
      const t = r.trim();
      if (t) rec[t] = true;
    }
    return rec;
  }
  for (const r of saved) {
    const t = r.trim();
    if (!t) continue;
    const canon = resolveChurchIdForStorage(t, options) ?? t;
    rec[canon] = true;
  }
  return rec;
}

export function churchCheckboxValues(options: ChurchListOption[], selection: Record<string, boolean>): string[] {
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
