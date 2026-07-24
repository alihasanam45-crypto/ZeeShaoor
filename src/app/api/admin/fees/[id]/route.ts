import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import FeeRecord from '@/models/FeeRecord'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { pick, toEnumOptional, toNum, toObjectId, toStr } from '@/lib/security/sanitize'

/** Single fee record — admin only. */

const METHODS = ['cash', 'bank', 'online'] as const

/** `balance` and `status` stay server-derived; see the collection route. */
const WRITABLE = ['amount', 'paid', 'dueDate', 'paidDate', 'paymentMethod', 'remarks'] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'PATCH /api/admin/fees/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid record id.' })

    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    const data = pick<Record<string, unknown>, (typeof WRITABLE)[number]>(body, WRITABLE)

    await connectDB()
    const existing = await FeeRecord.findById(id)
    if (!existing) return apiError('NOT_FOUND')

    const update: Record<string, unknown> = {}

    if (data.dueDate !== undefined) update.dueDate = toStr(data.dueDate, 20)
    if (data.paidDate !== undefined) update.paidDate = toStr(data.paidDate, 20)
    if (data.remarks !== undefined) update.remarks = toStr(data.remarks, 500)
    if (data.paymentMethod !== undefined) {
      update.paymentMethod = toEnumOptional(data.paymentMethod, METHODS)
    }

    // Money fields drive balance and status, which are recomputed here rather
    // than accepted from the caller — the previous handler wrote whatever
    // `body.balance` / `body.status` contained.
    const amount =
      data.amount !== undefined ? toNum(data.amount, existing.amount, 0, 10_000_000) : existing.amount
    const paid =
      data.paid !== undefined ? toNum(data.paid, existing.paid, 0, 10_000_000) : existing.paid

    if (paid > amount) {
      return apiError('VALIDATION_FAILED', {
        fieldErrors: { paid: 'Paid amount cannot exceed the total.' },
      })
    }

    if (data.amount !== undefined || data.paid !== undefined) {
      update.amount = amount
      update.paid = paid
      update.balance = amount - paid
      update.status = paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
    }

    if (Object.keys(update).length === 0) {
      return apiError('VALIDATION_FAILED', { message: 'No updatable fields supplied.' })
    }

    const record = await FeeRecord.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    )
    if (!record) return apiError('NOT_FOUND')

    void audit({
      action: 'fee.update',
      actor: guard.user,
      targetType: 'FeeRecord',
      targetId: id,
      metadata: {
        fields: Object.keys(update),
        previousPaid: existing.paid,
        newPaid: record.paid,
      },
    })

    return apiSuccess({ record })
  } catch (err) {
    return handleApiError(err, 'PATCH /api/admin/fees/[id]')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'DELETE /api/admin/fees/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid record id.' })

    await connectDB()
    const record = await FeeRecord.findByIdAndDelete(id)
    if (!record) return apiError('NOT_FOUND')

    void audit({
      action: 'fee.update',
      severity: 'notice',
      actor: guard.user,
      targetType: 'FeeRecord',
      targetId: id,
      metadata: { deleted: true, rollNo: record.rollNo, month: record.month, amount: record.amount },
    })

    return apiSuccess({ deleted: true })
  } catch (err) {
    return handleApiError(err, 'DELETE /api/admin/fees/[id]')
  }
}
