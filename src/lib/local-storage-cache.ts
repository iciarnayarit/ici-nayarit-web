type CacheEnvelope<T> = {
  data: T;
  syncedAt: number;
  expiresAt: number;
};

type CacheIndexEntry = {
  key: string;
  syncedAt: number;
  expiresAt: number;
};

const CACHE_INDEX_KEY = 'iciar-local-cache-index-v1';
const MAX_CACHE_ENTRIES = 40;
const inFlightByKey = new Map<string, Promise<unknown>>();
const lastRemoteFetchAtByKey = new Map<string, number>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function readCacheIndex(): CacheIndexEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CACHE_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is CacheIndexEntry => {
        return (
          typeof entry === 'object' &&
          entry !== null &&
          typeof (entry as { key?: unknown }).key === 'string' &&
          Number.isFinite(Number((entry as { syncedAt?: unknown }).syncedAt)) &&
          Number.isFinite(Number((entry as { expiresAt?: unknown }).expiresAt))
        );
      })
      .map(entry => ({
        key: entry.key,
        syncedAt: Number(entry.syncedAt),
        expiresAt: Number(entry.expiresAt),
      }));
  } catch {
    return [];
  }
}

function writeCacheIndex(entries: CacheIndexEntry[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(entries));
  } catch {
    // ignore localStorage quota issues
  }
}

function pruneLocalCacheIndex() {
  if (!isBrowser()) return;
  const now = Date.now();
  const index = readCacheIndex();
  const existing: CacheIndexEntry[] = [];

  for (const entry of index) {
    if (entry.expiresAt <= now) {
      try {
        localStorage.removeItem(entry.key);
      } catch {
        // ignore
      }
      continue;
    }
    existing.push(entry);
  }

  existing.sort((a, b) => b.syncedAt - a.syncedAt);
  const kept = existing.slice(0, MAX_CACHE_ENTRIES);
  const evicted = existing.slice(MAX_CACHE_ENTRIES);
  for (const entry of evicted) {
    try {
      localStorage.removeItem(entry.key);
    } catch {
      // ignore
    }
  }

  writeCacheIndex(kept);
}

function touchCacheIndex(entry: CacheIndexEntry) {
  if (!isBrowser()) return;
  const index = readCacheIndex();
  const filtered = index.filter(e => e.key !== entry.key);
  filtered.push(entry);
  writeCacheIndex(filtered);
  pruneLocalCacheIndex();
}

export function readLocalCache<T>(key: string): CacheEnvelope<T> | null {
  if (!isBrowser()) return null;
  pruneLocalCacheIndex();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CacheEnvelope<T>>;
    if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) return null;
    const syncedAt = Number(parsed.syncedAt ?? 0);
    const expiresAt = Number(parsed.expiresAt ?? 0);
    if (!Number.isFinite(syncedAt) || !Number.isFinite(expiresAt)) return null;
    return {
      data: parsed.data as T,
      syncedAt,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export function writeLocalCache<T>(key: string, data: T, ttlMs: number): void {
  if (!isBrowser()) return;
  const now = Date.now();
  const safeTtl = Math.max(1_000, ttlMs);
  const next: CacheEnvelope<T> = {
    data,
    syncedAt: now,
    expiresAt: now + safeTtl,
  };
  try {
    localStorage.setItem(key, JSON.stringify(next));
    touchCacheIndex({ key, syncedAt: next.syncedAt, expiresAt: next.expiresAt });
  } catch {
    // ignore localStorage quota issues
  }
}

export function isCacheFresh<T>(entry: CacheEnvelope<T> | null): boolean {
  if (!entry) return false;
  return entry.expiresAt > Date.now();
}

export async function getLocalFirstData<T>(input: {
  cacheKey: string;
  ttlMs: number;
  fetcher: () => Promise<T>;
  minRemoteIntervalMs?: number;
  forceRemote?: boolean;
}): Promise<T> {
  const cached = readLocalCache<T>(input.cacheKey);
  const forceRemote = input.forceRemote === true;
  if (!forceRemote && isCacheFresh(cached)) {
    return cached.data;
  }

  const now = Date.now();
  const minRemoteIntervalMs = Math.max(0, input.minRemoteIntervalMs ?? 0);
  const lastFetchAt = lastRemoteFetchAtByKey.get(input.cacheKey) ?? 0;
  const shouldCooldown = !forceRemote && minRemoteIntervalMs > 0 && now - lastFetchAt < minRemoteIntervalMs;
  if (shouldCooldown && cached) {
    return cached.data;
  }

  const inFlight = inFlightByKey.get(input.cacheKey) as Promise<T> | undefined;
  if (inFlight) {
    try {
      return await inFlight;
    } catch {
      if (cached) return cached.data;
      throw new Error('No se pudo resolver petición en curso.');
    }
  }

  const requestPromise = (async () => {
    try {
      const remote = await input.fetcher();
      writeLocalCache(input.cacheKey, remote, input.ttlMs);
      lastRemoteFetchAtByKey.set(input.cacheKey, Date.now());
      return remote;
    } finally {
      inFlightByKey.delete(input.cacheKey);
    }
  })();

  inFlightByKey.set(input.cacheKey, requestPromise as Promise<unknown>);

  try {
    return await requestPromise;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}
