import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Question from '@/models/Question'
import { ANY_ROLE, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError } from '@/lib/security/errors'
import { toEnumOptional, toPagination, toStr } from '@/lib/security/sanitize'
import { QUESTION_TYPES } from '@/lib/security/question-input'

/**
 * Practice questions for students.
 *
 * The critical fix here is the projection. This route ran
 * `Question.find(filter).lean()` with no field selection, so every response
 * included `correctAnswer` — a complete answer key for the question bank,
 * served to any unauthenticated caller. Students now receive question content
 * only; staff, who legitimately author and mark from the answers, keep the
 * full document.
 *
 * It was also unbounded: `.lean()` with no limit returned every matching
 * question, and the chapter list was built by pulling all of them into memory.
 */

/** Fields safe to expose to a student. Note the absence of `correctAnswer`. */
const STUDENT_PROJECTION = {
  classLevel: 1,
  subject: 1,
  chapter: 1,
  chapterName: 1,
  topic: 1,
  questionType: 1,
  questionText: 1,
  options: 1,
  difficulty: 1,
  marks: 1,
} as const

export async function GET(req: Request) {
  const guard = await requireApiRole(ANY_ROLE, { action: 'GET /api/student/questions' })
  if (guard instanceof NextResponse) return guard

  try {
    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = toPagination(searchParams, 100)

    const classLevel = toStr(searchParams.get('classLevel'), 4)
    const subject = toStr(searchParams.get('subject'), 60)

    if (!classLevel || !subject) {
      return apiError('VALIDATION_FAILED', {
        message: 'classLevel and subject are both required.',
      })
    }

    const user = guard.user

    // A student may only request their own class level — otherwise they could
    // read any other year's bank by changing the parameter.
    if (user.role === 'student' && user.classId && classLevel !== user.classId) {
      return apiError('FORBIDDEN', {
        message: 'You can only access questions for your own class.',
      })
    }

    const filter: Record<string, unknown> = { classLevel, subject }

    const chapter = toStr(searchParams.get('chapter'), 4)
    if (chapter) filter.chapter = chapter

    const type = toEnumOptional(searchParams.get('type'), QUESTION_TYPES)
    if (type) filter.questionType = type

    await connectToDatabase()

    const projection = user.role === 'student' ? STUDENT_PROJECTION : {}

    const [questions, total, chapters] = await Promise.all([
      Question.find(filter, projection).skip(skip).limit(limit).lean(),
      Question.countDocuments(filter),
      // Distinct runs in the database instead of materializing every document.
      Question.distinct('chapter', { classLevel, subject }),
    ])

    return apiSuccess({
      questions,
      chapters: (chapters as string[]).sort((a, b) => Number(a) - Number(b)),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err, 'GET /api/student/questions')
  }
}
