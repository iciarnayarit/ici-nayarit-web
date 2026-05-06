import type { Collection, Document } from 'mongodb';

export function normalizeMemberEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Busca en la colección `members` un documento cuyo campo `email` coincida con el correo dado
 * (normalizado a minúsculas o comparación case-insensitive).
 */
export async function findMemberDocumentByEmail(
  coll: Collection<Document>,
  emailRaw: string
): Promise<Document | null> {
  const norm = normalizeMemberEmail(emailRaw);
  const byNorm = await coll.findOne({ email: norm });
  if (byNorm) return byNorm;
  const escaped = emailRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return coll.findOne({ email: { $regex: new RegExp(`^${escaped}$`, 'i') } });
}
