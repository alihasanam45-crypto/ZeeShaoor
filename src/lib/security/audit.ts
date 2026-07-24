/**
 * Audit trail writer.
 *
 * Design constraints:
 * - Auditing must never break the request it is recording. Every write is
 *   fire-and-forget with a swallowed rejection; a failed log is reported to
 *   stderr, not to the user.
 * - Requests carry the context (ip, ua, path) implicitly via `next/headers`,
 *   so callers pass domain facts only.
 * - Security-relevant entries opt out of TTL expiry.
 */

import { headers } from 'next/headers'
import { connectToDatabase } from '@/lib/db/mongodb'
import AuditLog, { type AuditAction, type AuditSeverity } from '@/models/AuditLog'
import type { ZeeTokenPayload } from '@/types/auth'

/** Entries kept forever — anything an investigator would need after an incident. */
const NON_EXPIRING: ReadonlySet<AuditAction> = new Set<AuditAction>([
  'auth.login.failure',
  'auth.login.locked',
  'auth.password.change',
  'auth.password.reset.complete',
  'authz.role.change',
  'authz.privilege.escalation.attempt',
  'security.event',
])

const RETENTION_DAYS = 400

export interface AuditInput {
  action: AuditAction
  severity?: AuditSeverity
  outcome?: 'success' | 'failure'
  actor?: Pick<ZeeTokenPayload, 'id' | 'role' | 'email'> | null
  actorEmail?: string
  schoolId?: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}

/**
 * Truncate an IP to its network prefix.
 *
 * Enough to correlate an attack source and drive rate limiting, without
 * retaining a precise identifier for every minor using the platform.
 */
export function anonymizeIp(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined
  const ip = raw.split(',')[0]!.trim()
  if (!ip) return undefined

  if (ip.includes(':')) {
    // IPv6 → first 3 hextets (/48).
    return `${ip.split(':').slice(0, 3).join(':')}::/48`
  }
  const octets = ip.split('.')
  if (octets.length === 4) return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`
  return undefined
}

/** Best-effort client IP from the proxy chain. */
export async function clientIp(): Promise<string | undefined> {
  try {
    const h = await headers()
    return (
      h.get('x-forwarded-for') ??
      h.get('x-real-ip') ??
      h.get('cf-connecting-ip') ??
      undefined
    )
  } catch {
    return undefined
  }
}

async function requestContext() {
  try {
    const h = await headers()
    return {
      ip: anonymizeIp(h.get('x-forwarded-for') ?? h.get('x-real-ip')),
      userAgent: h.get('user-agent')?.slice(0, 300),
      path: h.get('x-invoked-path')?.slice(0, 300),
    }
  } catch {
    // Outside a request scope (scripts, cron) — context is simply absent.
    return {}
  }
}

/**
 * Record an audit entry. Never throws, never blocks the caller's happy path.
 *
 * Not awaited by design at most call sites; awaiting is fine when the caller
 * needs write ordering (e.g. before a redirect that ends the request).
 */
export async function audit(input: AuditInput): Promise<void> {
  try {
    const ctx = await requestContext()
    await connectToDatabase()

    const expiresAt = NON_EXPIRING.has(input.action)
      ? undefined
      : new Date(Date.now() + RETENTION_DAYS * 86_400_000)

    await AuditLog.create({
      action: input.action,
      severity: input.severity ?? 'info',
      outcome: input.outcome ?? 'success',
      actorId: input.actor?.id,
      actorEmail: input.actorEmail ?? input.actor?.email,
      actorRole: input.actor?.role,
      schoolId: input.schoolId,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
      expiresAt,
      ...ctx,
    })
  } catch (err) {
    // A broken audit sink must not take down the application, but it is itself
    // a security-relevant condition — make it loud in the logs.
    console.error('[audit] write failed', {
      action: input.action,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

/** Convenience wrappers so call sites read as intent, not plumbing. */

export function auditSecurity(
  metadata: Record<string, unknown>,
  severity: AuditSeverity = 'warning',
): void {
  void audit({ action: 'security.event', severity, outcome: 'failure', metadata })
}

export function auditDenied(
  actor: AuditInput['actor'],
  metadata: Record<string, unknown>,
): void {
  void audit({
    action: 'authz.denied',
    severity: 'warning',
    outcome: 'failure',
    actor,
    metadata,
  })
}

export function auditEscalationAttempt(
  actor: AuditInput['actor'],
  metadata: Record<string, unknown>,
): void {
  void audit({
    action: 'authz.privilege.escalation.attempt',
    severity: 'critical',
    outcome: 'failure',
    actor,
    metadata,
  })
}
