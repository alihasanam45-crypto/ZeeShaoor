import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import FeeRecord from '@/models/FeeRecord'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { pick, toEnumOptional, toNum, toPagination, toStr } from '@/lib/security/sanitize'

/**
 * Fee ledger — admin only. Financial records; teachers must never see them.
 */

const STATUSES = ['paid', 'partial', 'unpaid', 'waived'] as const
const METHODS = ['cash', 'bank', 'online'] as const

/**
 * `balance` and `status` are excluded deliberately — both are derived from
 * amount/paid below. Letting a client set them directly would allow marking a
 * record paid without recording a payment.
 */
const WRITABLE = [
  'studentId',
  'studentName',
  'rollNo',
  'class',
  'month',
  'amount',
  'paid',
  'dueDate',
  'paidDate',
  'paymentMethod',
  'remarks',
] as const

export async function GET(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/fees' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 100)

    const filter: Record<string, unknown> = {}

    const status = toEnumOptional(searchParams.get('status'), STATUSES)
    if (status) filter.status = status

    const cls = toStr(searchParams.get('class'), 20)
    if (cls && cls !== 'all') filter.class = cls

    const month = toStr(searchParams.get('month'), 7)
    if (month) filter.month = month

    const [records, total, summaryRows] = await Promise.all([
      FeeRecord.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FeeRecord.countDocuments(filter),
      // Summary computed in the database. The previous implementation loaded
      // every matching record into process memory on each request — an
      // unbounded allocation that grows with the ledger.
      FeeRecord.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalPaid: { $sum: '$paid' },
            totalBalance: { $sum: '$balance' },
          },
        },
      ]),
    ])

    const summary = summaryRows[0] ?? { totalAmount: 0, totalPaid: 0, totalBalance: 0 }

    return apiSuccess({
      records,
      summary: {
        totalAmount: summary.totalAmount ?? 0,
        totalPaid: summary.totalPaid ?? 0,
        totalBalance: summary.totalBalance ?? 0,
      },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/fees')
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'POST /api/admin/fees' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    const data = pick<Record<string, unknown>, (typeof WRITABLE)[number]>(body, WRITABLE)

    const studentId = toStr(data.studentId, 64)
    const studentName = toStr(data.studentName, 80)
    const rollNo = toStr(data.rollNo, 30)
    const cls = toStr(data.class, 20)
    const month = toStr(data.month, 7)
    const dueDate = toStr(data.dueDate, 20)
    const amount = toNum(data.amount, -1, 0, 10_000_000)
    const paid = toNum(data.paid, 0, 0, 10_000_000)

    const fieldErrors: Record<string, string> = {}
    if (!studentId) fieldErrors.studentId = 'Student is required.'
    if (!studentName) fieldErrors.studentName = 'Student name is required.'
    if (!rollNo) fieldErrors.rollNo = 'Roll number is required.'
    if (!cls) fieldErrors.class = 'Class is required.'
    if (!/^\d{4}-\d{2}$/.test(month)) fieldErrors.month = 'Month must be in YYYY-MM format.'
    if (!dueDate) fieldErrors.dueDate = 'Due date is required.'
    if (amount < 0) fieldErrors.amount = 'Amount must be a positive number.'
    if (paid > amount) fieldErrors.paid = 'Paid amount cannot exceed the total.'
    if (Object.keys(fieldErrors).length > 0) {
      return apiError('VALIDATION_FAILED', { fieldErrors })
    }

    await connectDB()

    // Derived server-side, never taken from the request.
    const balance = amount - paid
    const status: (typeof STATUSES)[number] =
      paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'unpaid'

    const record = await FeeRecord.create({
      studentId,
      studentName,
      rollNo,
      class: cls,
      month,
      amount,
      paid,
      balance,
      status,
      dueDate,
      paidDate: toStr(data.paidDate, 20) || undefined,
      paymentMethod: toEnumOptional(data.paymentMethod, METHODS),
      remarks: toStr(data.remarks, 500) || undefined,
    })

    void audit({
      action: 'fee.create',
      actor: guard.user,
      targetType: 'FeeRecord',
      targetId: String(record._id),
      metadata: { rollNo, month, amount, paid },
    })

    return apiSuccess({ record }, { status: 201 })
  } catch (err) {
    return handleApiError(err, 'POST /api/admin/fees')
  }
}
