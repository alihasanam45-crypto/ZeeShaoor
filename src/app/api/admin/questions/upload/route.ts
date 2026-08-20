import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Question from '@/models/Question'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError, readJsonBody } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import {
  MAX_BATCH_QUESTIONS,
  normalizeQuestion,
  type NormalizedQuestion,
} from '@/lib/security/question-input'

/**
 * JSON-row question import — admin only.
 *
 * Was unauthenticated, unbounded, and returned raw `err.message` per failed
 * row. Shares the single normalizer with /api/questions and the CSV upload so
 * all three ingestion paths enforce identical rules.
 */
export async function POST(req: Request) {
  const guard = await requireApiRole(ADMIN_ONLY, {
    action: 'POST /api/admin/questions/upload',
    rateLimit: 'bulkWrite',
  })
  if (guard instanceof NextResponse) return guard

  try {
    const body = await readJsonBody(req)
    if (body instanceof NextResponse) return body

    const rows = (body as { rows?: unknown })?.rows
    if (!Array.isArray(rows) || rows.length === 0) {
      return apiError('VALIDATION_FAILED', { message: 'A non-empty rows array is required.' })
    }
    if (rows.length > MAX_BATCH_QUESTIONS) {
      return apiError('PAYLOAD_TOO_LARGE', {
        message: `A single import may contain at most ${MAX_BATCH_QUESTIONS} rows.`,
      })
    }

    const valid: NormalizedQuestion[] = []
    const rowErrors: { row: number; errors: string[] }[] = []

    rows.forEach((raw, index) => {
      const result = normalizeQuestion(raw, guard.user.email)
      if (result.ok) valid.push(result.value)
      else rowErrors.push({ row: index + 1, errors: result.errors })
    })

    let inserted = 0
    if (valid.length > 0) {
      await connectToDatabase()
      const result = await Question.insertMany(valid, {
        ordered: false,
        rawResult: true,
      }).catch((err: unknown) => {
        const count = (err as { insertedCount?: number })?.insertedCount
        if (typeof count === 'number') return { insertedCount: count }
        throw err
      })
      inserted = (result as { insertedCount?: number }).insertedCount ?? 0
    }

    void audit({
      action: 'csv.import',
      severity: 'notice',
      actor: guard.user,
      targetType: 'Question',
      metadata: {
        source: 'api/admin/questions/upload',
        submitted: rows.length,
        inserted,
        rejected: rowErrors.length,
      },
    })

    return apiSuccess(
      {
        submitted: rows.length,
        inserted,
        rejected: rowErrors.length,
        errors: rowErrors.slice(0, 50),
      },
      { status: inserted > 0 ? 200 : 422 },
    )
  } catch (err) {
    return handleApiError(err, 'POST /api/admin/questions/upload')
  }
}
