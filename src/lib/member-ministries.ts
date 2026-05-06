import { getMongoDb } from '@/lib/mongodb';
import type { MinistryOption } from '@/lib/member-ministries-helpers';

export type { MinistryOption } from '@/lib/member-ministries-helpers';
export {
  resolveMinistryForStorage,
  resolveMinistryGroupsForStorage,
  ministrySelectionFromSaved,
  ministryCheckboxValues,
} from '@/lib/member-ministries-helpers';

export function ministriesCollectionName(): string {
  return process.env.STORAGE_MONGODB_MINISTRIES_COLLECTION?.trim() || 'ministries';
}

function normalizeLabelKey(label: string): string {
  return label.trim().toLocaleLowerCase('es');
}

function ministryLabelFromDoc(doc: Record<string, unknown>): string | null {
  for (const key of ['name', 'label', 'title', 'nombre', 'ministry', 'displayName'] as const) {
    const v = doc[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function sortOrderFromDoc(doc: Record<string, unknown>): number {
  const o = doc.sortOrder ?? doc.order ?? doc.orden;
  if (typeof o === 'number' && Number.isFinite(o)) return o;
  return 9999;
}

/**
 * Ministerios desde MongoDB (`ministries` por defecto).
 */
export async function listMinistryOptionsForDirectory(): Promise<MinistryOption[]> {
  const db = await getMongoDb();
  const coll = db.collection(ministriesCollectionName());
  const docs = await coll.find({}).toArray();

  const rows: { label: string; order: number }[] = [];
  const seen = new Set<string>();

  for (const d of docs) {
    const label = ministryLabelFromDoc(d as Record<string, unknown>);
    if (!label) continue;
    const key = normalizeLabelKey(label);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ label, order: sortOrderFromDoc(d as Record<string, unknown>) });
  }

  rows.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.label.localeCompare(b.label, 'es');
  });

  return rows.map((r) => ({ value: r.label, label: r.label }));
}
