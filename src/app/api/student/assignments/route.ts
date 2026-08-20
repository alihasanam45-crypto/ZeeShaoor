import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Question from '@/models/Question'
import QuizResult from '@/models/QuizResult'
import { ANY_ROLE, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { toBool, toNum, toStr } from '@/lib/security/sanitize'

/**
 * Adaptive practice set, plus per-question result recording.
 *
 * The vulnerability fixed here was an IDOR on both verbs: `studentId` was read
 * from the query string (GET) and the request body (POST). Any caller could
 *
 *   - read which chapters another named student repeatedly fails, and
 *   - write quiz results attributed to another student, poisoning their
 *     analytics and the at-risk flags teachers act on.
 *
 * Identity now comes from the session only. Staff may inspect a specific
 * student on the read path; a student is always pinned to themselves
 * regardless of what they send.
 */

const PRACTICE_SET_SIZE = 5
/** A chapter counts as "weak" once this many answers have been wrong. */
const WEAKNESS_THRESHOLD = 3

/** Answer-free projection — this endpoint feeds a live quiz. */
const QUIZ_PROJECTION = {
  classLevel: 1,
  subject: 1,
  chapter: 1,
  questionType: 1,
  questionText: 1,
  options: 1,
  difficulty: 1,
  marks: 1,
} as const

export async function GET(req: Request) {
  const guard = await requireApiRole(ANY_ROLE, { action: 'GET /api/student/assignments' })
  if (guard instanceof NextResponse) return guard

  try {
    const { searchParams } = new URL(req.url)
    const subject = toStr(searchParams.get('subject'), 60)
    if (!subject) {
      return apiError('VALIDATION_FAILED', { message: 'subject is required.' })
    }

    const user = guard.user
    // Staff may target a student; a student is always themselves.
    const studentId =
      user.role === 'student' ? user.id : toStr(searchParams.get('studentId'), 64) || user.id

    await connectToDatabase()

    const weakTopics = await QuizResult.aggregate([
      { $match: { studentId, subject, isCorrect: false } },
      { $group: { _id: '$chapter', wrongCount: { $sum: 1 } } },
      { $match: { wrongCount: { $gte: WEAKNESS_THRESHOLD } } },
      { $project: { chapter: '$_id' } },
    ])

    const weakChapters = weakTopics
      .map((t: { chapter?: string }) => t.chapter)
      .filter((c): c is string => Boolean(c))

    let questions: unknown[] = []

    if (weakChapters.length > 0) {
      questions = await Question.aggregate([
        { $match: { subject, chapter: { $in: weakChapters } } },
        { $sample: { size: PRACTICE_SET_SIZE } },
        { $project: QUIZ_PROJECTION },
      ])
    }

    if (questions.length < PRACTICE_SET_SIZE) {
      const needed = PRACTICE_SET_SIZE - questions.length
      const existingIds = questions.map((q) => (q as { _id: unknown })._id)
      const extra = await Question.aggregate([
        { $match: { subject, _id: { $nin: existingIds } } },
        { $sample: { size: needed } },
        { $project: QUIZ_PROJECTION },
      ])
      questions = [...questions, ...extra]
    }

    return apiSuccess({ questions, weakChapters })
  } catch (err) {
    return handleApiError(err, 'GET /api/student/assignments')
  }
}

export async function POST(req: Request) {
  const guard = await requireApiRole(ANY_ROLE, { action: 'POST /api/student/assignments' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body
    const input = body as Record<string, unknown>

    const subject = toStr(input.subject, 60)
    const questionId = toStr(input.questionId, 64)

    const fieldErrors: Record<string, string> = {}
    if (!subject) fieldErrors.subject = 'subject is required.'
    if (!questionId) fieldErrors.questionId = 'questionId is required.'
    if (Object.keys(fieldErrors).length > 0) {
      return apiError('VALIDATION_FAILED', { fieldErrors })
    }

    // Always the authenticated caller — never a body-supplied id.
    const studentId = guard.user.id

    await connectToDatabase()

    // Rolling window of the last 10 results per subject.
    const count = await QuizResult.countDocuments({ studentId, subject })
    if (count >= 10) {
      const oldest = await QuizResult.findOne({ studentId, subject }, {}, { sort: { createdAt: 1 } })
      if (oldest) await QuizResult.deleteOne({ _id: oldest._id })
    }

    const result = await QuizResult.create({
      studentId,
      subject,
      chapter: toStr(input.chapter, 4),
      questionId,
      isCorrect: toBool(input.isCorrect),
      // Bounded: an unclamped client-supplied duration skews every analytic
      // built on it.
      timeTaken: toNum(input.timeTaken, 0, 0, 3_600),
    })

    return apiSuccess({ result }, { status: 201 })
  } catch (err) {
    return handleApiError(err, 'POST /api/student/assignments')
  }
}
