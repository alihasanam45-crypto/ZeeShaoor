import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { toEnumOptional, toPagination, toStr, toStrArray } from '@/lib/security/sanitize'

/**
 * Complaint triage — admin only.
 *
 * Complaints name individual teachers and staff and carry safety reports, so
 * exposure here is both a privacy breach and a whistleblower-safety issue.
 * The surface previously had no authorization and, via the proxy's teacher
 * allowance on /api/admin/*, was readable by the very staff being reported on.
 *
 * NOTE: this is the triage side only. Student-facing submission (the helpdesk
 * page) has no wired endpoint yet; when it is built it belongs under
 * /api/student/complaints with its own author-scoped rules, not here.
 */

const CATEGORIES = ['teacher', 'admin', 'facility', 'academic', 'safety', 'other'] as const
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
const STATUSES = ['new', 'reviewing', 'resolved', 'dismissed'] as const

export async function GET(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/complaints' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 100)

    const filter: Record<string, unknown> = {}

    const status = toEnumOptional(searchParams.get('status'), STATUSES)
    if (status) filter.status = status

    const severity = toEnumOptional(searchParams.get('severity'), SEVERITIES)
    if (severity) filter.severity = severity

    const category = toEnumOptional(searchParams.get('category'), CATEGORIES)
    if (category) filter.category = category

    const [complaints, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Complaint.countDocuments(filter),
    ])

    return apiSuccess({
      complaints,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/complaints')
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'POST /api/admin/complaints' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body
    const input = body as Record<string, unknown>

    const subject = toStr(input.subject, 200)
    const complaintBody = toStr(input.body, 5000)
    const category = toEnumOptional(input.category, CATEGORIES)
    const severity = toEnumOptional(input.severity, SEVERITIES)

    const fieldErrors: Record<string, string> = {}
    if (!subject) fieldErrors.subject = 'Subject is required.'
    if (!complaintBody) fieldErrors.body = 'Details are required.'
    if (!category) fieldErrors.category = `Category must be one of: ${CATEGORIES.join(', ')}.`
    if (!severity) fieldErrors.severity = `Severity must be one of: ${SEVERITIES.join(', ')}.`
    if (Object.keys(fieldErrors).length > 0) {
      return apiError('VALIDATION_FAILED', { fieldErrors })
    }

    await connectDB()

    const complaint = await Complaint.create({
      subject,
      body: complaintBody,
      category,
      severity,
      isAnonymous: input.isAnonymous !== false,
      tags: toStrArray(input.tags, 20, 40),
    })

    void audit({
      action: 'admin.action',
      severity: severity === 'critical' ? 'critical' : 'notice',
      actor: guard.user,
      targetType: 'Complaint',
      targetId: String(complaint._id),
      // Never log the complaint body — it is the confidential payload.
      metadata: { operation: 'create', category, severity },
    })

    return apiSuccess({ complaint }, { status: 201 })
  } catch (err) {
    return handleApiError(err, 'POST /api/admin/complaints')
  }
}
