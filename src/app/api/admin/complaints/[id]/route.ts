import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { toEnumOptional, toObjectId, toStr } from '@/lib/security/sanitize'

/** Single complaint — admin only. See the collection route for context. */

const STATUSES = ['new', 'reviewing', 'resolved', 'dismissed'] as const

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/complaints/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid complaint id.' })

    await connectDB()
    const complaint = await Complaint.findById(id).lean()
    if (!complaint) return apiError('NOT_FOUND')

    return apiSuccess({ complaint })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/complaints/[id]')
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'PATCH /api/admin/complaints/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid complaint id.' })

    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body
    const input = body as Record<string, unknown>

    const set: Record<string, unknown> = {}

    const status = toEnumOptional(input.status, STATUSES)
    if (status) set.status = status

    if (input.assignedTo !== undefined) {
      set.assignedTo = toStr(input.assignedTo, 80) || null
    }

    const update: Record<string, unknown> = {}
    if (Object.keys(set).length > 0) update.$set = set

    // Response authorship is taken from the authenticated session, not the
    // request body. The previous handler accepted `response.by` and
    // `response.isAdmin` from the caller, letting anyone forge an official
    // reply attributed to another person.
    const response = input.response as Record<string, unknown> | undefined
    const responseText = toStr(response?.text, 5000)
    if (responseText) {
      update.$push = {
        responses: {
          text: responseText,
          by: guard.user.email,
          isAdmin: true,
          createdAt: new Date(),
        },
      }
    }

    if (Object.keys(update).length === 0) {
      return apiError('VALIDATION_FAILED', { message: 'No updatable fields supplied.' })
    }

    await connectDB()
    const complaint = await Complaint.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
    if (!complaint) return apiError('NOT_FOUND')

    void audit({
      action: 'admin.action',
      actor: guard.user,
      targetType: 'Complaint',
      targetId: id,
      metadata: {
        operation: 'triage',
        status: set.status ?? null,
        responded: Boolean(responseText),
      },
    })

    return apiSuccess({ complaint })
  } catch (err) {
    return handleApiError(err, 'PATCH /api/admin/complaints/[id]')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'DELETE /api/admin/complaints/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid complaint id.' })

    await connectDB()
    const complaint = await Complaint.findByIdAndDelete(id)
    if (!complaint) return apiError('NOT_FOUND')

    // Destroying a safety report is high-consequence: retain who did it and
    // which case it was, without copying the confidential body.
    void audit({
      action: 'admin.action',
      severity: 'critical',
      actor: guard.user,
      targetType: 'Complaint',
      targetId: id,
      metadata: {
        operation: 'delete',
        code: complaint.code,
        category: complaint.category,
        severity: complaint.severity,
      },
    })

    return apiSuccess({ deleted: true })
  } catch (err) {
    return handleApiError(err, 'DELETE /api/admin/complaints/[id]')
  }
}
