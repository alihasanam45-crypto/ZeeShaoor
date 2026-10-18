import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Question from '@/models/Question'
import { ANY_ROLE, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { toStr } from '@/lib/security/sanitize'

/**
 * Quiz submission and grading.
 *
 * Fixed here:
 * - The endpoint was unauthenticated.
 * - It did not grade. `finalScore` was `Math.random()`, so every submission
 *   produced a fabricated result and awarded XP for it. Marks that appear in a
 *   student record must be derived from stored data, never invented and never
 *   accepted from the client.
 *
 * Grading now compares each answer against `correctAnswer` server-side. The
 * client sends question ids and the student's selections; it is never trusted
 * to say whether an answer was right.
 */

const MAX_ANSWERS = 200
const XP_PER_CORRECT = 50

interface SubmittedAnswer {
  questionId: string
  selected: string
}

/** Normalize for comparison: case- and whitespace-insensitive. */
function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function POST(req: Request) {
  const guard = await requireApiRole(ANY_ROLE, { action: 'POST /student/submit' })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    const rawAnswers = (body as { answers?: unknown })?.answers
    if (!Array.isArray(rawAnswers) || rawAnswers.length === 0) {
      return apiError('VALIDATION_FAILED', { message: 'A non-empty answers array is required.' })
    }
    if (rawAnswers.length > MAX_ANSWERS) {
      return apiError('PAYLOAD_TOO_LARGE', {
        message: `At most ${MAX_ANSWERS} answers may be submitted at once.`,
      })
    }

    const answers: SubmittedAnswer[] = rawAnswers
      .map((a) => ({
        questionId: toStr((a as { questionId?: unknown })?.questionId, 64),
        selected: toStr((a as { selected?: unknown })?.selected, 500),
      }))
      .filter((a) => a.questionId.length > 0)

    if (answers.length === 0) {
      return apiError('VALIDATION_FAILED', {
        message: 'Each answer must carry a questionId.',
      })
    }

    await connectToDatabase()

    // Fetch the authoritative answers for exactly the submitted ids.
    const questions = await Question.find(
      { _id: { $in: answers.map((a) => a.questionId) } },
      { correctAnswer: 1 },
    ).lean()

    const answerKey = new Map(
      questions.map((q) => [String(q._id), normalizeAnswer(String(q.correctAnswer ?? ''))]),
    )

    let correctCount = 0
    let gradedCount = 0
    const perQuestion: { questionId: string; correct: boolean }[] = []

    for (const answer of answers) {
      const expected = answerKey.get(answer.questionId)
      // An id with no matching question is skipped rather than counted — it
      // must not be able to inflate or deflate the denominator.
      if (expected === undefined) continue

      gradedCount++
      const isCorrect = normalizeAnswer(answer.selected) === expected
      if (isCorrect) correctCount++
      perQuestion.push({ questionId: answer.questionId, correct: isCorrect })
    }

    if (gradedCount === 0) {
      return apiError('VALIDATION_FAILED', {
        message: 'None of the submitted questions could be found.',
      })
    }

    const accuracy = Math.round((correctCount / gradedCount) * 1000) / 10
    const xpGained = correctCount * XP_PER_CORRECT

    void audit({
      action: 'student.action',
      actor: guard.user,
      targetType: 'QuizSubmission',
      metadata: {
        operation: 'submit',
        graded: gradedCount,
        correct: correctCount,
        accuracy,
      },
    })

    return apiSuccess({
      score: correctCount,
      total: gradedCount,
      accuracy,
      xp: xpGained,
      results: perQuestion,
    })
  } catch (err) {
    return handleApiError(err, 'POST /student/submit')
  }
}
