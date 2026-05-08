const VISUAL_LABEL_MAP: Record<string, string> = {
  'estudio-biblico': 'Estudio bíblico',
  'estudio_biblico': 'Estudio bíblico',
  'documento-plan': 'Documento · Plan',
  'documento-evangelismo': 'Documento · Evangelismo',
  'herramienta-biblica': 'Herramienta bíblica',
  'herramienta-diccionario': 'Herramienta · Diccionario',
  'herramienta-estudio': 'Herramienta · Estudio',
  'herramienta-comentario': 'Herramienta · Comentario',
  'herramienta-versiones': 'Herramienta · Versiones',
  'descarga-logotipo': 'Descarga · Logotipo',
  pdf: 'PDF',
  web: 'Web',
  original: 'Original',
  estudio: 'Estudio',
};

/** Clave estable para colores / reglas (avisos, recursos, badges). */
export function normalizeVisualKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s/]+/g, '-')
    .replace(/-+/g, '-');
}

export function toVisualLabel(raw: string): string {
  const key = normalizeVisualKey(raw);
  if (VISUAL_LABEL_MAP[key]) return VISUAL_LABEL_MAP[key];
  return raw
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

