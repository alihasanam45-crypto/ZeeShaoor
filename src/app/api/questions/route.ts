import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Question from '@/models/Question'
import { STAFF, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { safeContains, toEnumOptional, toPagination, toStr } from '@/lib/security/sanitize'
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  normalizeQuestion,
} from '@/lib/security/question-input'

/**
 * Question bank — staff only (admins and teachers).
 *
 * Students must not read this surface: `correctAnswer` is stored on every
 * document, so an open read is an answer key for every exam in the platform.
 * The route was previously unauthenticated on both verbs.
 */

export async function GET(req: Request) {
  const guard = await requireApiRole(STAFF, { action: 'GET /api/questions' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 200)

    const filter: Record<string, unknown> = {}

    const classLevel = toStr(searchParams.get('classLevel'), 4)
    if (classLevel) filter.classLevel = classLevel

    const subject = toStr(searchParams.get('subject'), 60)
    if (subject) filter.subject = subject

    const type = toEnumOptional(searchParams.get('type'), QUESTION_TYPES)
    if (type) filter.questionType = type

    const difficulty = toEnumOptional(searchParams.get('difficulty'), DIFFICULTIES)
    if (difficulty) filter.difficulty = difficulty

    const chapter = toStr(searchParams.get('chapter'), 4)
    if (chapter) filter.chapter = chapter

    // Escaped: `{ $regex: search }` with raw input was a ReDoS lever against a
    // 2000-character text field.
    const search = safeContains(searchParams.get('search'), 80)
    if (search) filter.questionText = search

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({ chapter: 1, difficulty: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter),
    ])

    return apiSuccess({
      questions,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/questions')
  }
}

export async function POST(req: Request) {
  const guard = await requireApiRole(STAFF, { action: 'POST /api/questions' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    // Validated and normalized before it reaches the driver. The previous
    // `Question.create(body)` accepted the raw payload, which let a caller
    // choose `_id` (the schema declares a String id with no default) and set
    // `createdBy` to anyone.
    const result = normalizeQuestion(body, guard.user.email)
    if (!result.ok) {
      return apiError('VALIDATION_FAILED', {
        message: result.errors.join(' '),
      })
    }

    await connectToDatabase()
    const question = await Question.create(result.value)

    void audit({
      action: 'question.create',
      actor: guard.user,
      targetType: 'Question',
      targetId: String(question._id),
      metadata: {
        classLevel: result.value.classLevel,
        subject: result.value.subject,
        questionType: result.value.questionType,
      },
    })

    return apiSuccess({ question }, { status: 201 })
  } catch (err) {
    return handleApiError(err, 'POST /api/questions')
  }
}
