/** Misma clave que usa `reading-plans.tsx` al guardar con el marcador. */
export const SAVED_PLANS_STORAGE_KEY = 'savedPlans';

export const SAVED_PLANS_CHANGED_EVENT = 'iciar-saved-plans-changed';

/** Objeto guardado en localStorage (forma actual de `plans` en reading-plan-data). */
export type StoredSavedReadingPlan = {
  id: string;
  slug: string;
  imageUrl: string;
  titleKey?: string;
  descriptionKey?: string;
  /** Compatibilidad con datos antiguos (p. ej. saved-plans.tsx). */
  title?: string;
  description?: string;
};

function isStoredPlan(p: unknown): p is StoredSavedReadingPlan {
  return (
    p != null &&
    typeof p === 'object' &&
    typeof (p as StoredSavedReadingPlan).id === 'string' &&
    typeof (p as StoredSavedReadingPlan).slug === 'string' &&
    typeof (p as StoredSavedReadingPlan).imageUrl === 'string'
  );
}

export function loadSavedReadingPlansFromStorage(): StoredSavedReadingPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_PLANS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredPlan);
  } catch {
    return [];
  }
}

export function savedPlanTitle(p: StoredSavedReadingPlan): string {
  return (p.titleKey || p.title || 'Plan').trim() || 'Plan';
}

export function savedPlanDescription(p: StoredSavedReadingPlan): string {
  return (p.descriptionKey || p.description || '').trim();
}
