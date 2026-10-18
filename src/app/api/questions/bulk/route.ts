import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Question from '@/models/Question'
import { STAFF, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import {
  MAX_BATCH_QUESTIONS,
  normalizeQuestion,
  type NormalizedQuestion,
} from '@/lib/security/question-input'

/**
 * Bulk question insert — staff only.
 *
 * Previously unauthenticated, unbounded (an array of any length was iterated
 * with one `create()` per element), and it echoed raw Mongoose error messages —
 * including the colliding document values — back to the caller.
 */
export async function POST(req: Request) {
  const guard = await requireApiRole(STAFF, {
    action: 'POST /api/questions/bulk',
    rateLimit: 'bulkWrite',
  })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    const questions = (body as { questions?: unknown })?.questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return apiError('VALIDATION_FAILED', { message: 'A non-empty questions array is required.' })
    }
    if (questions.length > MAX_BATCH_QUESTIONS) {
      return apiError('PAYLOAD_TOO_LARGE', {
        message: `A single batch may contain at most ${MAX_BATCH_QUESTIONS} questions.`,
      })
    }

    // Validate everything first, then write once. Row errors reference the
    // caller's own input, so they are safe to return.
    const valid: NormalizedQuestion[] = []
    const rowErrors: { row: number; errors: string[] }[] = []

    questions.forEach((raw, index) => {
      const result = normalizeQuestion(raw, guard.user.email)
      if (result.ok) {
        valid.push(result.value)
      } else {
        rowErrors.push({ row: index + 1, errors: result.errors })
      }
    })

    let inserted = 0
    if (valid.length > 0) {
      await connectDB()
      // `ordered: false` lets valid rows land even when a few collide with the
      // unique index; rejected writes are counted, not surfaced verbatim.
      const result = await Question.insertMany(valid, { ordered: false, rawResult: true }).catch(
        (err: unknown) => {
          const nInserted = (err as { insertedCount?: number })?.insertedCount
          if (typeof nInserted === 'number') return { insertedCount: nInserted }
          throw err
        },
      )
      inserted = (result as { insertedCount?: number }).insertedCount ?? 0
    }

    void audit({
      action: 'csv.import',
      severity: 'notice',
      actor: guard.user,
      targetType: 'Question',
      metadata: {
        source: 'api/questions/bulk',
        submitted: questions.length,
        inserted,
        rejected: rowErrors.length,
      },
    })

    return apiSuccess(
      {
        submitted: questions.length,
        inserted,
        rejected: rowErrors.length,
        // Bounded so a 2000-row failure cannot produce a multi-megabyte response.
        errors: rowErrors.slice(0, 50),
      },
      { status: inserted > 0 ? 201 : 422 },
    )
  } catch (err) {
    return handleApiError(err, 'POST /api/questions/bulk')
  }
}
