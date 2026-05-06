/** Sin MongoDB — seguro para Client Components. */

export const MEMBER_STAFF_ROLE_UNSPECIFIED = 'sin_especificar' as const;

export type StaffRoleOption = { value: string; label: string };

function normalizeLabelKey(label: string): string {
  return label.trim().toLocaleLowerCase('es');
}

export function resolveStaffRoleForStorage(raw: string, allowed: StaffRoleOption[]): string | null {
  const t = raw.trim();
  if (!t || t === MEMBER_STAFF_ROLE_UNSPECIFIED) return null;

  const exact = allowed.find((o) => o.value === t);
  if (exact) return exact.value;

  const tl = normalizeLabelKey(t);
  const ci = allowed.find((o) => normalizeLabelKey(o.value) === tl);
  if (ci) return ci.value;

  const legacy: Record<string, string> = {
    pastor: 'Pastor',
    congregante: 'Congregante',
    presidente: 'Presidente',
    directiva: 'Directiva',
    lider: 'Presidente',
    staff_administrativo: MEMBER_STAFF_ROLE_UNSPECIFIED,
  };
  const mapped = legacy[tl];
  if (mapped && mapped !== MEMBER_STAFF_ROLE_UNSPECIFIED) {
    const hit = allowed.find((o) => normalizeLabelKey(o.value) === normalizeLabelKey(mapped));
    if (hit) return hit.value;
  }

  return null;
}
