import { createClient, type RedisClientType } from 'redis';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const RAM_CACHE = new Map<string, CacheEntry<unknown>>();
const DEFAULT_MAX_ENTRIES = 1200;
const DEFAULT_REDIS_CONNECT_TIMEOUT_MS = 2000;
const REDIS_DISABLED = (process.env.REDIS_DISABLED ?? '').trim() === '1';
const REDIS_URL = process.env.REDIS_URL?.trim() ?? '';
const REDIS_PREFIX = (process.env.REDIS_KEY_PREFIX?.trim() || 'iciar:cache').replace(/:+$/, '');

let redisClient: RedisClientType | null = null;
let redisConnectPromise: Promise<RedisClientType | null> | null = null;
let redisAvailable = false;
let redisLastErrorAt: number | null = null;

function maxEntries(): number {
  const raw = Number(process.env.RAM_CACHE_MAX_ENTRIES ?? DEFAULT_MAX_ENTRIES);
  if (!Number.isFinite(raw)) return DEFAULT_MAX_ENTRIES;
  return Math.max(50, Math.floor(raw));
}

function touchEntry(key: string, entry: CacheEntry<unknown>) {
  // Reinsertar para mantener orden de uso reciente (LRU).
  RAM_CACHE.delete(key);
  RAM_CACHE.set(key, entry);
}

function sweepExpiredEntries(nowMs: number) {
  for (const [key, entry] of RAM_CACHE.entries()) {
    if (entry.expiresAt <= nowMs) {
      RAM_CACHE.delete(key);
    }
  }
}

function evictLeastRecentlyUsed() {
  const oldestKey = RAM_CACHE.keys().next().value as string | undefined;
  if (!oldestKey) return;
  RAM_CACHE.delete(oldestKey);
}

function redisEnabled() {
  return Boolean(!REDIS_DISABLED && REDIS_URL);
}

function redisKey(key: string) {
  return `${REDIS_PREFIX}:${key}`;
}

async function getRedisClient(): Promise<RedisClientType | null> {
  if (!redisEnabled()) return null;
  if (redisClient?.isOpen) return redisClient;
  if (redisConnectPromise) return redisConnectPromise;

  redisConnectPromise = (async () => {
    try {
      const client = createClient({
        url: REDIS_URL,
        socket: {
          connectTimeout: Math.max(
            250,
            Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? DEFAULT_REDIS_CONNECT_TIMEOUT_MS) || DEFAULT_REDIS_CONNECT_TIMEOUT_MS
          ),
          reconnectStrategy: false,
        },
      });
      client.on('error', () => {
        redisAvailable = false;
        redisLastErrorAt = Date.now();
      });
      await client.connect();
      redisClient = client;
      redisAvailable = true;
      return client;
    } catch {
      redisAvailable = false;
      redisLastErrorAt = Date.now();
      return null;
    } finally {
      redisConnectPromise = null;
    }
  })();

  return redisConnectPromise;
}

async function getRedisCache<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;
    const raw = await client.get(redisKey(key));
    if (!raw) return null;
    redisAvailable = true;
    return JSON.parse(raw) as T;
  } catch {
    redisAvailable = false;
    redisLastErrorAt = Date.now();
    return null;
  }
}

async function setRedisCache<T>(key: string, value: T, ttlMs: number): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) return false;
    await client.set(redisKey(key), JSON.stringify(value), {
      PX: Math.max(1, Math.floor(ttlMs)),
    });
    redisAvailable = true;
    return true;
  } catch {
    redisAvailable = false;
    redisLastErrorAt = Date.now();
    return false;
  }
}

async function deleteRedisCache(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) return false;
    await client.del(redisKey(key));
    redisAvailable = true;
    return true;
  } catch {
    redisAvailable = false;
    redisLastErrorAt = Date.now();
    return false;
  }
}

export function getRamCache<T>(key: string): T | null {
  const entry = RAM_CACHE.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    RAM_CACHE.delete(key);
    return null;
  }
  touchEntry(key, entry);
  return entry.value as T;
}

export function setRamCache<T>(key: string, value: T, ttlMs: number): T {
  const nowMs = Date.now();
  if (RAM_CACHE.size > maxEntries() * 1.2) {
    sweepExpiredEntries(nowMs);
  }

  const safeTtl = Math.max(1, ttlMs);
  RAM_CACHE.set(key, { value, expiresAt: nowMs + safeTtl });
  const max = maxEntries();
  while (RAM_CACHE.size > max) {
    evictLeastRecentlyUsed();
  }
  return value;
}

export function deleteRamCache(key: string) {
  RAM_CACHE.delete(key);
}

export async function getOrSetRamCache<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T> {
  const cached = await getSharedCache<T>(key);
  if (cached !== null) return cached;
  const value = await compute();
  return setSharedCache(key, value, ttlMs);
}

export async function getSharedCache<T>(key: string): Promise<T | null> {
  const redisValue = await getRedisCache<T>(key);
  if (redisValue !== null) {
    const local = getRamCache<T>(key);
    if (local === null) {
      setRamCache(key, redisValue, 30_000);
    }
    return redisValue;
  }
  return getRamCache<T>(key);
}

export async function setSharedCache<T>(key: string, value: T, ttlMs: number): Promise<T> {
  setRamCache(key, value, ttlMs);
  await setRedisCache(key, value, ttlMs);
  return value;
}

export async function deleteSharedCache(key: string): Promise<void> {
  deleteRamCache(key);
  await deleteRedisCache(key);
}

export function getRamCacheStats() {
  return {
    size: RAM_CACHE.size,
    maxEntries: maxEntries(),
    redisEnabled: redisEnabled(),
    redisAvailable,
    redisLastErrorAt: redisLastErrorAt ? new Date(redisLastErrorAt).toISOString() : null,
  };
}
