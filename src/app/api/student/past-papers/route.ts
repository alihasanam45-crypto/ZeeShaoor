import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PastPaper from '@/models/PastPaper'
import { ANY_ROLE, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { toEnumOptional, toNum, toObjectId, toPagination, toStr } from '@/lib/security/sanitize'

/**
 * Past-paper catalogue for students. Read-only, plus a solve counter.
 *
 * `solutionUrl` is withheld from the student projection: handing every student
 * the marking scheme alongside the paper defeats the exercise. The admin
 * catalogue route still returns it.
 */

const CURRENT_YEAR = new Date().getFullYear()
const BOARDS = ['Punjab', 'Sindh', 'KPK', 'Federal', 'AJK'] as const

const STUDENT_PROJECTION = {
  subject: 1,
  classLevel: 1,
  year: 1,
  board: 1,
  paperType: 1,
  pdfUrl: 1,
  totalSolves: 1,
} as const

export async function GET(req: NextRequest) {
  const guard = await requireApiRole(ANY_ROLE, { action: 'GET /api/student/past-papers' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 100)

    const filter: Record<string, unknown> = { isActive: true }

    const classLevel = toStr(searchParams.get('classLevel'), 10)
    if (classLevel) filter.classLevel = classLevel

    const subject = toStr(searchParams.get('subject'), 60)
    if (subject) filter.subject = subject

    const board = toEnumOptional(searchParams.get('board'), BOARDS)
    if (board) filter.board = board

    const yearParam = searchParams.get('year')
    if (yearParam) filter.year = toNum(yearParam, CURRENT_YEAR, 1950, CURRENT_YEAR + 1)

    const projection = guard.user.role === 'student' ? STUDENT_PROJECTION : {}

    const [papers, total] = await Promise.all([
      PastPaper.find(filter, projection).sort({ year: -1 }).skip(skip).limit(limit).lean(),
      PastPaper.countDocuments(filter),
    ])

    return apiSuccess({
      papers,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/student/past-papers')
  }
}

/**
 * Increment the solve counter.
 *
 * `paperId` is validated as an ObjectId first: as a raw JSON value it reached
 * `findByIdAndUpdate` directly, so `{"paperId": {"$ne": null}}` incremented an
 * arbitrary document.
 */
export async function POST(req: NextRequest) {
  const guard = await requireApiRole(ANY_ROLE, { action: 'POST /api/student/past-papers' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    const paperId = toObjectId((body as { paperId?: unknown })?.paperId)
    if (!paperId) {
      return apiError('VALIDATION_FAILED', { message: 'A valid paperId is required.' })
    }

    await connectDB()
    const paper = await PastPaper.findByIdAndUpdate(
      paperId,
      { $inc: { totalSolves: 1 } },
      { new: true, projection: { totalSolves: 1 } },
    )
    if (!paper) return apiError('NOT_FOUND')

    return apiSuccess({ totalSolves: paper.totalSolves })
  } catch (err) {
    return handleApiError(err, 'POST /api/student/past-papers')
  }
}
