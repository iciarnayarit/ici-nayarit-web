import { auth, currentUser } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { MemberStaffRole } from '@/lib/member-directory-options';

const staffRoleValues: [MemberStaffRole, ...MemberStaffRole[]] = [
  'sin_especificar',
  'nuevo',
  'pastor',
  'congregante',
  'presidente',
  'directiva',
];

const createMemberSchema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  /** Se ignora para guardar; el correo sale siempre de Clerk. */
  email: z.string().trim().max(320).optional().default(''),
  phone: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(600),
  birthDate: z.string().trim().min(1).max(32),
  baptismDate: z.string().trim().max(32).optional().default(''),
  staffRole: z.enum(staffRoleValues),
  /** Grupos / ministerios marcados en el formulario → campo `groups` en MongoDB. */
  groups: z.array(z.string()).min(1, { message: 'Selecciona al menos un ministerio.' }),
  /** Identificadores de templo (`nameKey` en `temples-data`) → campo `templeIds` en MongoDB. */
  templeIds: z.array(z.string()).min(1, { message: 'Selecciona al menos un templo.' }),
});

function membersCollectionName() {
  return process.env.STORAGE_MONGODB_MEMBERS_COLLECTION?.trim() || 'members';
}

type MemberDoc = {
  _id: ObjectId;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  baptismDate?: string;
  staffRole?: string;
  /** Selección de grupos y ministerios (campo actual en BD). */
  groups?: string[];
  /** Documentos antiguos pueden tener solo `ministries`. */
  ministries?: string[];
  /** Templos elegidos (campo actual en BD). */
  templeIds?: string[];
  /** Documentos antiguos pueden tener solo `templeKeys`. */
  templeKeys?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  createdByClerkId?: string;
};

function groupsFromDoc(doc: MemberDoc): string[] {
  if (Array.isArray(doc.groups) && doc.groups.length > 0) return doc.groups;
  if (Array.isArray(doc.ministries) && doc.ministries.length > 0) return doc.ministries;
  return [];
}

function templeIdsFromDoc(doc: MemberDoc): string[] {
  if (Array.isArray(doc.templeIds) && doc.templeIds.length > 0) return doc.templeIds;
  if (Array.isArray(doc.templeKeys) && doc.templeKeys.length > 0) return doc.templeKeys;
  return [];
}

function serializeMemberDoc(doc: MemberDoc) {
  const rawStaffRole = doc.staffRole;
  const normalizedRole =
    rawStaffRole === 'pastor'
      ? 'nuevo'
      : rawStaffRole === 'lider'
        ? 'presidente'
        : rawStaffRole === 'staff_administrativo'
          ? 'sin_especificar'
          : rawStaffRole;
  const staffRole = staffRoleValues.includes(normalizedRole as MemberStaffRole)
    ? (normalizedRole as MemberStaffRole)
    : ('sin_especificar' as const);

  const groups = groupsFromDoc(doc);
  const templeIds = templeIdsFromDoc(doc);

  return {
    id: doc._id.toString(),
    firstName: doc.firstName ?? '',
    lastName: doc.lastName ?? '',
    email: doc.email ?? '',
    phone: doc.phone ?? '',
    address: doc.address ?? '',
    birthDate: doc.birthDate ?? '',
    baptismDate: doc.baptismDate ?? '',
    staffRole,
    groups,
    templeIds,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : undefined,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : undefined,
  };
}

async function emailFromClerkUser() {
  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress?.trim() ??
    clerkUser?.emailAddresses?.[0]?.emailAddress?.trim() ??
    '';
  return { clerkUser, email };
}

function normalizeMemberEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Coincide el documento `members` al correo de la sesión (insensible a mayúsculas en datos antiguos). */
async function findMemberBySessionEmail(
  coll: ReturnType<Awaited<ReturnType<typeof getMongoDb>>['collection']>,
  emailRaw: string
) {
  const norm = normalizeMemberEmail(emailRaw);
  const byNorm = await coll.findOne({ email: norm });
  if (byNorm) return byNorm;
  const escaped = emailRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return coll.findOne({ email: { $regex: new RegExp(`^${escaped}$`, 'i') } });
}

/** Miembro cuyo `email` coincide con el correo principal de Clerk (sesión actual). */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    const { email } = await emailFromClerkUser();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ member: null, reason: 'no_email' as const });
    }

    const db = await getMongoDb();
    const coll = db.collection(membersCollectionName());
    const doc = await findMemberBySessionEmail(coll, email);

    if (!doc || !('_id' in doc) || !doc._id) {
      return NextResponse.json({ member: null });
    }

    return NextResponse.json({ member: serializeMemberDoc(doc as MemberDoc) });
  } catch (err) {
    console.error('[api/members GET]', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    if (message.includes('STORAGE_MONGODB_URI')) {
      return NextResponse.json(
        { error: 'La base de datos no está configurada en el servidor.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'No se pudo leer el miembro.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Debes iniciar sesión para guardar miembros.' }, { status: 401 });
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: 'Cuerpo JSON inválido.' }, { status: 400 });
    }

    const parsed = createMemberSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (data.staffRole === 'sin_especificar') {
      return NextResponse.json(
        { error: 'Selecciona un cargo o rol en Directorio de personal.' },
        { status: 400 }
      );
    }

    const { email: emailFromClerk } = await emailFromClerkUser();
    if (!emailFromClerk || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFromClerk)) {
      return NextResponse.json(
        { error: 'Tu cuenta no tiene un correo válido. Configúralo en tu perfil.' },
        { status: 400 }
      );
    }

    const emailNorm = normalizeMemberEmail(emailFromClerk);

    const db = await getMongoDb();
    const collectionName = membersCollectionName();
    const now = new Date();
    const coll = db.collection(collectionName);

    const baptismTrimmed = data.baptismDate.trim();

    /**
     * Documento completo enviado desde el formulario de miembros.
     * El correo en BD siempre es el de Clerk (`emailNorm`); el cuerpo del POST no puede sustituirlo.
     */
    const normalizedStaffRole = data.staffRole === 'pastor' ? 'nuevo' : data.staffRole;
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: emailNorm,
      phone: data.phone,
      address: data.address,
      birthDate: data.birthDate,
      staffRole: normalizedStaffRole,
      groups: data.groups,
      templeIds: data.templeIds,
      updatedAt: now,
      ...(baptismTrimmed ? { baptismDate: baptismTrimmed } : {}),
    };

    const existing = (await findMemberBySessionEmail(coll, emailFromClerk)) as MemberDoc | null;

    if (existing?._id) {
      const $unset: Record<string, ''> = { ministries: '', templeKeys: '' };
      if (!baptismTrimmed) {
        $unset.baptismDate = '';
      }

      await coll.updateOne(
        { _id: existing._id },
        {
          $set: payload,
          $unset,
        }
      );
      const updated = await coll.findOne({ _id: existing._id });
      if (!updated || !('_id' in updated) || !updated._id) {
        return NextResponse.json({ error: 'No se pudo leer el miembro actualizado.' }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        id: updated._id.toString(),
        updated: true as const,
        member: serializeMemberDoc(updated as MemberDoc),
      });
    }

    const result = await coll.insertOne({
      ...payload,
      createdAt: now,
      createdByClerkId: userId,
    });
    const id = result.insertedId.toString();

    const inserted = await coll.findOne({ _id: result.insertedId });
    const member = inserted && '_id' in inserted && inserted._id
      ? serializeMemberDoc(inserted as MemberDoc)
      : {
          id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          birthDate: payload.birthDate,
          baptismDate: baptismTrimmed || undefined,
          staffRole: payload.staffRole,
          groups: payload.groups,
          templeIds: payload.templeIds,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };

    return NextResponse.json({
      ok: true,
      id,
      updated: false as const,
      member,
    });
  } catch (err) {
    console.error('[api/members]', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    if (message.includes('STORAGE_MONGODB_URI')) {
      return NextResponse.json(
        { error: 'La base de datos no está configurada en el servidor.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'No se pudo guardar el miembro.' }, { status: 500 });
  }
}
