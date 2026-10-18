/**
 * Authorization boundary for API route handlers and server actions.
 *
 * Non-negotiables encoded here:
 *
 * 1. Identity comes from the signed session cookie via `getServerSession`,
 *    never from a request header. Headers set by the proxy are a convenience
 *    for logging; an attacker can send `x-user-role: admin` directly to the
 *    Node server and the proxy does not strip what it does not know about.
 *
 * 2. Proxy checks are an outer gate, not the gate. Per the Next.js docs, a
 *    matcher change or moving a Server Function to another route silently
 *    removes proxy coverage — so every handler re-authorizes independently.
 *
 * 3. Role membership is not enough. A teacher holding the `teacher` role is
 *    still not entitled to *another* teacher's class data, and a student is
 *    never entitled to a record they do not own. `assertOwnership` and
 *    `assertTeacherSubject` cover the object level.
 */

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/options'
import { apiError } from '@/lib/security/errors'
import { checkRateLimit, type RateLimitPreset } from '@/lib/security/rate-limit'
import { auditDenied, auditEscalationAttempt, clientIp } from '@/lib/security/audit'
import type { UserRole, ZeeTokenPayload } from '@/types/auth'

export type { UserRole, ZeeTokenPayload }

/** Roles that may reach the administrative surface. Teachers are NOT included. */
export const ADMIN_ONLY: readonly UserRole[] = ['admin']
/** Staff surfaces both teachers and admins legitimately share. */
export const STAFF: readonly UserRole[] = ['admin', 'teacher']
export const ANY_ROLE: readonly UserRole[] = ['admin', 'teacher', 'student']

export interface GuardContext {
  user: ZeeTokenPayload
}

export interface GuardOptions {
  /** Throttle bucket. Defaults to 'standard'. */
  rateLimit?: RateLimitPreset | false
  /** Label used in audit entries, e.g. 'GET /api/admin/students'. */
  action?: string
}

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}

/**
 * Primary route-handler guard.
 *
 * Returns either `{ user }` or a ready-to-return NextResponse. Callers must
 * check with `instanceof NextResponse` before using the result — the shape is
 * intentionally awkward so a missing check is a type error, not a silent
 * bypass.
 */
export async function requireApiRole(
  allowedRoles: readonly UserRole[],
  options: GuardOptions = {},
): Promise<GuardContext | NextResponse> {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user?.id || !user.role) {
    return apiError('UNAUTHORIZED')
  }

  // Throttle per authenticated identity — a compromised account cannot use
  // its session to hammer an endpoint.
  if (options.rateLimit !== false) {
    const verdict = checkRateLimit(options.rateLimit ?? 'standard', `user:${user.id}`)
    if (!verdict.allowed) {
      void auditDenied(user, {
        reason: 'rate_limited',
        action: options.action,
        retryAfter: verdict.retryAfter,
      })
      return apiError('RATE_LIMITED', {
        headers: { 'Retry-After': String(verdict.retryAfter) },
      })
    }
  }

  if (!allowedRoles.includes(user.role)) {
    // A student or teacher reaching for an admin-only surface is not a
    // mistake worth a quiet 403 — record it as an escalation attempt.
    if (allowedRoles.length === 1 && allowedRoles[0] === 'admin') {
      auditEscalationAttempt(user, { action: options.action, attemptedRole: 'admin' })
    } else {
      auditDenied(user, { action: options.action, required: allowedRoles })
    }
    return apiError('FORBIDDEN')
  }

  return { user }
}

/**
 * Server-action guard. Throws sentinel errors that `handleApiError` maps to
 * the same status codes the route guard returns, so both layers behave
 * identically.
 *
 * Every export of a `'use server'` module is a public POST endpoint. Any
 * action that reads or writes data must call this first.
 */
export async function requireActionRole(
  ...allowedRoles: readonly UserRole[]
): Promise<ZeeTokenPayload> {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user?.id || !user.role) throw new Error('UNAUTHORIZED')

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    auditDenied(user, { surface: 'server-action', required: allowedRoles })
    throw new Error(`FORBIDDEN: requires ${allowedRoles.join(' | ')}`)
  }

  return user
}

/** Authenticated-only variant for actions any signed-in role may call. */
export async function requireActionSession(): Promise<ZeeTokenPayload> {
  return requireActionRole()
}

// --------- Object-level authorization --------------------------------------

/**
 * Enforce that a non-admin only reaches their own records.
 *
 * Admins pass (that is the point of the role); everyone else must match the
 * owner id exactly. Throws so it can be used from actions and routes alike.
 */
export function assertOwnership(
  user: ZeeTokenPayload,
  ownerId: string | undefined | null,
  context: string,
): void {
  if (user.role === 'admin') return
  if (ownerId && String(ownerId) === String(user.id)) return

  auditEscalationAttempt(user, {
    reason: 'ownership_violation',
    context,
    attemptedOwner: ownerId ?? null,
  })
  throw new Error('FORBIDDEN: not the owner of this resource')
}

/**
 * Scope a query to the caller.
 *
 * Returns a filter fragment to merge into every read: admins get `{}`, and
 * every other role gets pinned to their own id. This is the difference
 * between "students can read their results" and "students can read *all*
 * results by changing an id in the URL".
 */
export function ownerScope(
  user: ZeeTokenPayload,
  field = 'userId',
): Record<string, unknown> {
  if (user.role === 'admin') return {}
  return { [field]: user.id }
}

/** Teacher permission strings are "teacher:<subject>:<classId>". */
function teacherGrants(user: ZeeTokenPayload): { subjects: Set<string>; classes: Set<string> } {
  const subjects = new Set<string>()
  const classes = new Set<string>()

  if (user.role !== 'teacher') return { subjects, classes }

  for (const grant of user.permissions ?? []) {
    const [, subject, classId] = grant.split(':')
    if (subject) subjects.add(subject.toLowerCase())
    if (classId) classes.add(classId.toLowerCase())
  }
  return { subjects, classes }
}

/**
 * Confine a teacher to the subjects they are actually assigned.
 *
 * A teacher with zero grants is refused rather than allowed — the previous
 * implementation treated an empty permission list as "no restriction", which
 * inverted the intent.
 */
export function assertTeacherSubject(user: ZeeTokenPayload, subject: string): void {
  if (user.role === 'admin') return
  if (user.role !== 'teacher') {
    throw new Error('FORBIDDEN: staff role required')
  }

  const { subjects } = teacherGrants(user)
  if (subjects.size === 0) {
    throw new Error('FORBIDDEN: no teaching assignments on this account')
  }
  if (!subjects.has(subject.toLowerCase())) {
    auditDenied(user, { reason: 'subject_not_assigned', subject })
    throw new Error('FORBIDDEN: subject not assigned to this teacher')
  }
}

/** Confine a teacher to their assigned classes. */
export function assertTeacherClass(user: ZeeTokenPayload, classId: string): void {
  if (user.role === 'admin') return
  if (user.role !== 'teacher') throw new Error('FORBIDDEN: staff role required')

  const { classes } = teacherGrants(user)
  if (classes.size === 0) throw new Error('FORBIDDEN: no class assignments on this account')
  if (!classes.has(classId.toLowerCase())) {
    auditDenied(user, { reason: 'class_not_assigned', classId })
    throw new Error('FORBIDDEN: class not assigned to this teacher')
  }
}

/** Confine a student to their own enrolled class. */
export function assertStudentClass(user: ZeeTokenPayload, classId: string): void {
  if (user.role !== 'student') return
  if (user.classId && user.classId.toLowerCase() === classId.toLowerCase()) return

  auditEscalationAttempt(user, { reason: 'class_not_enrolled', classId })
  throw new Error('FORBIDDEN: not enrolled in this class')
}

// --------- Unauthenticated surfaces ----------------------------------------

/**
 * Throttle for endpoints that are intentionally public (login, registration).
 * Keyed by source IP since there is no identity yet.
 */
export async function guardPublicEndpoint(
  preset: RateLimitPreset,
): Promise<NextResponse | null> {
  const ip = (await clientIp()) ?? 'unknown';
  const verdict = checkRateLimit(preset, `ip:${ip}`)

  if (!verdict.allowed) {
    return apiError('RATE_LIMITED', {
      headers: { 'Retry-After': String(verdict.retryAfter) },
    })
  }
  return null
}

export { isNextResponse }
