import crypto from 'crypto'
import { connectToDatabase } from '@/lib/db/mongodb'
import User from '@/models/User'
import Institution, {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from '@/models/Institution'

/**
 * Institution registration core — the ONE place that validates, sanitizes and
 * persists a self-service signup (Institution + its owner admin User).
 *
 * Both public entry points delegate here so the security rules can never
 * drift apart:
 * - src/actions/auth.ts        registerInstitution() — the /register form
 * - src/app/api/register/route.ts POST — multipart API clients
 *
 * This file must stay OUTSIDE any 'use server' module: everything exported
 * from a 'use server' file becomes a public POST endpoint, and these helpers
 * are internal.
 *
 * Security model:
 * - The owner is created as role 'admin' BUT status 'pending'; authorize()
 *   refuses pending accounts, so self-registration grants zero access until
 *   a platform admin flips both records to 'active'.
 * - Passwords hashed with bcrypt cost 12 via User.hashPassword() (the
 *   codebase-wide contract documented in src/models/User.ts).
 * - Every field is coerced to a trimmed, length-capped string; FormData File
 *   objects in text fields are rejected, not stringified.
 */

// --------- Input & result types ---------------------------------------------------------------------------------------------------------

export interface InstitutionRegistrationInput {
  ownerName: string
  institutionName: string
  branchAddress: string
  phone: string
  email: string
  password: string
  /** When provided (the /register form sends it) it must match `password`. */
  confirmPassword?: string
  /** Optional owner second factor — stored only as a bcrypt hash. */
  masterPassword?: string
  subscriptionPlan?: string
  logoPath?: string
  headerPath?: string
  /** Raw request context for the anti-piracy fingerprint. */
  fingerprintSeed?: { userAgent: string; ip: string }
}

export type InstitutionFieldErrors = Partial<
  Record<
    | 'ownerName'
    | 'institutionName'
    | 'branchAddress'
    | 'phone'
    | 'email'
    | 'password'
    | 'confirmPassword',
    string
  >
>

export type RegistrationResult =
  | { ok: true; institutionId: string; schoolId: string }
  | { ok: false; status: number; error: string; fieldErrors?: InstitutionFieldErrors }

// --------- Sanitizers -----------------------------------------------------------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Loose international format; matches PK mobiles like 03XX-XXXXXXX too.
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/

/** Coerce an untrusted value (JSON field or FormData entry) to a bounded string. */
export function asTrimmedString(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function normalizePlan(value: string): SubscriptionPlan {
  return (SUBSCRIPTION_PLANS as readonly string[]).includes(value)
    ? (value as SubscriptionPlan)
    : '6_MONTHS'
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: number }).code === 11000
  )
}

// --------- Validation --------------------------------------------------------------------------------------------------------------------------------

export function validateInstitutionInput(
  raw: InstitutionRegistrationInput,
): { data: InstitutionRegistrationInput; fieldErrors: InstitutionFieldErrors } {
  const data: InstitutionRegistrationInput = {
    ownerName: asTrimmedString(raw.ownerName, 80),
    institutionName: asTrimmedString(raw.institutionName, 120),
    branchAddress: asTrimmedString(raw.branchAddress, 200),
    phone: asTrimmedString(raw.phone, 20),
    email: asTrimmedString(raw.email, 254).toLowerCase(),
    // Passwords are never trimmed — leading/trailing spaces are legal.
    password: typeof raw.password === 'string' ? raw.password.slice(0, 128) : '',
    confirmPassword:
      typeof raw.confirmPassword === 'string' ? raw.confirmPassword.slice(0, 128) : undefined,
    masterPassword:
      typeof raw.masterPassword === 'string' && raw.masterPassword.length > 0
        ? raw.masterPassword.slice(0, 128)
        : undefined,
    subscriptionPlan: normalizePlan(asTrimmedString(raw.subscriptionPlan, 20)),
    logoPath: asTrimmedString(raw.logoPath, 300),
    headerPath: asTrimmedString(raw.headerPath, 300),
    fingerprintSeed: raw.fingerprintSeed,
  }

  const fieldErrors: InstitutionFieldErrors = {}
  if (data.ownerName.length < 2) fieldErrors.ownerName = 'Owner name is required (min 2 characters).'
  if (data.institutionName.length < 3)
    fieldErrors.institutionName = 'Institution name is required (min 3 characters).'
  if (data.branchAddress.length < 5)
    fieldErrors.branchAddress = 'Branch address is required (min 5 characters).'
  if (!PHONE_RE.test(data.phone)) fieldErrors.phone = 'Enter a valid phone number.'
  if (!EMAIL_RE.test(data.email)) fieldErrors.email = 'Enter a valid email address.'
  if (data.password.length < 8) fieldErrors.password = 'Password must be at least 8 characters.'
  if (data.confirmPassword !== undefined && data.confirmPassword !== data.password)
    fieldErrors.confirmPassword = 'Passwords do not match.'

  return { data, fieldErrors }
}

// --------- Registration flow ---------------------------------------------------------------------------------------------------------------

/** Find a slug not yet taken; suffix with random hex on collision. */
async function reserveSlug(institutionName: string): Promise<string> {
  const base = slugify(institutionName) || 'academy'
  let candidate = base
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await Institution.exists({ slug: candidate })
    if (!taken) return candidate
    candidate = `${base}-${crypto.randomBytes(2).toString('hex')}`
  }
  // Practically unreachable — 5 random collisions in a row.
  return `${base}-${crypto.randomBytes(4).toString('hex')}`
}

export async function registerInstitutionWithOwner(
  raw: InstitutionRegistrationInput,
): Promise<RegistrationResult> {
  const { data, fieldErrors } = validateInstitutionInput(raw)
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, status: 400, error: 'Please fix the highlighted fields.', fieldErrors }
  }

  await connectToDatabase()

  // Friendly pre-check; the unique index on User.email stays the source of
  // truth for races (E11000 handled below).
  const emailTaken = await User.exists({ email: data.email })
  if (emailTaken) {
    return {
      ok: false,
      status: 409,
      error: 'This email is already registered.',
      fieldErrors: { email: 'This email is already registered.' },
    }
  }

  const slug = await reserveSlug(data.institutionName)
  const passwordHash = await User.hashPassword(data.password)
  const masterPasswordHash = data.masterPassword
    ? await User.hashPassword(data.masterPassword)
    : undefined

  // Anti-piracy lock: bind the signup to the registering device/network.
  const hardwareFingerprint = data.fingerprintSeed
    ? crypto
        .createHash('sha256')
        .update(`${data.email}-${data.fingerprintSeed.userAgent}-${data.fingerprintSeed.ip}`)
        .digest('hex')
    : undefined

  // House idiom: `new Model()` + `.save()` — matches every other write path
  // (register routes, seed script) and keeps Mongoose v9 typings happy.
  const institution = new Institution({
    name: data.institutionName,
    slug,
    ownerName: data.ownerName,
    email: data.email,
    phone: data.phone,
    branchAddress: data.branchAddress,
    logoPath: data.logoPath,
    headerPath: data.headerPath,
    subscriptionPlan: data.subscriptionPlan,
    status: 'pending',
    masterPasswordHash,
    hardwareFingerprint,
  })
  await institution.save()

  try {
    const owner = new User({
      name: data.ownerName,
      email: data.email,
      password: passwordHash,
      role: 'admin',
      // Pending = cannot log in until a platform admin approves (authorize()
      // enforces this). Self-registration never grants live admin access.
      status: 'pending',
      schoolId: slug,
      institution: institution._id,
      phone: data.phone,
    })
    await owner.save()

    institution.owner = owner._id
    await institution.save()

    return { ok: true, institutionId: institution._id.toString(), schoolId: slug }
  } catch (err) {
    // Compensate: never leave an ownerless institution behind.
    await Institution.deleteOne({ _id: institution._id }).catch(() => {})
    if (isDuplicateKeyError(err)) {
      return {
        ok: false,
        status: 409,
        error: 'This email is already registered.',
        fieldErrors: { email: 'This email is already registered.' },
      }
    }
    throw err
  }
}
