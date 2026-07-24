import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PastPaper from '@/models/PastPaper'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { toEnumOptional, toNum, toObjectId, toPagination, toStr } from '@/lib/security/sanitize'

/** Past-paper catalogue management — admin only. */

const CURRENT_YEAR = new Date().getFullYear()

/** Mirrors the schema enums so a bad value is a field error, not a 500. */
const BOARDS = ['Punjab', 'Sindh', 'KPK', 'Federal', 'AJK'] as const
const PAPER_TYPES = ['Annual', 'Supplementary'] as const

/**
 * Only http(s) URLs are accepted for paper assets.
 *
 * An unvalidated URL is stored and later rendered as a link or an embed, which
 * makes `javascript:` and `data:` values a stored-XSS vector for every student
 * who opens the paper.
 */
function safeHttpUrl(value: unknown, maxLength = 500): string | null {
  const raw = toStr(value, maxLength)
  if (!raw) return null
  try {
    const parsed = new URL(raw)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/past-papers' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 200)

    const filter: Record<string, unknown> = { isActive: true }

    const classLevel = toStr(searchParams.get('classLevel'), 10)
    if (classLevel) filter.classLevel = classLevel

    const subject = toStr(searchParams.get('subject'), 60)
    if (subject) filter.subject = subject

    const board = toStr(searchParams.get('board'), 60)
    if (board) filter.board = board

    const yearParam = searchParams.get('year')
    if (yearParam) filter.year = toNum(yearParam, CURRENT_YEAR, 1950, CURRENT_YEAR + 1)

    const [papers, total] = await Promise.all([
      PastPaper.find(filter).sort({ year: -1 }).skip(skip).limit(limit).lean(),
      PastPaper.countDocuments(filter),
    ])

    return apiSuccess({
      papers,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/admin/past-papers')
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'POST /api/admin/past-papers' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body
    const input = body as Record<string, unknown>

    const subject = toStr(input.subject, 60)
    const classLevel = toStr(input.classLevel, 10)
    const board = toEnumOptional(input.board, BOARDS)
    const paperType = toEnumOptional(input.paperType, PAPER_TYPES) ?? 'Annual'
    const year = toNum(input.year, 0, 1950, CURRENT_YEAR + 1)
    const pdfUrl = safeHttpUrl(input.pdfUrl)
    const solutionUrl = input.solutionUrl ? safeHttpUrl(input.solutionUrl) : null

    const fieldErrors: Record<string, string> = {}
    if (!subject) fieldErrors.subject = 'Subject is required.'
    if (!classLevel) fieldErrors.classLevel = 'Class is required.'
    if (!board) fieldErrors.board = `Board must be one of: ${BOARDS.join(', ')}.`
    if (year < 1950) fieldErrors.year = 'Enter a valid year.'
    if (!pdfUrl) fieldErrors.pdfUrl = 'A valid http(s) PDF URL is required.'
    if (input.solutionUrl && !solutionUrl) {
      fieldErrors.solutionUrl = 'Solution URL must be a valid http(s) address.'
    }
    if (Object.keys(fieldErrors).length > 0) {
      return apiError('VALIDATION_FAILED', { fieldErrors })
    }

    await connectDB()

    // The field-error gate above guarantees `board` and `pdfUrl` are set, but
    // TypeScript cannot narrow through the error accumulator — hence the
    // assertions here and in the create below.
    const existing = await PastPaper.findOne({
      subject,
      classLevel,
      year,
      board: board!,
      paperType,
    }).lean()
    if (existing) return apiError('CONFLICT', { message: 'That paper is already catalogued.' })

    const paper = await PastPaper.create({
      subject,
      classLevel,
      year,
      board: board!,
      paperType,
      pdfUrl: pdfUrl!,
      solutionUrl: solutionUrl ?? undefined,
    })

    void audit({
      action: 'admin.action',
      actor: guard.user,
      targetType: 'PastPaper',
      targetId: String(paper._id),
      metadata: { operation: 'create', subject, classLevel, year, board },
    })

    return apiSuccess({ paper }, { status: 201 })
  } catch (err) {
    return handleApiError(err, 'POST /api/admin/past-papers')
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'DELETE /api/admin/past-papers' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    const id = toObjectId((body as { id?: unknown })?.id)
    if (!id) return apiError('VALIDATION_FAILED', { message: 'A valid paper id is required.' })

    await connectDB()
    // Soft delete — preserves the catalogue history.
    const paper = await PastPaper.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
    if (!paper) return apiError('NOT_FOUND')

    void audit({
      action: 'admin.action',
      actor: guard.user,
      targetType: 'PastPaper',
      targetId: id,
      metadata: { operation: 'deactivate', subject: paper.subject, year: paper.year },
    })

    return apiSuccess({ deactivated: true })
  } catch (err) {
    return handleApiError(err, 'DELETE /api/admin/past-papers')
  }
}
