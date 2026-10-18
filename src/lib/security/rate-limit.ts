/**
 * Rate limiting and brute-force lockout.
 *
 * Storage is an in-process sliding-window counter. That is sound for a single
 * Node server (the current deployment shape) and degrades to per-instance
 * limits behind a horizontal autoscaler — see `RATE_LIMIT_BACKEND` below for
 * the migration path. It is deliberately dependency-free so it cannot be the
 * reason a security control is skipped.
 *
 * Two distinct mechanisms live here:
 * - `rateLimit()`  — request throttling, keyed by IP or user.
 * - `loginThrottle` — credential-stuffing defence, keyed by account AND source,
 *   with exponential backoff so a distributed attack against one account is
 *   slowed even when each source IP looks innocent.
 */

interface Window {
  hits: number[]
  blockedUntil?: number
}

const store = new Map<string, Window>()

/**
 * Bound memory: an attacker rotating keys must not grow the map without limit.
 * When the ceiling is hit we evict the least recently useful entries.
 */
const MAX_KEYS = 50_000
let lastSweep = Date.now()

function sweep(now: number): void {
  // Amortized cleanup — at most once every 60s, and always when oversized.
  if (now - lastSweep < 60_000 && store.size < MAX_KEYS) return
  lastSweep = now

  for (const [key, win] of store) {
    const live = win.hits.some((t) => now - t < 3_600_000)
    const blocked = win.blockedUntil !== undefined && win.blockedUntil > now
    if (!live && !blocked) store.delete(key)
  }

  // Still oversized after sweeping: drop oldest insertions (Map preserves order).
  if (store.size > MAX_KEYS) {
    const excess = store.size - MAX_KEYS
    let dropped = 0
    for (const key of store.keys()) {
      store.delete(key)
      if (++dropped >= excess) break
    }
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** Seconds until the caller may retry. 0 when allowed. */
  retryAfter: number
}

export interface RateLimitOptions {
  /** Unique bucket name, e.g. 'login' or 'api:generator'. */
  name: string
  /** Caller identity — IP, user id, or a composite. */
  key: string
  limit: number
  windowMs: number
  /** Fixed penalty applied once the limit trips. Defaults to the window. */
  blockMs?: number
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const { name, key, limit, windowMs } = options
  const now = Date.now()
  sweep(now)

  const bucket = `${name}:${key}`
  const win = store.get(bucket) ?? { hits: [] }

  if (win.blockedUntil && win.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((win.blockedUntil - now) / 1000),
    }
  }

  win.hits = win.hits.filter((t) => now - t < windowMs)

  if (win.hits.length >= limit) {
    win.blockedUntil = now + (options.blockMs ?? windowMs)
    store.set(bucket, win)
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((win.blockedUntil - now) / 1000),
    }
  }

  win.hits.push(now)
  store.set(bucket, win)

  return { allowed: true, remaining: limit - win.hits.length, retryAfter: 0 }
}

// --------- Preset budgets ---------------------------------------------------

/**
 * Per-surface budgets. Tuned so a classroom of 40 students behind one school
 * NAT does not trip the generic API limit, while abuse is still contained.
 */
export const RATE_LIMITS = {
  /** Credential submission — deliberately tight. */
  login: { limit: 8, windowMs: 15 * 60_000, blockMs: 15 * 60_000 },
  /** Account creation — throttled to stop automated signup floods. */
  register: { limit: 5, windowMs: 60 * 60_000, blockMs: 30 * 60_000 },
  /** Password reset requests — prevents mail-bombing a victim. */
  passwordReset: { limit: 5, windowMs: 60 * 60_000, blockMs: 30 * 60_000 },
  /** Expensive compute: PDF render, paper generation, bulk import. */
  expensive: { limit: 20, windowMs: 60_000, blockMs: 60_000 },
  /** Bulk writes — CSV import and batch question upload. */
  bulkWrite: { limit: 10, windowMs: 10 * 60_000, blockMs: 10 * 60_000 },
  /** Ordinary authenticated reads/writes. */
  standard: { limit: 300, windowMs: 60_000, blockMs: 60_000 },
  /** Anything reachable without a session. */
  anonymous: { limit: 60, windowMs: 60_000, blockMs: 5 * 60_000 },
} as const

export type RateLimitPreset = keyof typeof RATE_LIMITS

export function checkRateLimit(preset: RateLimitPreset, key: string): RateLimitResult {
  const config = RATE_LIMITS[preset]
  return rateLimit({ name: preset, key, ...config })
}

// --------- Login throttle (brute force / credential stuffing) ---------------

interface FailureRecord {
  count: number
  firstFailureAt: number
  lockedUntil?: number
}

const failures = new Map<string, FailureRecord>()

const LOCKOUT_THRESHOLD = 5
const FAILURE_WINDOW_MS = 15 * 60_000
const MAX_LOCKOUT_MS = 60 * 60_000

/** Exponential backoff: 1m, 2m, 4m, 8m … capped at one hour. */
function lockoutDuration(failureCount: number): number {
  const overage = Math.max(0, failureCount - LOCKOUT_THRESHOLD)
  return Math.min(60_000 * 2 ** overage, MAX_LOCKOUT_MS)
}

export const loginThrottle = {
  /**
   * Called before verifying credentials. Returns the lockout state for this
   * account identifier so the caller can refuse without touching the database
   * — which also removes the timing signal a locked account would otherwise
   * leak.
   */
  check(identifier: string): { locked: boolean; retryAfter: number } {
    const record = failures.get(identifier)
    if (!record?.lockedUntil) return { locked: false, retryAfter: 0 }

    const now = Date.now()
    if (record.lockedUntil <= now) {
      failures.delete(identifier)
      return { locked: false, retryAfter: 0 }
    }
    return { locked: true, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) }
  },

  /** Record a failed attempt; locks the identifier once the threshold trips. */
  recordFailure(identifier: string): { locked: boolean; failureCount: number } {
    const now = Date.now()
    const existing = failures.get(identifier)

    const record: FailureRecord =
      existing && now - existing.firstFailureAt < FAILURE_WINDOW_MS
        ? existing
        : { count: 0, firstFailureAt: now }

    record.count += 1

    if (record.count >= LOCKOUT_THRESHOLD) {
      record.lockedUntil = now + lockoutDuration(record.count)
    }

    failures.set(identifier, record)

    if (failures.size > MAX_KEYS) {
      for (const [key, value] of failures) {
        if (!value.lockedUntil || value.lockedUntil < now) failures.delete(key)
        if (failures.size <= MAX_KEYS) break
      }
    }

    return { locked: Boolean(record.lockedUntil), failureCount: record.count }
  },

  /** Clear on successful authentication. */
  reset(identifier: string): void {
    failures.delete(identifier)
  },
}

/**
 * Horizontal-scale note: swapping the two Maps above for Redis (or Atlas with
 * a TTL collection) is the only change needed to make these limits global.
 * The exported surface — `checkRateLimit` and `loginThrottle` — is designed to
 * stay identical, so no call site changes.
 */
export const RATE_LIMIT_BACKEND = 'in-process' as const
