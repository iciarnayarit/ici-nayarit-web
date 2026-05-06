import { auth, currentUser } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import { findMemberDocumentByEmail, normalizeMemberEmail } from '@/lib/members-email-lookup';
import {
  type DigitalChurchMemberPayload,
  upsertMemberByEmailInDigitalChurchMembers,
} from '@/lib/members-upsert-digital-church';
import {
  listChurchOptionsForMemberForm,
  resolveChurchIdsForStorage,
} from '@/lib/member-churches';
import {
  listMinistryOptionsForDirectory,
  resolveMinistryGroupsForStorage,
} from '@/lib/member-ministries';
import {
  MEMBER_STAFF_ROLE_UNSPECIFIED,
  listStaffRoleOptionsForDirectory,
  resolveStaffRoleForStorage,
} from '@/lib/staff-roles';

function staffRoleFromDoc(value: unknown): string {
  if (typeof value !== 'string') return MEMBER_STAFF_ROLE_UNSPECIFIED;
  const t = value.trim();
  return t || MEMBER_STAFF_ROLE_UNSPECIFIED;
}

function formatStaffRoleForStorage(value: string): string {
  return value.trim();
}

const createMemberSchema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  /** Se ignora para guardar; el correo sale siempre de Clerk. */
  email: z.string().trim().max(320).optional().default(''),
  phone: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(600),
  birthDate: z.string().trim().min(1).max(32),
  baptismDate: z.string().trim().max(32).optional().default(''),
  staffRole: z.string().trim(),
  /** Grupos / ministerios marcados en el formulario → campo `groups` en MongoDB. */
  groups: z.array(z.string()).min(1, { message: 'Selecciona al menos un ministerio.' }),
  /** Identificadores de templo (colección `churches`) → campo `templeIds` en MongoDB. */
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
  const staffRole = staffRoleFromDoc(doc.staffRole);

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
    const doc = await findMemberDocumentByEmail(coll, email);

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
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message ? `Datos inválidos: ${firstIssue.message}` : 'Datos inválidos',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let staffRoleAllowed: Awaited<ReturnType<typeof listStaffRoleOptionsForDirectory>>;
    try {
      staffRoleAllowed = await listStaffRoleOptionsForDirectory();
    } catch (e) {
      console.error('[api/members POST] staff_roles', e);
      return NextResponse.json(
        { error: 'No se pudo validar el cargo. Revisa la colección staff_roles o la conexión a la base de datos.' },
        { status: 503 }
      );
    }

    if (staffRoleAllowed.length === 0) {
      return NextResponse.json(
        { error: 'No hay cargos en la colección staff_roles. Añade registros o revisa el nombre de la colección.' },
        { status: 503 }
      );
    }

    const staffRoleCanonical = resolveStaffRoleForStorage(data.staffRole, staffRoleAllowed);
    if (!staffRoleCanonical) {
      return NextResponse.json(
        { error: 'Selecciona un cargo o rol válido en Directorio de personal.' },
        { status: 400 }
      );
    }

    let ministryAllowed: Awaited<ReturnType<typeof listMinistryOptionsForDirectory>>;
    try {
      ministryAllowed = await listMinistryOptionsForDirectory();
    } catch (e) {
      console.error('[api/members POST] ministries', e);
      return NextResponse.json(
        { error: 'No se pudo validar los ministerios. Revisa la colección ministries o la conexión a la base de datos.' },
        { status: 503 }
      );
    }

    if (ministryAllowed.length === 0) {
      return NextResponse.json(
        { error: 'No hay ministerios en la colección ministries. Añade registros o revisa el nombre de la colección.' },
        { status: 503 }
      );
    }

    const canonicalGroups = resolveMinistryGroupsForStorage(data.groups, ministryAllowed);
    if (!canonicalGroups) {
      return NextResponse.json(
        { error: 'Selecciona uno o más ministerios válidos.' },
        { status: 400 }
      );
    }

    let churchAllowed: Awaited<ReturnType<typeof listChurchOptionsForMemberForm>>;
    try {
      churchAllowed = await listChurchOptionsForMemberForm();
    } catch (e) {
      console.error('[api/members POST] churches', e);
      return NextResponse.json(
        { error: 'No se pudo validar los templos. Revisa la colección churches o la conexión a la base de datos.' },
        { status: 503 }
      );
    }

    if (churchAllowed.length === 0) {
      return NextResponse.json(
        { error: 'No hay templos en la colección churches. Añade registros o revisa el nombre de la colección.' },
        { status: 503 }
      );
    }

    const canonicalTempleIds = resolveChurchIdsForStorage(data.templeIds, churchAllowed);
    if (!canonicalTempleIds) {
      return NextResponse.json(
        { error: 'Selecciona uno o más templos válidos.' },
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
    const bodyEmailNorm = data.email.trim() ? normalizeMemberEmail(data.email) : '';
    if (bodyEmailNorm && bodyEmailNorm !== emailNorm) {
      return NextResponse.json(
        { error: 'El correo del formulario debe coincidir con el de tu sesión.' },
        { status: 403 }
      );
    }

    const db = await getMongoDb();
    const collectionName = membersCollectionName();
    const now = new Date();
    const coll = db.collection(collectionName);

    const baptismTrimmed = data.baptismDate.trim();

    /**
     * Persistencia en la BD **digital-church** (ver `getMongoDbName`), colección `members`.
     * El correo en BD siempre es el de Clerk (`emailNorm`); no se acepta otro correo en el cuerpo del POST.
     */
    const payload: DigitalChurchMemberPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: emailNorm,
      phone: data.phone,
      address: data.address,
      birthDate: data.birthDate,
      staffRole: formatStaffRoleForStorage(staffRoleCanonical),
      groups: canonicalGroups,
      templeIds: canonicalTempleIds,
      updatedAt: now,
      ...(baptismTrimmed ? { baptismDate: baptismTrimmed } : {}),
    };

    const upsert = await upsertMemberByEmailInDigitalChurchMembers({
      coll,
      sessionEmail: emailFromClerk,
      payload,
      clerkUserId: userId,
      hasBaptismDate: Boolean(baptismTrimmed),
      now,
    });

    const saved = await coll.findOne({ _id: upsert.memberId });
    if (!saved || !('_id' in saved) || !saved._id) {
      return NextResponse.json({ error: 'No se pudo leer el miembro guardado.' }, { status: 500 });
    }

    const member = serializeMemberDoc(saved as MemberDoc);

    return NextResponse.json({
      ok: true,
      id: upsert.memberId.toString(),
      updated: upsert.outcome === 'updated',
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
