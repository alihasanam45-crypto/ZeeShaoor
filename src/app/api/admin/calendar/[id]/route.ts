import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { toEnumOptional, toObjectId, toStr, toStrArray } from '@/lib/security/sanitize'

/** Single calendar event — admin only. */

const CATEGORIES = ['exam', 'holiday', 'event', 'meeting', 'deadline', 'activity'] as const
const PRIORITIES = ['high', 'medium', 'low'] as const
const STATUSES = ['upcoming', 'ongoing', 'completed'] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'PATCH /api/admin/calendar/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid event id.' })

    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body
    const input = body as Record<string, unknown>

    // Explicit field-by-field build. The previous `findByIdAndUpdate(id, body)`
    // forwarded the raw body as an update document, so a caller could send
    // update operators or overwrite any schema field.
    const update: Record<string, unknown> = {}

    if (input.title !== undefined) update.title = toStr(input.title, 150)
    if (input.date !== undefined) update.date = toStr(input.date, 20)
    if (input.endDate !== undefined) update.endDate = toStr(input.endDate, 20)
    if (input.description !== undefined) update.description = toStr(input.description, 2000)
    if (input.icon !== undefined) update.icon = toStr(input.icon, 8)
    if (input.isRecurring !== undefined) update.isRecurring = input.isRecurring === true
    if (input.affectedClasses !== undefined) {
      update.affectedClasses = toStrArray(input.affectedClasses, 60, 20)
    }

    const category = toEnumOptional(input.category, CATEGORIES)
    if (category) update.category = category

    const priority = toEnumOptional(input.priority, PRIORITIES)
    if (priority) update.priority = priority

    const status = toEnumOptional(input.status, STATUSES)
    if (status) update.status = status

    if (Object.keys(update).length === 0) {
      return apiError('VALIDATION_FAILED', { message: 'No updatable fields supplied.' })
    }

    await connectDB()
    const event = await CalendarEvent.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    )
    if (!event) return apiError('NOT_FOUND')

    void audit({
      action: 'admin.action',
      actor: guard.user,
      targetType: 'CalendarEvent',
      targetId: id,
      metadata: { operation: 'update', fields: Object.keys(update) },
    })

    return apiSuccess({ event })
  } catch (err) {
    return handleApiError(err, 'PATCH /api/admin/calendar/[id]')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'DELETE /api/admin/calendar/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid event id.' })

    await connectDB()
    const event = await CalendarEvent.findByIdAndDelete(id)
    if (!event) return apiError('NOT_FOUND')

    void audit({
      action: 'admin.action',
      actor: guard.user,
      targetType: 'CalendarEvent',
      targetId: id,
      metadata: { operation: 'delete', title: event.title },
    })

    return apiSuccess({ deleted: true })
  } catch (err) {
    return handleApiError(err, 'DELETE /api/admin/calendar/[id]')
  }
}
