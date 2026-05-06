import type { Collection, Document, ObjectId } from 'mongodb';
import { findMemberDocumentByEmail } from '@/lib/members-email-lookup';

/**
 * Campos que se escriben en `members` dentro de la base **digital-church**
 * (`getMongoDb()` / `STORAGE_MONGODB_DB_NAME`).
 */
export type DigitalChurchMemberPayload = {
  firstName: string;
  lastName: string;
  /** Siempre en minúsculas; debe coincidir con el correo de la sesión Clerk. */
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  staffRole: string;
  groups: string[];
  templeIds: string[];
  updatedAt: Date;
  baptismDate?: string;
};

export type UpsertMemberByEmailResult =
  | { outcome: 'updated'; memberId: ObjectId }
  | { outcome: 'inserted'; memberId: ObjectId };

/**
 * Valida existencia por **correo electrónico** en la colección `members` de digital-church:
 * - Si el usuario ya existe → `updateOne` (solo actualiza datos enviados en `payload`).
 * - Si no existe → `insertOne` (nuevo miembro, con `createdAt` y `createdByClerkId`).
 */
export async function upsertMemberByEmailInDigitalChurchMembers(opts: {
  coll: Collection<Document>;
  /** Correo de la sesión (mismo criterio de búsqueda que en GET). */
  sessionEmail: string;
  payload: DigitalChurchMemberPayload;
  clerkUserId: string;
  /** Si es false, se elimina `baptismDate` del documento existente. */
  hasBaptismDate: boolean;
  now: Date;
}): Promise<UpsertMemberByEmailResult> {
  const { coll, sessionEmail, payload, clerkUserId, hasBaptismDate, now } = opts;

  const existing = await findMemberDocumentByEmail(coll, sessionEmail);
  const existingId = existing && '_id' in existing ? existing._id : null;

  if (existingId) {
    const $unset: Record<string, ''> = { ministries: '', templeKeys: '' };
    if (!hasBaptismDate) {
      $unset.baptismDate = '';
    }

    await coll.updateOne(
      { _id: existingId },
      {
        $set: payload as unknown as Document,
        $unset,
      }
    );

    return { outcome: 'updated', memberId: existingId as ObjectId };
  }

  const result = await coll.insertOne({
    ...payload,
    createdAt: now,
    createdByClerkId: clerkUserId,
  } as Document);

  return { outcome: 'inserted', memberId: result.insertedId };
}
