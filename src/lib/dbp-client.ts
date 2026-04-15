export type DbpClientOptions = {
  /**
   * Base para consumir la API local.
   * - Cliente (browser): por defecto usa ''.
   * - Server-side: puedes pasar p.ej. 'http://localhost:9003' o tu dominio.
   */
  baseUrl?: string;
  headers?: HeadersInit;
};

export type DbpListResponse<T> = {
  data: T[];
};

export type DbpSingleResponse<T> = {
  data: T;
};

export type DbpAlphabet = {
  name: string;
  script: string;
  family: string;
  type: string;
  direction: string;
};

export type DbpLanguage = Record<string, unknown>;
export type DbpCountry = Record<string, unknown>;
export type DbpBible = Record<string, unknown>;
export type DbpSearchResult = Record<string, unknown>;

function toQueryString(query?: Record<string, string | number | boolean | undefined | null>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function dbpFetch<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
  options?: DbpClientOptions
): Promise<T> {
  const base = options?.baseUrl?.replace(/\/+$/, '') ?? '';
  const url = `${base}${path}${toQueryString(query)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    throw new Error(`DBP request failed (${res.status}) ${path}: ${raw.slice(0, 220)}`);
  }
  return (await res.json()) as T;
}

// Languages
export function getLanguages(
  query?: {
    country?: string;
    language_code?: string;
    language_name?: string;
    include_translations?: boolean;
    l10n?: string;
    page?: number;
    limit?: number;
  },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpListResponse<DbpLanguage>>('/api/dbp/languages', query, options);
}

export function getLanguageById(id: string, options?: DbpClientOptions) {
  return dbpFetch<DbpSingleResponse<DbpLanguage>>(`/api/dbp/languages/${encodeURIComponent(id)}`, undefined, options);
}

// Alphabets
export function getAlphabets(
  query?: { limit?: number; page?: number },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpListResponse<DbpAlphabet>>('/api/dbp/alphabets', query, options);
}

export function getAlphabetByScriptId(scriptId: string, options?: DbpClientOptions) {
  return dbpFetch<DbpSingleResponse<DbpAlphabet>>(
    `/api/dbp/alphabets/${encodeURIComponent(scriptId)}`,
    undefined,
    options
  );
}

// Countries
export function getCountries(
  query?: {
    l10n?: string;
    include_languages?: boolean;
    page?: number;
    limit?: number;
  },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpListResponse<DbpCountry>>('/api/dbp/countries', query, options);
}

export function getCountryById(id: string, options?: DbpClientOptions) {
  return dbpFetch<DbpSingleResponse<DbpCountry>>(`/api/dbp/countries/${encodeURIComponent(id)}`, undefined, options);
}

// Numbers
export function getNumbers(options?: DbpClientOptions) {
  return dbpFetch<DbpListResponse<Record<string, unknown>>>('/api/dbp/numbers', undefined, options);
}

export function getNumberSetById(id: string, options?: DbpClientOptions) {
  return dbpFetch<DbpSingleResponse<Record<string, unknown>>>(
    `/api/dbp/numbers/${encodeURIComponent(id)}`,
    undefined,
    options
  );
}

export function getNumbersRange(
  query: { script_id: string; start: number; end: number },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpSingleResponse<Record<string, unknown>>>('/api/dbp/numbers/range', query, options);
}

// Bibles
export function getBibles(
  query?: {
    language_code?: string;
    page?: number;
    limit?: number;
    fileset_types?: string;
    media?: string;
  },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpListResponse<DbpBible>>('/api/dbp/bibles', query, options);
}

export function getBibleById(id: string, options?: DbpClientOptions) {
  return dbpFetch<DbpSingleResponse<DbpBible>>(`/api/dbp/bibles/${encodeURIComponent(id)}`, undefined, options);
}

export function getBibleBookInfo(
  id: string,
  query: {
    book_id: string;
    verify_content?: boolean;
    verse_count?: boolean;
  },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpSingleResponse<Record<string, unknown>>>(
    `/api/dbp/bibles/${encodeURIComponent(id)}/book`,
    query,
    options
  );
}

export function getBibleDefaultsByLanguage(
  query: { language_code: string },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpListResponse<Record<string, unknown>>>('/api/dbp/bibles/defaults/types', query, options);
}

export function getBibleCopyright(
  id: string,
  query?: { iso?: string },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpSingleResponse<Record<string, unknown>>>(
    `/api/dbp/bibles/${encodeURIComponent(id)}/copyright`,
    query,
    options
  );
}

export function getBibleFilesetMediaTypes(options?: DbpClientOptions) {
  return dbpFetch<DbpListResponse<Record<string, unknown>>>('/api/dbp/bibles/filesets/media/types', undefined, options);
}

export function getBibleChapterContent(
  filesetId: string,
  book: string,
  chapter: number | string,
  query?: {
    verse_start?: number;
    verse_end?: number;
  },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpSingleResponse<Record<string, unknown>>>(
    `/api/dbp/bibles/filesets/${encodeURIComponent(filesetId)}/${encodeURIComponent(book)}/${encodeURIComponent(String(chapter))}`,
    query,
    options
  );
}

// Timestamps
export function getTimestamps(
  query?: { limit?: number; page?: number },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpListResponse<Record<string, unknown>>>('/api/dbp/timestamps', query, options);
}

export function getChapterTimestamps(
  filesetId: string,
  book: string,
  chapter: number | string,
  options?: DbpClientOptions
) {
  return dbpFetch<DbpSingleResponse<Record<string, unknown>>>(
    `/api/dbp/timestamps/${encodeURIComponent(filesetId)}/${encodeURIComponent(book)}/${encodeURIComponent(String(chapter))}`,
    undefined,
    options
  );
}

// Search
export function searchDbp(
  query: {
    query: string;
    fileset_id: string;
    limit?: number;
    page?: number;
    books?: string;
  },
  options?: DbpClientOptions
) {
  return dbpFetch<DbpListResponse<DbpSearchResult>>('/api/dbp/search', query, options);
}
