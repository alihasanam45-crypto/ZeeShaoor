/**
 * Untrusted-input coercion for every query and write path.
 *
 * MongoDB's query language is data, so any attacker-controlled *object* that
 * reaches a filter becomes an operator. `{ email: { $ne: null } }` matches the
 * first user in the collection; `{ code: { $gt: '' } }` burns an arbitrary
 * system ID. JSON bodies are the vector — `URLSearchParams` values are always
 * strings, but `await req.json()` yields whatever the client sent.
 *
 * The rule enforced here: values entering a filter are scalars, and any key
 * beginning with `$` or containing `.` is dropped before it can reach the
 * driver.
 */

// --------- Scalar coercion --------------------------------------------------

/** Coerce an untrusted value to a bounded, trimmed string. Objects → ''. */
export function toStr(value: unknown, maxLength = 200): string {
  if (typeof value === 'string') return value.trim().slice(0, maxLength)
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'boolean') return String(value)
  return ''
}

/** Coerce to a finite number inside [min, max], or `fallback` when unusable. */
export function toNum(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

export function toBool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

/** Coerce to a valid Date, or undefined. Rejects nonsense far outside range. */
export function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  const year = d.getUTCFullYear()
  return year >= 1900 && year <= 2200 ? d : undefined
}

/** Return `value` only when it is one of `allowed`; otherwise `fallback`. */
export function toEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const s = toStr(value, 64)
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback
}

/** Like toEnum but yields undefined instead of a default — for optional filters. */
export function toEnumOptional<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  const s = toStr(value, 64)
  return (allowed as readonly string[]).includes(s) ? (s as T) : undefined
}

/** Bounded array of sanitized strings — caps both length and element size. */
export function toStrArray(value: unknown, maxItems = 50, maxLength = 200): string[] {
  if (!Array.isArray(value)) return []
  return value
    .slice(0, maxItems)
    .map((v) => toStr(v, maxLength))
    .filter((v) => v.length > 0)
}

// --------- Identifiers ------------------------------------------------------

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i

/**
 * Validate a Mongo ObjectId hex string. Anything else — including
 * `{ $ne: null }` — returns null, so callers can 400 instead of querying.
 */
export function toObjectId(value: unknown): string | null {
  const s = toStr(value, 24)
  return OBJECT_ID_RE.test(s) ? s : null
}

export function isObjectId(value: unknown): boolean {
  return toObjectId(value) !== null
}

// --------- Regex ------------------------------------------------------------

/**
 * Escape every regex metacharacter so user text is matched literally.
 *
 * Without this, a `search` parameter is both an injection vector and a ReDoS
 * vector: `(a+)+$` against a large collection pins a CPU core.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Build a safe case-insensitive "contains" filter fragment.
 * Returns undefined for empty input so callers can omit the key entirely.
 */
export function safeContains(value: unknown, maxLength = 100) {
  const s = toStr(value, maxLength)
  if (!s) return undefined
  return { $regex: escapeRegex(s), $options: 'i' }
}

/** Safe "starts with" filter fragment — used for `YYYY-MM` date prefixes. */
export function safeStartsWith(value: unknown, maxLength = 100) {
  const s = toStr(value, maxLength)
  if (!s) return undefined
  return { $regex: `^${escapeRegex(s)}`, $options: 'i' }
}

// --------- Deep operator stripping -----------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Recursively remove Mongo operator keys (`$…`) and dotted paths (`a.b`) from
 * an untrusted structure.
 *
 * Use as the outer wrapper on any object that will be handed to Mongoose after
 * field-level validation. It is a backstop, not a substitute for the explicit
 * allowlists in `pick()`.
 */
export function stripOperators<T>(input: T, depth = 0): T {
  if (depth > 8) return undefined as unknown as T

  if (Array.isArray(input)) {
    return input.slice(0, 500).map((v) => stripOperators(v, depth + 1)) as unknown as T
  }

  if (isPlainObject(input)) {
    const clean: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      if (key.startsWith('$') || key.includes('.') || key === '__proto__') continue
      clean[key] = stripOperators(value, depth + 1)
    }
    return clean as unknown as T
  }

  return input
}

/**
 * True when an untrusted value would smuggle an operator into a query.
 * Callers use this to reject outright rather than silently coerce.
 */
export function containsOperator(input: unknown, depth = 0): boolean {
  if (depth > 8) return true
  if (Array.isArray(input)) return input.some((v) => containsOperator(v, depth + 1))
  if (isPlainObject(input)) {
    return Object.entries(input).some(
      ([k, v]) => k.startsWith('$') || k.includes('.') || containsOperator(v, depth + 1),
    )
  }
  return false
}

// --------- Mass-assignment defence -----------------------------------------

/**
 * Allowlist projection — the only sanctioned way to turn a request body into a
 * document. Spreading `...body` into `Model.create()` lets a caller set
 * `role`, `status`, `isPremium`, `schoolId`, `_id` or any other field the
 * schema happens to define.
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  source: unknown,
  keys: readonly K[],
): Partial<Pick<T, K>> {
  if (!isPlainObject(source)) return {}
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    const k = String(key)
    if (!Object.prototype.hasOwnProperty.call(source, k)) continue
    const value = source[k]
    if (value === undefined) continue
    out[k] = stripOperators(value)
  }
  return out as Partial<Pick<T, K>>
}

// --------- Output sanitization ---------------------------------------------

/**
 * Neutralize HTML-significant characters in stored free text.
 *
 * React escapes interpolated text automatically, so this is not the primary
 * XSS control — it protects the non-React consumers (PDF/HTML export, CSV
 * download, email templates) that concatenate strings directly.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Neutralize spreadsheet formula injection in CSV exports. A cell beginning
 * `=`, `+`, `-`, `@` or a control character executes on open in Excel/Sheets.
 */
export function csvCell(value: unknown): string {
  const s = toStr(value, 2000).replace(/[\r\n\t]/g, ' ')
  const escaped = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${escaped.replace(/"/g, '""')}"`
}

// --------- Pagination -------------------------------------------------------

export interface Pagination {
  page: number
  limit: number
  skip: number
}

/**
 * Bounded pagination. An unbounded `limit` is a denial-of-service lever: one
 * request for `?limit=1000000` can exhaust the process heap.
 */
export function toPagination(params: URLSearchParams, maxLimit = 100): Pagination {
  const page = toNum(params.get('page'), 1, 1, 10_000)
  const limit = toNum(params.get('limit'), 25, 1, maxLimit)
  return { page, limit, skip: (page - 1) * limit }
}
