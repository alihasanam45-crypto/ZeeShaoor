import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import {
  safeStartsWith,
  toEnum,
  toEnumOptional,
  toPagination,
  toStr,
  toStrArray,
} from '@/lib/security/sanitize'

/** Academic calendar — admin only (writes school-wide announcements). */

const CATEGORIES = ['exam', 'holiday', 'event', 'meeting', 'deadline', 'activity'] as const
const PRIORITIES = ['high', 'medium', 'low'] as const
const STATUSES = ['upcoming', 'ongoing', 'completed'] as const

export async function GET(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/calendar' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 200)

    const filter: Record<string, unknown> = {}

    const category = toEnumOptional(searchParams.get('category'), CATEGORIES)
    if (category) filter.category = category

    const status = toEnumOptional(searchParams.get('status'), STATUSES)
    if (status) filter.status = status

    // Regex-escaped. `^${month}` interpolated a raw user string directly into
    // a pattern, so `?month=(a+)+$` was a CPU-pinning ReDoS.
    const month = safeStartsWith(searchParams.get('month'), 7)
    if (month) filter.date = month

    const [events, total] = await Promise.all([
      CalendarEvent.find(filter).sort({ date: 1 }).skip(skip).limit(limit).lean(),
      CalendarEvent.countDocuments(filter),
    ])

    return apiSuccess({
      events,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/calendar')
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'POST /api/admin/calendar' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body
    const input = body as Record<string, unknown>

    const title = toStr(input.title, 150)
    const date = toStr(input.date, 20)
    const description = toStr(input.description, 2000)
    const category = toEnumOptional(input.category, CATEGORIES)

    const fieldErrors: Record<string, string> = {}
    if (!title) fieldErrors.title = 'Title is required.'
    if (!date) fieldErrors.date = 'Date is required.'
    if (!description) fieldErrors.description = 'Description is required.'
    if (!category) fieldErrors.category = `Category must be one of: ${CATEGORIES.join(', ')}.`
    if (Object.keys(fieldErrors).length > 0) {
      return apiError('VALIDATION_FAILED', { fieldErrors })
    }

    await connectDB()

    const event = await CalendarEvent.create({
      title,
      date,
      description,
      category,
      priority: toEnum(input.priority, PRIORITIES, 'medium'),
      affectedClasses: toStrArray(input.affectedClasses, 60, 20),
      isRecurring: input.isRecurring === true,
      endDate: toStr(input.endDate, 20) || undefined,
      // Bounded: an "icon" field is a free-text sink otherwise.
      icon: toStr(input.icon, 8) || '📅',
    })

    void audit({
      action: 'admin.action',
      actor: guard.user,
      targetType: 'CalendarEvent',
      targetId: String(event._id),
      metadata: { operation: 'create', title, category },
    })

    return apiSuccess({ event }, { status: 201 })
  } catch (err) {
    return handleApiError(err, 'POST /api/admin/calendar')
  }
}
