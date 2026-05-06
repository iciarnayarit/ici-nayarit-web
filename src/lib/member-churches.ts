import { getMongoDb } from '@/lib/mongodb';
import type { ChurchListOption } from '@/lib/member-churches-helpers';

export type { ChurchListOption } from '@/lib/member-churches-helpers';
export {
  resolveChurchIdForStorage,
  resolveChurchIdsForStorage,
  churchSelectionFromSaved,
  churchCheckboxValues,
} from '@/lib/member-churches-helpers';

export function churchesCollectionName(): string {
  return process.env.STORAGE_MONGODB_CHURCHES_COLLECTION?.trim() || 'churches';
}

function normalizeLabelKey(label: string): string {
  return label.trim().toLocaleLowerCase('es');
}

function churchDisplayNameFromDoc(doc: Record<string, unknown>): string | null {
  for (const key of ['name', 'label', 'title', 'nombre', 'nombreTemplo'] as const) {
    const v = doc[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function churchStorageValueFromDoc(doc: Record<string, unknown>, displayName: string): string {
  for (const key of ['nameKey', 'slug', 'key'] as const) {
    const v = doc[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  const dn = displayName.trim();
  if (dn) return dn;
  const id = doc._id;
  if (id != null && String(id).length > 0) return String(id);
  return '';
}

function churchMunicipalityFromDoc(doc: Record<string, unknown>): string {
  for (const key of ['municipality', 'city', 'municipio'] as const) {
    const v = doc[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function churchAddressLineFromDoc(doc: Record<string, unknown>): string {
  for (const key of ['address', 'addressKey', 'direccion', 'addressLine'] as const) {
    const v = doc[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function sortOrderFromDoc(doc: Record<string, unknown>): number {
  const o = doc.sortOrder ?? doc.order ?? doc.orden;
  if (typeof o === 'number' && Number.isFinite(o)) return o;
  return 9999;
}

/**
 * Templos desde MongoDB (`churches` por defecto) para el registro de miembros.
 */
export async function listChurchOptionsForMemberForm(): Promise<ChurchListOption[]> {
  const db = await getMongoDb();
  const coll = db.collection(churchesCollectionName());
  const docs = await coll.find({}).toArray();

  const rows: { option: ChurchListOption; order: number }[] = [];
  const seen = new Set<string>();

  for (const d of docs) {
    const rec = d as Record<string, unknown>;
    const label = churchDisplayNameFromDoc(rec);
    if (!label) continue;
    const value = churchStorageValueFromDoc(rec, label);
    if (!value) continue;
    const nk = normalizeLabelKey(value);
    if (seen.has(nk)) continue;
    seen.add(nk);
    rows.push({
      option: {
        value,
        label,
        municipality: churchMunicipalityFromDoc(rec),
        addressLine: churchAddressLineFromDoc(rec),
      },
      order: sortOrderFromDoc(rec),
    });
  }

  rows.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.option.label.localeCompare(b.option.label, 'es');
  });

  return rows.map((r) => r.option);
}
