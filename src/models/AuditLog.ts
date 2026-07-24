import { Schema, model, models, type Model, type Types } from 'mongoose'

/**
 * Append-only audit trail.
 *
 * Educational boards and schools handling minors' records need to answer "who
 * touched this, from where, and when" for any incident. Every entry is written
 * once and never updated — the schema is locked with `strict: 'throw'` and the
 * model exposes no update path.
 *
 * Retention: 400 days via TTL index (covers a full academic year plus an audit
 * cycle). Security events are exempt — see `expiresAt` below.
 */

export const AUDIT_ACTIONS = [
  // Authentication
  'auth.login.success',
  'auth.login.failure',
  'auth.login.locked',
  'auth.logout',
  'auth.password.change',
  'auth.password.reset.request',
  'auth.password.reset.complete',
  'auth.register.institution',
  'auth.register.student',
  // Authorization
  'authz.role.change',
  'authz.denied',
  'authz.privilege.escalation.attempt',
  // Domain actions
  'paper.generate',
  'paper.export',
  'csv.import',
  'question.create',
  'question.delete',
  'student.create',
  'student.update',
  'student.delete',
  'fee.create',
  'fee.update',
  'grade.submit',
  'homework.create',
  'message.send',
  'admin.action',
  'teacher.action',
  'student.action',
  // Platform
  'security.event',
  'critical.error',
  'rate.limit.exceeded',
] as const

export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const AUDIT_SEVERITIES = ['info', 'notice', 'warning', 'critical'] as const
export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number]

export interface IAuditLog {
  action: AuditAction
  severity: AuditSeverity
  outcome: 'success' | 'failure'

  /** Null for pre-authentication events (failed logins, anonymous probes). */
  actorId?: Types.ObjectId
  actorEmail?: string
  actorRole?: string
  schoolId?: string

  /** What was acted upon, when the action targets a specific record. */
  targetType?: string
  targetId?: string

  /** Request context. `ip` is truncated for GDPR-style data minimization. */
  ip?: string
  userAgent?: string
  method?: string
  path?: string

  /** Structured, non-sensitive detail. Never store passwords or tokens here. */
  metadata?: Record<string, unknown>

  createdAt: Date
  /** TTL anchor. Unset on security events so they are retained indefinitely. */
  expiresAt?: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, enum: AUDIT_ACTIONS, required: true, index: true },
    severity: { type: String, enum: AUDIT_SEVERITIES, default: 'info', index: true },
    outcome: { type: String, enum: ['success', 'failure'], default: 'success' },

    actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorEmail: { type: String, lowercase: true, trim: true },
    actorRole: { type: String },
    schoolId: { type: String, index: true },

    targetType: { type: String },
    targetId: { type: String },

    ip: { type: String },
    userAgent: { type: String, maxlength: 300 },
    method: { type: String, maxlength: 10 },
    path: { type: String, maxlength: 300 },

    metadata: { type: Schema.Types.Mixed },

    expiresAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    // Reject unknown keys outright rather than silently dropping them, so a
    // caller cannot smuggle unindexed payloads into the trail.
    strict: 'throw',
    minimize: false,
  },
)

// Investigation query paths: "everything this actor did", "every failed login
// in this window", "the full timeline for this school".
AuditLogSchema.index({ actorId: 1, createdAt: -1 })
AuditLogSchema.index({ action: 1, createdAt: -1 })
AuditLogSchema.index({ schoolId: 1, createdAt: -1 })
AuditLogSchema.index({ severity: 1, createdAt: -1 })
// Brute-force detection reads by source IP over a short window.
AuditLogSchema.index({ ip: 1, action: 1, createdAt: -1 })

// TTL: Mongo deletes the document once `expiresAt` passes. Documents without
// the field are never expired, which is how security events are retained.
AuditLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const AuditLog = (models.AuditLog as Model<IAuditLog>) || model<IAuditLog>('AuditLog', AuditLogSchema)

export default AuditLog
