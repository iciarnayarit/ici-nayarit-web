import { getMongoDb } from '@/lib/mongodb';
import type { StaffRoleOption } from '@/lib/staff-roles-helpers';

export type { StaffRoleOption } from '@/lib/staff-roles-helpers';
export { MEMBER_STAFF_ROLE_UNSPECIFIED, resolveStaffRoleForStorage } from '@/lib/staff-roles-helpers';

/** Cargos que no deben ofrecerse en el directorio de personal (comparación sin distinguir mayúsculas). */
const EXCLUDED_STAFF_ROLE_LABELS_NORMALIZED = new Set([
  'administrador general',
  'nuevo',
  'super administrador',
]);

export function staffRolesCollectionName(): string {
  return process.env.STORAGE_MONGODB_STAFF_ROLES_COLLECTION?.trim() || 'staff_roles';
}

function normalizeLabelKey(label: string): string {
  return label.trim().toLocaleLowerCase('es');
}

function isExcludedStaffRoleLabel(label: string): boolean {
  return EXCLUDED_STAFF_ROLE_LABELS_NORMALIZED.has(normalizeLabelKey(label));
}

function roleLabelFromDoc(doc: Record<string, unknown>): string | null {
  for (const key of ['name', 'label', 'title', 'nombre', 'cargo', 'role', 'displayName'] as const) {
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
 * Lista cargos desde MongoDB (`staff_roles` por defecto), ordenados y sin los excluidos.
 */
export async function listStaffRoleOptionsForDirectory(): Promise<StaffRoleOption[]> {
  const db = await getMongoDb();
  const coll = db.collection(staffRolesCollectionName());
  const docs = await coll.find({}).toArray();

  const rows: { label: string; order: number }[] = [];
  const seen = new Set<string>();

  for (const d of docs) {
    const label = roleLabelFromDoc(d as Record<string, unknown>);
    if (!label || isExcludedStaffRoleLabel(label)) continue;
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
