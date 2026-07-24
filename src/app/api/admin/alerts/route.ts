import { NextRequest, NextResponse } from 'next/server'
import { getPrincipalAlerts, updateAlertStatus } from '@/actions/feedback-actions'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { toEnumOptional, toStr } from '@/lib/security/sanitize'

/**
 * Principal alert queue — admin only.
 *
 * Alerts summarize at-risk students and staff concerns. Both the read and the
 * status transition were previously unauthenticated, and both echoed raw
 * `err.message` back to the caller.
 */

const ALERT_STATUSES = ['new', 'acknowledged', 'resolved', 'dismissed'] as const

export async function GET() {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/alerts' })
  if (guard instanceof NextResponse) return guard

  try {
    const alerts = await getPrincipalAlerts()
    return apiSuccess({ alerts })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/alerts')
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'PATCH /api/admin/alerts' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body
    const input = body as Record<string, unknown>

    const alertId = toStr(input.alertId, 64)
    const status = toEnumOptional(input.status, ALERT_STATUSES)

    const fieldErrors: Record<string, string> = {}
    if (!alertId) fieldErrors.alertId = 'Alert id is required.'
    if (!status) fieldErrors.status = `Status must be one of: ${ALERT_STATUSES.join(', ')}.`
    if (Object.keys(fieldErrors).length > 0) {
      return apiError('VALIDATION_FAILED', { fieldErrors })
    }

    await updateAlertStatus(alertId, status!)

    void audit({
      action: 'admin.action',
      actor: guard.user,
      targetType: 'PrincipalAlert',
      targetId: alertId,
      metadata: { operation: 'status_change', status },
    })

    return apiSuccess({ updated: true })
  } catch (err) {
    return handleApiError(err, 'PATCH /api/admin/alerts')
  }
}
