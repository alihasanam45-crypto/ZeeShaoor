/**
 * Structured logger.
 *
 * Emits one JSON object per line in production so log drains (Vercel, Datadog,
 * CloudWatch) can index the fields, and a compact human-readable line in dev.
 * Never log a raw request body — pass named fields and let `redact` strip the
 * ones that commonly carry secrets.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

function activeLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL as LogLevel | undefined
  if (configured && configured in LEVEL_RANK) return configured
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

/** Field names whose values are replaced with `[redacted]` at any nesting depth. */
const SENSITIVE_KEYS = new Set([
  'password', 'newpassword', 'currentpassword', 'token', 'accesstoken',
  'refreshtoken', 'secret', 'apikey', 'api_key', 'authorization', 'cookie',
  'sessiontoken', 'mongodb_uri', 'nextauth_secret', 'creditcard', 'cnic',
])

const MAX_DEPTH = 4
const MAX_STRING = 2_000

export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value
  if (depth >= MAX_DEPTH) return '[truncated]'

  if (typeof value === 'string') {
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…[+${value.length - MAX_STRING}]` : value
  }
  if (typeof value !== 'object') return value
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack }
  }
  if (Array.isArray(value)) {
    // Long arrays are almost always payload dumps — keep a representative head.
    const head = value.slice(0, 20).map((v) => redact(v, depth + 1))
    return value.length > 20 ? [...head, `…[+${value.length - 20} more]`] : head
  }

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[redacted]' : redact(val, depth + 1)
  }
  return out
}

export interface LogContext {
  requestId?: string
  userId?: string
  role?: string
  route?: string
  durationMs?: number
  [key: string]: unknown
}

function write(level: LogLevel, message: string, context: LogContext = {}): void {
  if (LEVEL_RANK[level] < LEVEL_RANK[activeLevel()]) return

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(redact(context) as Record<string, unknown>),
  }

  // `console.error` for warn/error so the runtime routes them to stderr and
  // error-tracking integrations pick them up.
  const sink = level === 'error' || level === 'warn' ? console.error : console.log

  if (process.env.NODE_ENV === 'production') {
    sink(JSON.stringify(entry))
    return
  }

  const { level: _l, time: _t, message: _m, ...rest } = entry
  const tail = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : ''
  sink(`[${level.toUpperCase()}] ${message}${tail}`)
}

export const logger = {
  debug: (message: string, context?: LogContext) => write('debug', message, context),
  info:  (message: string, context?: LogContext) => write('info',  message, context),
  warn:  (message: string, context?: LogContext) => write('warn',  message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),

  /** Returns a logger that stamps every entry with the same base context. */
  child(base: LogContext) {
    return {
      debug: (m: string, c?: LogContext) => write('debug', m, { ...base, ...c }),
      info:  (m: string, c?: LogContext) => write('info',  m, { ...base, ...c }),
      warn:  (m: string, c?: LogContext) => write('warn',  m, { ...base, ...c }),
      error: (m: string, c?: LogContext) => write('error', m, { ...base, ...c }),
    }
  },
}

export type ChildLogger = ReturnType<typeof logger.child>
