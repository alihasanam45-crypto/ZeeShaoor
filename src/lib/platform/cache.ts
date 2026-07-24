/**
 * In-process TTL cache with tag invalidation and stampede protection.
 *
 * Analytics aggregations over a large question bank are expensive and change
 * slowly, so they are cached for tens of seconds rather than recomputed per
 * request. Two properties matter under load:
 *
 *  - **Single-flight**: concurrent misses for the same key await one in-flight
 *    computation instead of each starting their own (cache stampede).
 *  - **Bounded size**: LRU-ish eviction keeps memory flat when key cardinality
 *    is driven by user input (search terms, filter combinations).
 *
 * Scope is one server process; it is a latency optimisation, never a source of
 * truth. Swap in Redis behind this same interface when running multi-instance
 * with a shared invalidation requirement.
 */

interface Entry<T> {
  value: T
  expiresAt: number
  tags: string[]
  lastRead: number
}

interface CacheState {
  entries: Map<string, Entry<unknown>>
  inflight: Map<string, Promise<unknown>>
  hits: number
  misses: number
}

declare global {
  // eslint-disable-next-line no-var
  var __zeeCache: CacheState | undefined
}

const MAX_ENTRIES = 500

const state: CacheState = globalThis.__zeeCache ?? {
  entries: new Map(),
  inflight: new Map(),
  hits: 0,
  misses: 0,
}
globalThis.__zeeCache = state

function evictIfNeeded(): void {
  if (state.entries.size <= MAX_ENTRIES) return

  // Drop expired entries first; only fall back to evicting the least recently
  // read entry when everything is still live.
  const now = Date.now()
  for (const [key, entry] of state.entries) {
    if (entry.expiresAt <= now) state.entries.delete(key)
  }
  while (state.entries.size > MAX_ENTRIES) {
    let oldestKey: string | null = null
    let oldestRead = Infinity
    for (const [key, entry] of state.entries) {
      if (entry.lastRead < oldestRead) {
        oldestRead = entry.lastRead
        oldestKey = key
      }
    }
    if (oldestKey === null) break
    state.entries.delete(oldestKey)
  }
}

export function cacheGet<T>(key: string): T | undefined {
  const entry = state.entries.get(key) as Entry<T> | undefined
  if (!entry) return undefined
  if (entry.expiresAt <= Date.now()) {
    state.entries.delete(key)
    return undefined
  }
  entry.lastRead = Date.now()
  return entry.value
}

export function cacheSet<T>(key: string, value: T, ttlMs: number, tags: string[] = []): void {
  state.entries.set(key, { value, expiresAt: Date.now() + ttlMs, tags, lastRead: Date.now() })
  evictIfNeeded()
}

/**
 * Read-through cache. Concurrent callers for a missing key share one
 * computation; a rejection is not cached, so the next caller retries.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  compute: () => Promise<T>,
  tags: string[] = [],
): Promise<T> {
  const hit = cacheGet<T>(key)
  if (hit !== undefined) {
    state.hits += 1
    return hit
  }

  const pending = state.inflight.get(key) as Promise<T> | undefined
  if (pending) return pending

  state.misses += 1
  const promise = compute()
    .then((value) => {
      cacheSet(key, value, ttlMs, tags)
      return value
    })
    .finally(() => {
      state.inflight.delete(key)
    })

  state.inflight.set(key, promise)
  return promise
}

/** Invalidates every entry carrying any of the given tags. */
export function invalidateTags(...tags: string[]): number {
  let removed = 0
  for (const [key, entry] of state.entries) {
    if (entry.tags.some((t) => tags.includes(t))) {
      state.entries.delete(key)
      removed += 1
    }
  }
  return removed
}

export function invalidateKey(key: string): void {
  state.entries.delete(key)
}

export function cacheStats() {
  const total = state.hits + state.misses
  return {
    entries: state.entries.size,
    inflight: state.inflight.size,
    hits: state.hits,
    misses: state.misses,
    hitRate: total === 0 ? 0 : Math.round((state.hits / total) * 10_000) / 10_000,
  }
}

export function clearCache(): void {
  state.entries.clear()
  state.hits = 0
  state.misses = 0
}

/** Stable cache key from a params object — key order never affects the result. */
export function cacheKey(prefix: string, params: Record<string, unknown> = {}): string {
  const parts = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map((k) => `${k}=${String(params[k])}`)
  return parts.length === 0 ? prefix : `${prefix}?${parts.join('&')}`
}

/** Cache tags used across the app — referencing these avoids typo'd invalidation. */
export const CacheTag = {
  questions: 'questions',
  papers: 'papers',
  analytics: 'analytics',
  users: 'users',
  notifications: 'notifications',
} as const
