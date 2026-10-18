import { NextResponse } from 'next/server'
import { getConfidentialMessages } from '@/actions/feedback-actions'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiSuccess, handleApiError } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'

/**
 * Confidential student messages — admin only.
 *
 * This is the channel students use to report problems privately, including
 * problems with staff. It was previously readable by any authenticated caller
 * and, through the proxy's teacher allowance on /api/admin/*, by every
 * teacher — defeating the entire purpose of a confidential channel.
 *
 * Every read is audited: with a surface this sensitive, "who looked at this"
 * matters as much as "who may look at this".
 */
export async function GET() {
  const guard = await requireApiRole(ADMIN_ONLY, {
    action: 'GET /api/admin/confidential-messages',
  })
  if (guard instanceof NextResponse) return guard

  try {
    const messages = await getConfidentialMessages()

    void audit({
      action: 'admin.action',
      severity: 'notice',
      actor: guard.user,
      targetType: 'ConfidentialMessage',
      metadata: { operation: 'read_all', count: Array.isArray(messages) ? messages.length : 0 },
    })

    return apiSuccess({ messages })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/confidential-messages')
  }
}
