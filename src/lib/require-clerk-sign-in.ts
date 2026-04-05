type RedirectToSignInFn = (opts?: {
  signInFallbackRedirectUrl?: string | null;
  redirectUrl?: string | null;
}) => Promise<unknown>;

/** Destino tras iniciar sesión para “Versículos guardados” en el dashboard. */
export const DASHBOARD_BIBLIA_SAVED_VERSES_PATH = '/dashboard/biblia';

/**
 * Navega a la Biblia del dashboard (versículos guardados).
 * Sin sesión: abre el flujo de Clerk y, al terminar, redirige a esa ruta.
 */
export function goToDashboardBibliaSavedVerses(
  isLoaded: boolean,
  isSignedIn: boolean,
  redirectToSignIn: RedirectToSignInFn,
  navigate: (href: string) => void,
): void {
  if (!isLoaded) return;
  if (isSignedIn) {
    navigate(DASHBOARD_BIBLIA_SAVED_VERSES_PATH);
    return;
  }
  void redirectToSignIn({
    redirectUrl: DASHBOARD_BIBLIA_SAVED_VERSES_PATH,
    signInFallbackRedirectUrl: DASHBOARD_BIBLIA_SAVED_VERSES_PATH,
  });
}

/**
 * Devuelve true solo si Clerk terminó de cargar y hay sesión.
 * Si no hay sesión, redirige al flujo de inicio de sesión de Clerk y devuelve false.
 */
export function ensureClerkSignedIn(
  isLoaded: boolean,
  isSignedIn: boolean,
  redirectToSignIn: RedirectToSignInFn
): boolean {
  if (!isLoaded) return false;
  if (!isSignedIn) {
    const url = typeof window !== 'undefined' ? window.location.href : '/';
    void redirectToSignIn({ signInFallbackRedirectUrl: url });
    return false;
  }
  return true;
}

/**
 * Añadir a favoritos requiere sesión; quitar el marcador permite hacerlo sin sesión
 * (p. ej. datos previos en este dispositivo).
 */
export function ensureClerkSignedInForFavoriteAdd(
  isLoaded: boolean,
  isSignedIn: boolean,
  redirectToSignIn: RedirectToSignInFn,
  alreadySaved: boolean
): boolean {
  if (!isLoaded) return false;
  if (alreadySaved) return true;
  return ensureClerkSignedIn(isLoaded, isSignedIn, redirectToSignIn);
}
