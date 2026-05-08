export type EngagementPointsAction =
  | 'bible_read'
  | 'bible_share'
  | 'bible_highlight'
  | 'bible_note_create'
  | 'bible_image_generate'
  | 'bible_image_create';

export const ENGAGEMENT_POINTS_BY_ACTION: Record<EngagementPointsAction, number> = {
  bible_read: 1,
  bible_share: 3,
  bible_highlight: 2,
  bible_note_create: 4,
  bible_image_generate: 5,
  bible_image_create: 6,
};

export const ENGAGEMENT_POINTS_CHANGED_EVENT = 'iciar-engagement-points-changed';
export const ENGAGEMENT_SYNC_CHANGED_EVENT = 'iciar-engagement-sync-changed';

const LOCAL_TOTAL_POINTS_KEY = 'iciar-engagement-points-total';
const LOCAL_DEDUPE_KEY = 'iciar-engagement-points-dedupe-v1';
const LOCAL_ACTIVITY_COUNTERS_KEY = 'iciar-engagement-points-activity-counters-v1';
const LOCAL_ACTIVITY_POINTS_KEY = 'iciar-engagement-points-activity-points-v1';
const LOCAL_DAILY_ACTIVITY_KEY = 'iciar-engagement-points-daily-activity-v1';
const LOCAL_SYNC_STATE_KEY = 'iciar-engagement-points-sync-state-v1';
const LOCAL_SERVER_SNAPSHOT_CACHE_KEY = 'iciar-engagement-server-snapshot-cache-v1';
const ENGAGEMENT_SERVER_CACHE_TTL_MS = 10 * 60 * 1000;

export type EngagementSnapshot = {
  totalPoints: number;
  counters: Partial<Record<EngagementPointsAction, number>>;
  pointsByAction: Partial<Record<EngagementPointsAction, number>>;
  dailyActivity: Record<string, number>;
};

export type EngagementSyncState = {
  status: 'syncing' | 'synced' | 'pending';
  lastAttemptAt: number | null;
  lastSuccessAt: number | null;
};

type EngagementSnapshotResponse = {
  ok?: boolean;
  found?: boolean;
  snapshot?: Partial<EngagementSnapshot>;
};

function loadDedupeMap(): Record<string, true> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_DEDUPE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, true>;
  } catch {
    return {};
  }
}

function saveDedupeMap(map: Record<string, true>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_DEDUPE_KEY, JSON.stringify(map));
  } catch {
    // ignore local storage quota issues
  }
}

function bumpLocalPoints(points: number) {
  if (typeof window === 'undefined') return;
  try {
    const current = Number(localStorage.getItem(LOCAL_TOTAL_POINTS_KEY) ?? '0');
    const safeCurrent = Number.isFinite(current) ? current : 0;
    localStorage.setItem(LOCAL_TOTAL_POINTS_KEY, String(safeCurrent + points));
  } catch {
    // ignore local storage quota issues
  }
}

function bumpLocalActivityCounter(action: EngagementPointsAction) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITY_COUNTERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const next: Record<string, number> = { ...parsed };
    next[action] = (next[action] ?? 0) + 1;
    localStorage.setItem(LOCAL_ACTIVITY_COUNTERS_KEY, JSON.stringify(next));
  } catch {
    // ignore local storage quota issues
  }
}

function bumpLocalActivityPoints(action: EngagementPointsAction, points: number) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITY_POINTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const next: Record<string, number> = { ...parsed };
    next[action] = (next[action] ?? 0) + points;
    localStorage.setItem(LOCAL_ACTIVITY_POINTS_KEY, JSON.stringify(next));
  } catch {
    // ignore local storage quota issues
  }
}

function bumpLocalDailyActivity() {
  if (typeof window === 'undefined') return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(LOCAL_DAILY_ACTIVITY_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const next: Record<string, number> = { ...parsed, [today]: (parsed[today] ?? 0) + 1 };
    localStorage.setItem(LOCAL_DAILY_ACTIVITY_KEY, JSON.stringify(next));
  } catch {
    // ignore local storage quota issues
  }
}

function emitChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ENGAGEMENT_POINTS_CHANGED_EVENT));
}

function emitSyncChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ENGAGEMENT_SYNC_CHANGED_EVENT));
}

function getDefaultSyncState(): EngagementSyncState {
  return { status: 'synced', lastAttemptAt: null, lastSuccessAt: null };
}

function setSyncState(next: EngagementSyncState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SYNC_STATE_KEY, JSON.stringify(next));
    emitSyncChanged();
  } catch {
    // ignore local storage quota issues
  }
}

export function getEngagementSyncState(): EngagementSyncState {
  if (typeof window === 'undefined') return getDefaultSyncState();
  try {
    const raw = localStorage.getItem(LOCAL_SYNC_STATE_KEY);
    if (!raw) return getDefaultSyncState();
    const parsed = JSON.parse(raw) as Partial<EngagementSyncState>;
    const status = parsed.status;
    if (status !== 'syncing' && status !== 'synced' && status !== 'pending') {
      return getDefaultSyncState();
    }
    return {
      status,
      lastAttemptAt: typeof parsed.lastAttemptAt === 'number' ? parsed.lastAttemptAt : null,
      lastSuccessAt: typeof parsed.lastSuccessAt === 'number' ? parsed.lastSuccessAt : null,
    };
  } catch {
    return getDefaultSyncState();
  }
}

function readNumberMap(key: string): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function writeNumberMap(key: string, value: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore local storage quota issues
  }
}

export function getEngagementSnapshot(): EngagementSnapshot {
  if (typeof window === 'undefined') {
    return { totalPoints: 0, counters: {}, pointsByAction: {}, dailyActivity: {} };
  }

  const totalRaw = Number(localStorage.getItem(LOCAL_TOTAL_POINTS_KEY) ?? '0');
  const totalPoints = Number.isFinite(totalRaw) ? totalRaw : 0;

  return {
    totalPoints,
    counters: readNumberMap(LOCAL_ACTIVITY_COUNTERS_KEY) as Partial<Record<EngagementPointsAction, number>>,
    pointsByAction: readNumberMap(LOCAL_ACTIVITY_POINTS_KEY) as Partial<Record<EngagementPointsAction, number>>,
    dailyActivity: readNumberMap(LOCAL_DAILY_ACTIVITY_KEY),
  };
}

function mergeNumberMaps(base: Record<string, number>, incoming: Record<string, number>): Record<string, number> {
  const keys = new Set([...Object.keys(base), ...Object.keys(incoming)]);
  const out: Record<string, number> = {};
  for (const key of keys) {
    out[key] = Math.max(base[key] ?? 0, incoming[key] ?? 0);
  }
  return out;
}

function normalizeSnapshot(input?: Partial<EngagementSnapshot>): EngagementSnapshot {
  const safeTotal = Number(input?.totalPoints ?? 0);
  return {
    totalPoints: Number.isFinite(safeTotal) ? safeTotal : 0,
    counters: (input?.counters ?? {}) as Partial<Record<EngagementPointsAction, number>>,
    pointsByAction: (input?.pointsByAction ?? {}) as Partial<Record<EngagementPointsAction, number>>,
    dailyActivity: (input?.dailyActivity ?? {}) as Record<string, number>,
  };
}

function persistSnapshot(snapshot: EngagementSnapshot) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_TOTAL_POINTS_KEY, String(snapshot.totalPoints));
    writeNumberMap(LOCAL_ACTIVITY_COUNTERS_KEY, snapshot.counters as Record<string, number>);
    writeNumberMap(LOCAL_ACTIVITY_POINTS_KEY, snapshot.pointsByAction as Record<string, number>);
    writeNumberMap(LOCAL_DAILY_ACTIVITY_KEY, snapshot.dailyActivity);
  } catch {
    // ignore local storage quota issues
  }
}

function readServerSnapshotCache(): EngagementSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_SERVER_SNAPSHOT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { snapshot?: Partial<EngagementSnapshot>; syncedAt?: number; expiresAt?: number };
    if (!parsed?.snapshot) return null;
    const expiresAt = Number(parsed.expiresAt ?? 0);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
    return normalizeSnapshot(parsed.snapshot);
  } catch {
    return null;
  }
}

function writeServerSnapshotCache(snapshot: EngagementSnapshot) {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  try {
    localStorage.setItem(
      LOCAL_SERVER_SNAPSHOT_CACHE_KEY,
      JSON.stringify({
        snapshot,
        syncedAt: now,
        expiresAt: now + ENGAGEMENT_SERVER_CACHE_TTL_MS,
      })
    );
  } catch {
    // ignore local storage quota issues
  }
}

export async function hydrateEngagementFromServer(): Promise<EngagementSnapshot> {
  const local = getEngagementSnapshot();
  if (typeof window === 'undefined') return local;
  const cachedRemote = readServerSnapshotCache();
  if (cachedRemote) {
    const mergedCached: EngagementSnapshot = {
      totalPoints: Math.max(local.totalPoints, cachedRemote.totalPoints),
      counters: mergeNumberMaps(
        local.counters as Record<string, number>,
        cachedRemote.counters as Record<string, number>
      ) as Partial<Record<EngagementPointsAction, number>>,
      pointsByAction: mergeNumberMaps(
        local.pointsByAction as Record<string, number>,
        cachedRemote.pointsByAction as Record<string, number>
      ) as Partial<Record<EngagementPointsAction, number>>,
      dailyActivity: mergeNumberMaps(local.dailyActivity, cachedRemote.dailyActivity),
    };
    persistSnapshot(mergedCached);
    emitChanged();
    return mergedCached;
  }
  const nowTs = Date.now();
  setSyncState({ ...getEngagementSyncState(), status: 'syncing', lastAttemptAt: nowTs });

  try {
    const res = await fetch('/api/engagement-points', { method: 'GET' });
    if (!res.ok) {
      setSyncState({ ...getEngagementSyncState(), status: 'pending' });
      return local;
    }
    const data = (await res.json()) as EngagementSnapshotResponse;
    if (!data.ok || !data.found || !data.snapshot) {
      setSyncState({ ...getEngagementSyncState(), status: 'synced', lastSuccessAt: Date.now() });
      return local;
    }
    const remote = normalizeSnapshot(data.snapshot);

    const merged: EngagementSnapshot = {
      totalPoints: Math.max(local.totalPoints, remote.totalPoints),
      counters: mergeNumberMaps(local.counters as Record<string, number>, remote.counters as Record<string, number>) as Partial<
        Record<EngagementPointsAction, number>
      >,
      pointsByAction: mergeNumberMaps(
        local.pointsByAction as Record<string, number>,
        remote.pointsByAction as Record<string, number>
      ) as Partial<Record<EngagementPointsAction, number>>,
      dailyActivity: mergeNumberMaps(local.dailyActivity, remote.dailyActivity),
    };

    persistSnapshot(merged);
    writeServerSnapshotCache(merged);
    emitChanged();
    setSyncState({ status: 'synced', lastAttemptAt: nowTs, lastSuccessAt: Date.now() });
    return merged;
  } catch {
    setSyncState({ ...getEngagementSyncState(), status: 'pending' });
    return local;
  }
}

async function syncPointsToServer(input: {
  action: EngagementPointsAction;
  points: number;
  dedupeKey?: string;
}) {
  const nowTs = Date.now();
  setSyncState({ ...getEngagementSyncState(), status: 'syncing', lastAttemptAt: nowTs });
  try {
    const res = await fetch('/api/engagement-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      setSyncState({ ...getEngagementSyncState(), status: 'pending' });
      return;
    }
    setSyncState({ status: 'synced', lastAttemptAt: nowTs, lastSuccessAt: Date.now() });
  } catch {
    // If offline / network fails, keep local points and continue UX.
    setSyncState({ ...getEngagementSyncState(), status: 'pending' });
  }
}

export async function grantEngagementPoints(input: {
  action: EngagementPointsAction;
  dedupeKey?: string;
  isSignedIn?: boolean;
}) {
  const { action, dedupeKey, isSignedIn } = input;
  if (isSignedIn !== true) return;
  const points = ENGAGEMENT_POINTS_BY_ACTION[action];
  if (!points) return;

  if (dedupeKey) {
    const dedupe = loadDedupeMap();
    if (dedupe[dedupeKey]) return;
    dedupe[dedupeKey] = true;
    saveDedupeMap(dedupe);
  }

  bumpLocalPoints(points);
  bumpLocalActivityCounter(action);
  bumpLocalActivityPoints(action, points);
  bumpLocalDailyActivity();
  emitChanged();
  await syncPointsToServer({ action, points, dedupeKey });
}
