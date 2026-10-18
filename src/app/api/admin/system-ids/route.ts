import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SystemId from '@/models/SystemId'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { toNum, toPagination, toStr } from '@/lib/security/sanitize'

/**
 * Enrollment code issuance — admin only.
 *
 * Codes are the credential that lets someone claim a seat at an institution,
 * so three properties matter:
 *
 * 1. Only admins may mint or list them. This route previously had no
 *    authorization whatsoever.
 * 2. Codes must be unguessable. The old scheme was a zero-padded counter
 *    (`ZSH-0001`, `ZSH-0002`, …) — anyone could enumerate the entire valid
 *    keyspace by counting. Codes are now 80 bits of CSPRNG output.
 * 3. Issuance must be bounded. `count` was passed straight into a loop, so
 *    `{"count": 1e9}` was a trivial denial-of-service and disk-fill.
 */

const MAX_BATCH = 200

/** Crockford-style alphabet: no I/L/O/U, so codes are unambiguous to read aloud. */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/** ZSH-XXXXX-XXXXX — 80 bits of entropy from a CSPRNG. */
function generateCode(): string {
  const bytes = crypto.randomBytes(10)
  let out = ''
  for (let i = 0; i < 10; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length]
  }
  return `ZSH-${out.slice(0, 5)}-${out.slice(5)}`
}

export async function GET(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/system-ids' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 200)

    const filter: Record<string, unknown> = {}
    const used = toStr(searchParams.get('used'), 10)
    if (used === 'true') filter.isUsed = true
    if (used === 'false') filter.isUsed = false

    const [ids, total] = await Promise.all([
      SystemId.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SystemId.countDocuments(filter),
    ])

    return apiSuccess({
      ids,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/system-ids')
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, {
    action: 'POST /api/admin/system-ids',
    rateLimit: 'bulkWrite',
  })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    const count = toNum((body as { count?: unknown })?.count, 1, 1, MAX_BATCH)

    await connectDB()

    // Generate up front, then insert as one batch. `ordered: false` means a
    // collision on the unique index skips that document instead of aborting
    // the batch; collisions are astronomically unlikely at 80 bits but the
    // index remains the source of truth.
    const docs = Array.from({ length: count }, () => ({ code: generateCode() }))
    const created = await SystemId.insertMany(docs, { ordered: false })

    void audit({
      action: 'admin.action',
      severity: 'notice',
      actor: guard.user,
      targetType: 'SystemId',
      metadata: { operation: 'issue', requested: count, issued: created.length },
    })

    return apiSuccess({ ids: created, issued: created.length }, { status: 201 })
  } catch (err) {
    return handleApiError(err, 'POST /api/admin/system-ids')
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'DELETE /api/admin/system-ids' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    // Coerced to a string before it reaches the query. As a raw JSON value,
    // `{"code": {"$ne": null}}` would have deleted an arbitrary unused code.
    const code = toStr((body as { code?: unknown })?.code, 40)
    if (!code) return apiError('VALIDATION_FAILED', { message: 'A code is required.' })

    await connectDB()
    // Guard on isUsed so a redeemed code can never be silently revoked.
    const result = await SystemId.deleteOne({ code, isUsed: false })

    if (result.deletedCount === 0) {
      return apiError('NOT_FOUND', { message: 'No unused code matches that value.' })
    }

    void audit({
      action: 'admin.action',
      severity: 'notice',
      actor: guard.user,
      targetType: 'SystemId',
      metadata: { operation: 'revoke', code },
    })

    return apiSuccess({ deleted: true })
  } catch (err) {
    return handleApiError(err, 'DELETE /api/admin/system-ids')
  }
}
