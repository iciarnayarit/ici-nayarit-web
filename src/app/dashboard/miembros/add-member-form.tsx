'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { X } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { templeLocations } from '@/app/lib/temples-data';
import {
  MEMBER_MINISTRY_OPTIONS,
  MEMBER_STAFF_ROLE_OPTIONS,
  formatMinistryLabelForDisplay,
  type MemberStaffRole,
} from '@/lib/member-directory-options';
function listToCheckRecord(keys: string[]): Record<string, boolean> {
  return Object.fromEntries(keys.map(k => [k, true]));
}

function parseStaffRoleValue(v: string | undefined): MemberStaffRole {
  if (v && MEMBER_STAFF_ROLE_OPTIONS.some(o => o.value === v)) {
    return v as MemberStaffRole;
  }
  return 'sin_especificar';
}

/** Respuesta de GET/POST `api/members` (incluye `id`). */
type MemberFromApi = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  baptismDate?: string;
  staffRole?: string;
  groups?: string[];
  /** Respuestas antiguas de la API */
  ministries?: string[];
  templeIds?: string[];
  templeKeys?: string[];
  createdAt?: string;
  updatedAt?: string;
};

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <CardTitle className="text-base font-bold leading-snug tracking-tight text-gray-900 sm:text-lg">
      {children}
    </CardTitle>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

type FieldErrorKey =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'address'
  | 'birthDate'
  | 'staffRole'
  | 'ministries'
  | 'temples';

export default function AddMemberForm() {
  const { user, isLoaded: userLoaded } = useUser();
  const sessionEmail = useMemo(() => {
    if (!user) return '';
    const primary = user.primaryEmailAddress?.emailAddress?.trim();
    if (primary) return primary;
    const first = user.emailAddresses?.[0]?.emailAddress?.trim();
    return first ?? '';
  }, [user]);

  /** Nombre y apellido desde el perfil de Clerk (`firstName` / `lastName`, con respaldo desde `fullName`). */
  const sessionFirstName = useMemo(() => {
    if (!user) return '';
    const fn = user.firstName?.trim();
    if (fn) return fn;
    const full = user.fullName?.trim();
    if (full) {
      const i = full.indexOf(' ');
      return i === -1 ? full : full.slice(0, i);
    }
    return '';
  }, [user]);

  const sessionLastName = useMemo(() => {
    if (!user) return '';
    const ln = user.lastName?.trim();
    if (ln) return ln;
    const full = user.fullName?.trim();
    if (full) {
      const i = full.indexOf(' ');
      return i === -1 ? '' : full.slice(i + 1).trim();
    }
    return '';
  }, [user]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const lastSeededClerkUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!userLoaded) return;
    if (!user) {
      lastSeededClerkUserId.current = undefined;
      setFirstName('');
      setLastName('');
      return;
    }
    if (lastSeededClerkUserId.current !== user.id) {
      lastSeededClerkUserId.current = user.id;
      setFirstName(sessionFirstName);
      setLastName(sessionLastName);
      return;
    }
    setFirstName(prev => (prev === '' && sessionFirstName ? sessionFirstName : prev));
    setLastName(prev => (prev === '' && sessionLastName ? sessionLastName : prev));
  }, [userLoaded, user, sessionFirstName, sessionLastName]);

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [baptismDate, setBaptismDate] = useState('');
  const [staffRole, setStaffRole] = useState<MemberStaffRole>('sin_especificar');
  const [ministries, setMinistries] = useState<Record<string, boolean>>({});
  const [templeKeys, setTempleKeys] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldErrorKey, string>>>({});
  const [formBanner, setFormBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  /** Tras guardar OK en MongoDB (`members`); se quita al editar de nuevo. */
  const [showSavedOnButton, setShowSavedOnButton] = useState(false);
  const [memberHydrating, setMemberHydrating] = useState(false);

  const applyMemberFromApi = useCallback((m: MemberFromApi) => {
    setFirstName(m.firstName ?? '');
    setLastName(m.lastName ?? '');
    setPhone(m.phone ?? '');
    setAddress(m.address ?? '');
    setBirthDate(m.birthDate ?? '');
    setBaptismDate(m.baptismDate ?? '');
    setStaffRole(parseStaffRoleValue(m.staffRole));
    setMinistries(listToCheckRecord(m.groups ?? m.ministries ?? []));
    setTempleKeys(listToCheckRecord(m.templeIds ?? m.templeKeys ?? []));
  }, []);

  useEffect(() => {
    if (!userLoaded) return;

    if (!user || !sessionEmail) {
      setMemberHydrating(false);
      return;
    }

    let cancelled = false;
    setMemberHydrating(true);

    (async () => {
      try {
        const res = await fetch('/api/members');
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          member?: MemberFromApi | null;
        };
        if (cancelled) return;
        if (!res.ok) {
          setFormBanner({
            type: 'error',
            text: data.error ?? 'No se pudo cargar tu información desde la base de datos.',
          });
          return;
        }
        if (data.member) {
          applyMemberFromApi(data.member);
        }
      } finally {
        if (!cancelled) setMemberHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userLoaded, user?.id, sessionEmail, applyMemberFromApi]);

  const sortedTemples = useMemo(
    () => [...templeLocations].sort((a, b) => a.nameKey.localeCompare(b.nameKey, 'es')),
    []
  );

  const toggleMinistry = useCallback((id: string, checked: boolean) => {
    setShowSavedOnButton(false);
    setFieldErrors(prev => ({ ...prev, ministries: undefined }));
    setMinistries(prev => ({ ...prev, [id]: checked }));
  }, []);

  const toggleTemple = useCallback((nameKey: string, checked: boolean) => {
    setShowSavedOnButton(false);
    setFieldErrors(prev => ({ ...prev, temples: undefined }));
    setTempleKeys(prev => ({ ...prev, [nameKey]: checked }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormBanner(null);

    if (!userLoaded) {
      setFormBanner({
        type: 'error',
        text: 'Espera a que cargue tu sesión e inténtalo de nuevo.',
      });
      return;
    }

    const next: Partial<Record<FieldErrorKey, string>> = {};
    if (!firstName.trim()) {
      next.firstName = 'El nombre es obligatorio.';
    }
    if (!lastName.trim()) {
      next.lastName = 'El apellido es obligatorio.';
    }
    if (!sessionEmail) {
      next.email = 'Tu cuenta no tiene correo. Añádelo en la configuración de tu perfil.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sessionEmail)) {
      next.email = 'El correo de tu cuenta no es válido.';
    }
    if (!phone.trim()) {
      next.phone = 'El número de teléfono es obligatorio.';
    }
    if (!address.trim()) {
      next.address = 'La dirección es obligatoria.';
    }
    if (!birthDate.trim()) {
      next.birthDate = 'La fecha de nacimiento es obligatoria.';
    }
    if (staffRole === 'sin_especificar') {
      next.staffRole = 'Selecciona un cargo o rol.';
    }

    const ministryList = Object.entries(ministries)
      .filter(([, on]) => on)
      .map(([id]) => id);
    if (ministryList.length === 0) {
      next.ministries = 'Selecciona al menos un ministerio.';
    }

    const templeList = Object.entries(templeKeys)
      .filter(([, on]) => on)
      .map(([nameKey]) => nameKey);
    if (templeList.length === 0) {
      next.temples = 'Selecciona al menos un templo. Puedes marcar varios.';
    }

    setFieldErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: sessionEmail,
          phone: phone.trim(),
          address: address.trim(),
          birthDate,
          baptismDate,
          staffRole,
          groups: ministryList,
          templeIds: templeList,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
        id?: string;
        updated?: boolean;
        member?: MemberFromApi;
      };
      if (!res.ok) {
        setShowSavedOnButton(false);
        setFormBanner({
          type: 'error',
          text: data.error ?? `No se pudo guardar (error ${res.status}).`,
        });
        return;
      }
      setShowSavedOnButton(true);
      setFieldErrors({});
      if (data.member) {
        applyMemberFromApi(data.member);
      }
      setFormBanner({
        type: 'success',
        text: data.updated
          ? `${data.member?.firstName?.trim() ?? firstName.trim()} ${data.member?.lastName?.trim() ?? lastName.trim()} se actualizó correctamente.`
          : `${data.member?.firstName?.trim() ?? firstName.trim()} ${data.member?.lastName?.trim() ?? lastName.trim()} quedó registrado correctamente.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveButtonLabel = isSubmitting ? 'Guardando…' : showSavedOnButton ? 'guardado' : 'Guardar';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
      {formBanner && (
        <div
          role="status"
          className={cn(
            'flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium sm:gap-3 sm:px-4 sm:py-3 sm:text-sm',
            formBanner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-800'
          )}
        >
          <span className="min-w-0 flex-1 leading-snug pt-0.5">{formBanner.text}</span>
          <button
            type="button"
            onClick={() => setFormBanner(null)}
            className={cn(
              'shrink-0 flex h-11 w-11 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-9 sm:w-9',
              formBanner.type === 'success'
                ? 'text-emerald-800 hover:bg-emerald-100/90 focus-visible:ring-emerald-500'
                : 'text-red-800 hover:bg-red-100/90 focus-visible:ring-red-500'
            )}
            aria-label="Cerrar aviso"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 pr-0 sm:pr-4">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 font-display sm:text-3xl">
            Actualiza tu Información
          </h1>
          <p className="mt-1.5 text-xs font-medium text-gray-500 max-w-2xl sm:text-sm">
            Ingrese los detalles a continuación.
            {memberHydrating ? (
              <span className="mt-1 block text-gray-400">Cargando datos guardados en la base de datos…</span>
            ) : null}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Button
            type="submit"
            variant="outline"
            className={cn(
              'h-12 w-full rounded-xl px-5 font-semibold shadow-sm transition-colors sm:h-11 sm:w-auto sm:min-w-[8.5rem]',
              isSubmitting &&
                'border-neutral-600 bg-neutral-600 text-white hover:bg-neutral-600 hover:text-white',
              !isSubmitting &&
                showSavedOnButton &&
                'border-amber-500/60 bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700',
              !isSubmitting &&
                !showSavedOnButton &&
                '!border-black !bg-black !text-white hover:!bg-neutral-900 hover:!text-white'
            )}
            disabled={isSubmitting}
          >
            {saveButtonLabel}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border border-gray-200/80 shadow-sm sm:rounded-2xl">
        <CardHeader className="space-y-1 p-4 pb-3 sm:p-6 sm:pb-4">
          <SectionHeading>Información personal</SectionHeading>
          <CardDescription>Detalles básicos para el registro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member-first-name">Nombre (obligatorio, prellenado desde tu sesión)</Label>
              <Input
                id="member-first-name"
                placeholder={userLoaded ? 'Tu nombre' : 'Cargando…'}
                value={firstName}
                onChange={e => {
                  setShowSavedOnButton(false);
                  setFirstName(e.target.value);
                  setFieldErrors(prev => ({ ...prev, firstName: undefined }));
                }}
                className={cn(
                  'h-12 rounded-xl sm:h-10',
                  fieldErrors.firstName && 'border-red-500 focus-visible:ring-red-500'
                )}
                autoComplete="given-name"
                aria-invalid={!!fieldErrors.firstName}
                aria-describedby={fieldErrors.firstName ? 'err-member-first-name' : undefined}
              />
              <FieldError id="err-member-first-name" message={fieldErrors.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-last-name">Apellido (obligatorio, prellenado desde tu sesión)</Label>
              <Input
                id="member-last-name"
                placeholder={userLoaded ? 'Tu apellido' : 'Cargando…'}
                value={lastName}
                onChange={e => {
                  setShowSavedOnButton(false);
                  setLastName(e.target.value);
                  setFieldErrors(prev => ({ ...prev, lastName: undefined }));
                }}
                className={cn(
                  'h-12 rounded-xl sm:h-10',
                  fieldErrors.lastName && 'border-red-500 focus-visible:ring-red-500'
                )}
                autoComplete="family-name"
                aria-invalid={!!fieldErrors.lastName}
                aria-describedby={fieldErrors.lastName ? 'err-member-last-name' : undefined}
              />
              <FieldError id="err-member-last-name" message={fieldErrors.lastName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">Correo electrónico (obligatorio, de tu sesión)</Label>
              <Input
                id="member-email"
                type="email"
                placeholder={userLoaded ? 'Sin correo en la cuenta' : 'Cargando…'}
                value={sessionEmail}
                disabled
                readOnly
                className={cn(
                  'h-12 cursor-not-allowed rounded-xl bg-gray-50 text-gray-800 sm:h-10',
                  fieldErrors.email && 'border-red-500'
                )}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'err-member-email' : undefined}
              />
              <FieldError id="err-member-email" message={fieldErrors.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-phone">Número de teléfono (obligatorio)</Label>
              <Input
                id="member-phone"
                type="tel"
                placeholder="+52 (311) 000-0000"
                value={phone}
                onChange={e => {
                  setShowSavedOnButton(false);
                  setPhone(e.target.value);
                  setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }}
                className={cn(
                  'h-12 rounded-xl sm:h-10',
                  fieldErrors.phone && 'border-red-500 focus-visible:ring-red-500'
                )}
                autoComplete="tel"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'err-member-phone' : undefined}
              />
              <FieldError id="err-member-phone" message={fieldErrors.phone} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="member-address">Dirección (obligatorio)</Label>
              <Input
                id="member-address"
                placeholder="Calle, número, colonia, ciudad"
                value={address}
                onChange={e => {
                  setShowSavedOnButton(false);
                  setAddress(e.target.value);
                  setFieldErrors(prev => ({ ...prev, address: undefined }));
                }}
                className={cn(
                  'h-12 rounded-xl sm:h-10',
                  fieldErrors.address && 'border-red-500 focus-visible:ring-red-500'
                )}
                autoComplete="street-address"
                aria-invalid={!!fieldErrors.address}
                aria-describedby={fieldErrors.address ? 'err-member-address' : undefined}
              />
              <FieldError id="err-member-address" message={fieldErrors.address} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-birth">Fecha de nacimiento (obligatorio)</Label>
              <Input
                id="member-birth"
                type="date"
                value={birthDate}
                onChange={e => {
                  setShowSavedOnButton(false);
                  setBirthDate(e.target.value);
                  setFieldErrors(prev => ({ ...prev, birthDate: undefined }));
                }}
                className={cn(
                  'h-12 rounded-xl sm:h-10',
                  fieldErrors.birthDate && 'border-red-500 focus-visible:ring-red-500'
                )}
                aria-invalid={!!fieldErrors.birthDate}
                aria-describedby={fieldErrors.birthDate ? 'err-member-birth' : undefined}
              />
              <FieldError id="err-member-birth" message={fieldErrors.birthDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-baptism">Fecha de bautismo (opcional)</Label>
              <Input
                id="member-baptism"
                type="date"
                value={baptismDate}
                onChange={e => {
                  setShowSavedOnButton(false);
                  setBaptismDate(e.target.value);
                }}
                className="h-12 rounded-xl sm:h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-xl border border-gray-200/80 shadow-sm sm:rounded-2xl">
        <CardHeader className="space-y-1 p-4 pb-3 sm:p-6 sm:pb-4">
          <SectionHeading>Cargo</SectionHeading>
          <CardDescription>
            Indique si el miembro es Pastor o Congregante, con ello podrá listarse en el directorio de personal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
          <Select
            value={staffRole}
            onValueChange={v => {
              setShowSavedOnButton(false);
              setStaffRole(v as MemberStaffRole);
              setFieldErrors(prev => ({ ...prev, staffRole: undefined }));
            }}
          >
            <SelectTrigger
              id="member-role"
              className={cn(
                'h-12 w-full rounded-xl text-base sm:h-11 sm:text-sm',
                fieldErrors.staffRole && 'border-red-500 focus:ring-red-500'
              )}
              aria-invalid={!!fieldErrors.staffRole}
              aria-describedby={fieldErrors.staffRole ? 'err-member-role' : undefined}
            >
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(70vh,24rem)]">
              {MEMBER_STAFF_ROLE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="err-member-role" message={fieldErrors.staffRole} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-xl border border-gray-200/80 shadow-sm sm:rounded-2xl">
        <CardHeader className="space-y-1 p-4 pb-3 sm:p-6 sm:pb-4">
          <SectionHeading>Grupos y ministerios (obligatorio)</SectionHeading>
          <CardDescription>
            Elija al menos un ministerio. Puede marcar varios según corresponda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
          <div
            className={cn(
              'max-h-[min(50vh,13rem)] touch-pan-y space-y-2 overflow-y-auto overscroll-y-contain rounded-xl border bg-white p-3 [scrollbar-width:thin] sm:max-h-52 sm:space-y-3',
              fieldErrors.ministries ? 'border-red-500 ring-1 ring-red-500/30' : 'border-gray-200'
            )}
            aria-invalid={!!fieldErrors.ministries}
            aria-describedby={fieldErrors.ministries ? 'err-member-ministries' : undefined}
          >
            {MEMBER_MINISTRY_OPTIONS.map(label => (
              <label
                key={label}
                className="flex cursor-pointer items-start gap-3 rounded-lg py-2 pl-1 pr-2 text-sm font-medium text-gray-700 active:bg-gray-50 sm:py-1.5"
              >
                <Checkbox
                  checked={!!ministries[label]}
                  onCheckedChange={c => toggleMinistry(label, c === true)}
                  className="mt-0.5 size-5 sm:size-4"
                />
                <span className="leading-snug">{formatMinistryLabelForDisplay(label)}</span>
              </label>
            ))}
          </div>
          <FieldError id="err-member-ministries" message={fieldErrors.ministries} />
          <p className="text-xs text-gray-500">Debe elegir al menos uno; puede marcar todos los que apliquen.</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-xl border border-gray-200/80 shadow-sm sm:rounded-2xl">
        <CardHeader className="space-y-1 p-4 pb-3 sm:p-6 sm:pb-4">
          <SectionHeading>Templo</SectionHeading>
          <CardDescription>
            Debe elegir al menos un templo; puede marcar todos los que correspondan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
          <div
            className={cn(
              'max-h-[min(55vh,16rem)] touch-pan-y space-y-3 overflow-y-auto overscroll-y-contain rounded-xl border bg-white p-3 [scrollbar-width:thin] sm:max-h-60 sm:space-y-4',
              fieldErrors.temples ? 'border-red-500 ring-1 ring-red-500/30' : 'border-gray-200'
            )}
            aria-invalid={!!fieldErrors.temples}
            aria-describedby={fieldErrors.temples ? 'err-member-temples' : undefined}
          >
            {sortedTemples.map(t => (
              <label
                key={t.nameKey}
                className="flex cursor-pointer items-start gap-3 rounded-lg py-2 pl-1 pr-2 active:bg-gray-50 sm:py-1.5"
              >
                <Checkbox
                  checked={!!templeKeys[t.nameKey]}
                  onCheckedChange={c => toggleTemple(t.nameKey, c === true)}
                  className="mt-1 size-5 sm:size-4"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">{t.nameKey}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {t.municipality}
                    {t.addressKey ? ` · ${t.addressKey}` : ''}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <FieldError id="err-member-temples" message={fieldErrors.temples} />
          <p className="text-xs text-gray-500">Mínimo uno obligatorio; las casillas permiten elegir varios templos.</p>
        </CardContent>
      </Card>
    </form>
  );
}
