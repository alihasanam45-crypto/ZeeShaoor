import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Student from '@/models/Student'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { pick, toObjectId } from '@/lib/security/sanitize'

/**
 * Single student record — admin only.
 *
 * The `id` segment is validated as an ObjectId before any query runs: an
 * unvalidated value reaches Mongoose as a CastError (a 500 that leaks the
 * failure shape), and an object value would be interpreted as a query operator.
 */

/** Same server-owned/client-writable split as the collection route. */
const WRITABLE = [
  'name',
  'rollNo',
  'class',
  'section',
  'gender',
  'dateOfBirth',
  'guardianName',
  'guardianPhone',
  'address',
  'admissionDate',
  'status',
] as const

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/students/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid student id.' })

    await connectDB()
    const student = await Student.findById(id).lean()
    if (!student) return apiError('NOT_FOUND')

    return apiSuccess({ student })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/students/[id]')
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'PATCH /api/admin/students/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid student id.' })

    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    // Allowlist. The previous `findByIdAndUpdate(id, body)` accepted an
    // arbitrary update document — including `$set`/`$unset` operators and
    // derived academic fields.
    const update = pick<Record<string, unknown>, (typeof WRITABLE)[number]>(body, WRITABLE)
    if (Object.keys(update).length === 0) {
      return apiError('VALIDATION_FAILED', { message: 'No updatable fields supplied.' })
    }

    await connectDB()
    const student = await Student.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    )
    if (!student) return apiError('NOT_FOUND')

    void audit({
      action: 'student.update',
      actor: guard.user,
      targetType: 'Student',
      targetId: id,
      metadata: { fields: Object.keys(update) },
    })

    return apiSuccess({ student })
  } catch (err) {
    return handleApiError(err, 'PATCH /api/admin/students/[id]')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'DELETE /api/admin/students/[id]' })
  if (guard instanceof NextResponse) return guard

  try {
    const id = toObjectId((await params).id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'Invalid student id.' })

    await connectDB()
    const student = await Student.findByIdAndDelete(id)
    if (!student) return apiError('NOT_FOUND')

    // Deleting a minor's record is irreversible — record who did it, with the
    // roll number preserved so the entry stays meaningful after the row is gone.
    void audit({
      action: 'student.delete',
      severity: 'notice',
      actor: guard.user,
      targetType: 'Student',
      targetId: id,
      metadata: { rollNo: student.rollNo, class: student.class },
    })

    return apiSuccess({ deleted: true })
  } catch (err) {
    return handleApiError(err, 'DELETE /api/admin/students/[id]')
  }
}
