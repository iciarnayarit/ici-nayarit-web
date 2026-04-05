/**
 * Portal de administración de iglesias (directorio de miembros, etc.).
 * @see https://churches.iciarnayarit.com/members
 */
export const CHURCH_ADMIN_MEMBERS_PORTAL_URL = 'https://churches.iciarnayarit.com/members';

/**
 * Comparación del correo del usuario con EMAIL_ADMIN (solo el valor se inyecta desde el servidor).
 */

export function normalizeEmailForCompare(email: string): string {
  return email.trim().toLowerCase();
}

/** True si algún correo del usuario coincide con el admin configurado (tras normalizar). */
export function emailsIncludeChurchAdmin(
  userEmails: { emailAddress: string }[],
  adminEmailFromEnv: string,
): boolean {
  const admin = normalizeEmailForCompare(adminEmailFromEnv);
  if (!admin) return false;
  return userEmails.some((e) => normalizeEmailForCompare(e.emailAddress) === admin);
}

/**
 * Correo permitido para ver el enlace «Iglesia» en la cabecera (solo sesión iniciada + esta dirección).
 */
export const CHURCH_HEADER_NAV_EMAIL = 'jggjosue@gmail.com';

export function userEmailMatchesChurchHeaderNav(
  userEmails: { emailAddress: string }[] | undefined,
): boolean {
  if (!userEmails?.length) return false;
  const allowed = normalizeEmailForCompare(CHURCH_HEADER_NAV_EMAIL);
  return userEmails.some(e => normalizeEmailForCompare(e.emailAddress) === allowed);
}
