export type ReflectionCategory =
  | 'devocional'
  | 'oracion'
  | 'agradecimiento'
  | 'peticion'
  | 'testimonio'
  | 'estudio-biblico'
  | 'familia'
  | 'comunidad'
  | 'otros';

export type NlpClassification = {
  category: ReflectionCategory;
  confidence: number;
  suggestedTags: string[];
  reason: string;
};

type CategoryProfile = {
  category: ReflectionCategory;
  keywords: string[];
  tags: string[];
  reason: string;
};

const PROFILES: CategoryProfile[] = [
  {
    category: 'oracion',
    keywords: ['oracion', 'orar', 'interceder', 'clamar', 'peticion', 'suplico', 'ayuno'],
    tags: ['oracion', 'intercesion', 'fe'],
    reason: 'Predominan términos de oración e intercesión.',
  },
  {
    category: 'agradecimiento',
    keywords: ['gracias', 'agradezco', 'gratitud', 'bendicion', 'favores', 'milagro', 'provision'],
    tags: ['gratitud', 'alabanza', 'bendicion'],
    reason: 'El texto expresa gratitud y reconocimiento de bendiciones.',
  },
  {
    category: 'peticion',
    keywords: ['ayudame', 'necesito', 'restaura', 'sana', 'abre puertas', 'respuesta', 'direccion'],
    tags: ['peticion', 'esperanza', 'oracion'],
    reason: 'El contenido contiene solicitudes directas y necesidades.',
  },
  {
    category: 'testimonio',
    keywords: ['testimonio', 'antes', 'ahora', 'transformo', 'cambio mi vida', 'me rescato', 'restauro'],
    tags: ['testimonio', 'transformacion', 'gracia'],
    reason: 'El contenido narra cambios personales y experiencia de fe.',
  },
  {
    category: 'estudio-biblico',
    keywords: ['versiculo', 'capitulo', 'interpretacion', 'contexto', 'doctrina', 'exegesis', 'pasaje', 'biblia'],
    tags: ['estudio', 'biblia', 'doctrina'],
    reason: 'Se observan patrones de estudio y análisis bíblico.',
  },
  {
    category: 'familia',
    keywords: ['familia', 'hijos', 'matrimonio', 'hogar', 'padres', 'esposo', 'esposa'],
    tags: ['familia', 'hogar', 'unidad'],
    reason: 'El foco principal está en relaciones familiares.',
  },
  {
    category: 'comunidad',
    keywords: ['iglesia', 'ministerio', 'comunidad', 'discipulado', 'servicio', 'liderazgo', 'congregacion'],
    tags: ['iglesia', 'servicio', 'comunidad'],
    reason: 'El contenido se centra en vida comunitaria y ministerial.',
  },
  {
    category: 'devocional',
    keywords: ['reflexion', 'presencia', 'adoracion', 'silencio', 'paz', 'corazon', 'espiritu santo', 'jesus'],
    tags: ['devocional', 'adoracion', 'intimidad'],
    reason: 'El tono es meditativo y devocional.',
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripHtmlToText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function classifyReflectionText(input: { title?: string; body: string; maxTags?: number }): NlpClassification {
  const plain = `${input.title ?? ''} ${stripHtmlToText(input.body)}`.trim();
  const text = normalizeText(plain);
  const words = text.split(' ').filter(Boolean);
  const textLen = Math.max(1, words.length);

  let best: { profile: CategoryProfile; score: number } | null = null;
  const allTagScores = new Map<string, number>();

  for (const profile of PROFILES) {
    let score = 0;
    for (const kw of profile.keywords) {
      const kwNorm = normalizeText(kw);
      if (!kwNorm) continue;
      if (text.includes(kwNorm)) {
        score += Math.max(1, kwNorm.split(' ').length * 0.8);
      }
    }

    if (score > 0) {
      for (const tag of profile.tags) {
        allTagScores.set(tag, (allTagScores.get(tag) ?? 0) + score);
      }
    }

    if (!best || score > best.score) {
      best = { profile, score };
    }
  }

  if (!best || best.score <= 0) {
    return {
      category: 'otros',
      confidence: 0.2,
      suggestedTags: ['reflexion'],
      reason: 'No hubo suficientes señales para una categoría específica.',
    };
  }

  const rawConfidence = Math.min(0.97, 0.35 + best.score / (textLen * 0.32 + 4));
  const maxTags = Math.max(1, Math.min(6, input.maxTags ?? 4));
  const suggestedTags = [...allTagScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([tag]) => tag);

  return {
    category: best.profile.category,
    confidence: Number(rawConfidence.toFixed(2)),
    suggestedTags: suggestedTags.length > 0 ? suggestedTags : best.profile.tags.slice(0, maxTags),
    reason: best.profile.reason,
  };
}
