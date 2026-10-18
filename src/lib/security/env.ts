/**
 * Boot-time environment validation.
 *
 * A weak or missing NEXTAUTH_SECRET means every session JWT in the system is
 * forgeable — an attacker who guesses it mints an `{ role: 'admin' }` token at
 * will. That must fail loudly at startup, not silently at runtime, so this
 * module throws rather than warns when running in production.
 *
 * Imported for side effects by src/lib/auth/options.ts, which every
 * authenticated path already loads.
 */

const MIN_SECRET_LENGTH = 32

/** Secrets shipped in the repo's own examples/history. Never allowed. */
const KNOWN_LEAKED_SECRETS = new Set([
  'zee_shaoor_super_secret_key_2026_elite',
  'secret',
  'changeme',
  'development',
])

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/** Low-entropy check: a long string of one repeated pattern is still weak. */
function hasWeakEntropy(secret: string): boolean {
  return new Set(secret).size < 12
}

export interface EnvIssue {
  variable: string
  message: string
  fatal: boolean
}

export function inspectEnvironment(): EnvIssue[] {
  const issues: EnvIssue[] = []
  const prod = isProduction()

  // --------- NEXTAUTH_SECRET ------------------------------------------------
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    issues.push({
      variable: 'NEXTAUTH_SECRET',
      message: 'Not set. Generate one with `openssl rand -base64 48`.',
      fatal: prod,
    })
  } else {
    if (secret.length < MIN_SECRET_LENGTH) {
      issues.push({
        variable: 'NEXTAUTH_SECRET',
        message: `Too short (${secret.length} chars, minimum ${MIN_SECRET_LENGTH}).`,
        fatal: prod,
      })
    }
    if (KNOWN_LEAKED_SECRETS.has(secret)) {
      issues.push({
        variable: 'NEXTAUTH_SECRET',
        message:
          'Matches a secret committed to this repository. It is public — rotate it immediately.',
        fatal: prod,
      })
    }
    if (hasWeakEntropy(secret)) {
      issues.push({
        variable: 'NEXTAUTH_SECRET',
        message: 'Low entropy. Use random bytes, not a memorable phrase.',
        fatal: prod,
      })
    }
  }

  // --------- MONGODB_URI ----------------------------------------------------
  const uri = process.env.MONGODB_URI
  if (!uri) {
    issues.push({ variable: 'MONGODB_URI', message: 'Not set.', fatal: prod })
  } else if (prod && /:\/\/[^:]+:(admin|password|123456|0786A5m4)@/i.test(uri)) {
    issues.push({
      variable: 'MONGODB_URI',
      message: 'Contains a default or previously-leaked database password.',
      fatal: true,
    })
  }

  // --------- NEXTAUTH_URL ---------------------------------------------------
  const url = process.env.NEXTAUTH_URL
  if (prod) {
    if (!url) {
      issues.push({ variable: 'NEXTAUTH_URL', message: 'Not set.', fatal: true })
    } else if (url.startsWith('http://')) {
      issues.push({
        variable: 'NEXTAUTH_URL',
        message: 'Must be https:// in production — session cookies are Secure-only.',
        fatal: true,
      })
    }
  }

  // --------- Accidental client exposure -------------------------------------
  // Anything NEXT_PUBLIC_* is inlined into the browser bundle.
  for (const key of Object.keys(process.env)) {
    if (!key.startsWith('NEXT_PUBLIC_')) continue
    if (/SECRET|PASSWORD|TOKEN|_KEY$|APIKEY|CREDENTIAL/i.test(key)) {
      issues.push({
        variable: key,
        message: 'A NEXT_PUBLIC_ variable holding a credential is shipped to every browser.',
        fatal: prod,
      })
    }
  }

  return issues
}

let validated = false

/** Idempotent — safe to call from any module-level import. */
export function assertSecureEnvironment(): void {
  if (validated) return
  validated = true

  const issues = inspectEnvironment()
  if (issues.length === 0) return

  const fatal = issues.filter((i) => i.fatal)
  const render = (i: EnvIssue) => `  - ${i.variable}: ${i.message}`

  if (fatal.length > 0) {
    throw new Error(
      `Refusing to start — insecure environment configuration:\n${fatal.map(render).join('\n')}`,
    )
  }

  console.warn(
    `[security] Environment warnings (fatal in production):\n${issues.map(render).join('\n')}`,
  )
}
