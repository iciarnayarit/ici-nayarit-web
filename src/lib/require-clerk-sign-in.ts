type RedirectToSignInFn = (opts?: {
  signInFallbackRedirectUrl?: string | null;
}) => Promise<unknown>;

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
