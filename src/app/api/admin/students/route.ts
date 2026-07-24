import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Student from '@/models/Student'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { pick, safeContains, toEnumOptional, toPagination, toStr } from '@/lib/security/sanitize'

/**
 * Student roster — admin only.
 *
 * Holds minors' PII (names, roll numbers, guardian contacts, wellbeing risk
 * flags), making it one of the most sensitive surfaces on the platform. It
 * previously had no authorization at all and, because the proxy admitted
 * teachers to /api/admin/*, was readable and writable by every teacher.
 */

const RISK_LEVELS = ['safe', 'watch', 'danger', 'critical'] as const
const STATUSES = ['active', 'inactive', 'graduated', 'expelled'] as const

/**
 * Fields a client may set. Everything else the schema defines — gpa,
 * attendance, wellbeingScore, riskLevel, subjects — is derived by the platform
 * and must not be settable from a request body.
 */
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

export async function GET(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/students' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 100)

    const filter: Record<string, unknown> = {}

    // Scalar-only assignment. URLSearchParams values are always strings, so no
    // operator object can reach the filter through this path.
    const cls = toStr(searchParams.get('class'), 20)
    if (cls && cls !== 'all') filter.class = cls

    const section = toStr(searchParams.get('section'), 10)
    if (section && section !== 'all') filter.section = section

    const status = toEnumOptional(searchParams.get('status'), STATUSES)
    if (status) filter.status = status

    const risk = toEnumOptional(searchParams.get('riskLevel'), RISK_LEVELS)
    if (risk) filter.riskLevel = risk

    // Escaped — an unescaped user regex is both an injection and a ReDoS lever.
    const search = safeContains(searchParams.get('search'), 60)
    if (search) filter.$or = [{ name: search }, { rollNo: search }]

    const [students, total] = await Promise.all([
      Student.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Student.countDocuments(filter),
    ])

    return apiSuccess({
      students,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/students')
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'POST /api/admin/students' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    // Allowlist projection. The previous `Student.create({ ...body })` let a
    // caller set any schema field, including gpa and riskLevel.
    const data = pick<Record<string, unknown>, (typeof WRITABLE)[number]>(body, WRITABLE)

    const name = toStr(data.name, 80)
    const rollNo = toStr(data.rollNo, 30)
    const cls = toStr(data.class, 20)
    const section = toStr(data.section, 10)
    const gender = toEnumOptional(data.gender, ['male', 'female'] as const)

    const fieldErrors: Record<string, string> = {}
    if (!name) fieldErrors.name = 'Name is required.'
    if (!rollNo) fieldErrors.rollNo = 'Roll number is required.'
    if (!cls) fieldErrors.class = 'Class is required.'
    if (!section) fieldErrors.section = 'Section is required.'
    if (!gender) fieldErrors.gender = 'Gender must be male or female.'
    if (Object.keys(fieldErrors).length > 0) {
      return apiError('VALIDATION_FAILED', { fieldErrors })
    }

    await connectDB()

    const existing = await Student.findOne({ rollNo }).lean()
    if (existing) {
      return apiError('CONFLICT', { message: 'That roll number is already in use.' })
    }

    // Every field is coerced explicitly rather than spread from `data`: the
    // allowlist controls *which* keys survive, but their values are still
    // untrusted `unknown` until sanitized. The schema stores both dates as
    // strings, so `toStr` is the correct coercion for them.
    const student = await Student.create({
      name,
      rollNo,
      class: cls,
      section,
      gender,
      dateOfBirth: toStr(data.dateOfBirth, 40),
      guardianName: toStr(data.guardianName, 80),
      guardianPhone: toStr(data.guardianPhone, 30),
      address: toStr(data.address, 200),
      admissionDate: toStr(data.admissionDate, 40),
      status: toEnumOptional(data.status, STATUSES) ?? 'active',
    })

    void audit({
      action: 'student.create',
      actor: guard.user,
      targetType: 'Student',
      targetId: String(student._id),
      metadata: { rollNo, class: cls, section },
    })

    return apiSuccess({ student }, { status: 201 })
  } catch (err) {
    return handleApiError(err, 'POST /api/admin/students')
  }
}
