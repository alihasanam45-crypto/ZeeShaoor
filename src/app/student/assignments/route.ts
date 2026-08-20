import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Question from '@/models/Question'
import { ANY_ROLE, requireApiRole } from '@/lib/security/rbac'
import { apiSuccess, handleApiError } from '@/lib/security/errors'

/**
 * Daily practice sample.
 *
 * This handler sits under the page namespace (`/student/assignments`) rather
 * than `/api`, which is why it needs its own guard: the proxy's API branch
 * never matches it, only the page-portal rule does.
 *
 * Two fixes: it was unauthenticated, and `$sample` returned whole documents —
 * including `correctAnswer` — so the daily set shipped its own answer key.
 */

export const dynamic = 'force-dynamic'

const SET_SIZE = 5

/** Answer-free projection. */
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

export async function GET() {
  const guard = await requireApiRole(ANY_ROLE, { action: 'GET /student/assignments' })
  if (guard instanceof NextResponse) return guard

  try {
    await connectToDatabase()

    const user = guard.user
    // Scope the sample to the student's own class level where it is known.
    const stages: Record<string, unknown>[] = []
    if (user.role === 'student' && user.classId) {
      stages.push({ $match: { classLevel: user.classId } })
    }
    stages.push({ $sample: { size: SET_SIZE } }, { $project: QUIZ_PROJECTION })

    const assignments = await Question.aggregate(stages)

    return apiSuccess({ assignments })
  } catch (err) {
    return handleApiError(err, 'GET /student/assignments')
  }
}
