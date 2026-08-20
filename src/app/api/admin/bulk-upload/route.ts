import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'
import { ADMIN_ONLY, requireApiRole } from '@/lib/security/rbac'
import { apiError, apiSuccess, handleApiError } from '@/lib/security/errors'
import { audit } from '@/lib/security/audit'
import { csvCell } from '@/lib/security/sanitize'
import {
  MAX_BATCH_QUESTIONS,
  normalizeQuestion,
  type NormalizedQuestion,
} from '@/lib/security/question-input'

/**
 * CSV question import — admin only.
 *
 * Fixes applied to this route:
 * - It was completely unauthenticated: anyone on the internet could inject
 *   arbitrary questions into every school's bank.
 * - File size was unbounded; `file.text()` buffered the whole upload into
 *   memory before any check.
 * - Row validation was duplicated here and diverged from the schema. It now
 *   delegates to the shared normalizer, which also generates `_id`
 *   server-side (the schema's String `_id` had no default, so a crafted CSV
 *   could claim chosen primary keys).
 * - Mongo `writeErrors[].errmsg` was returned verbatim, leaking index names
 *   and document contents.
 * - The echoed failure rows contained the caller's full submitted data; only
 *   the row number and validation reasons are returned now.
 */

const MAX_CSV_BYTES = 5 * 1024 * 1024 // 5 MB

/** Column headers the importer accepts. */
export const CSV_HEADERS = [
  'classLevel',
  'subject',
  'chapter',
  'questionType',
  'questionText',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'correctAnswer',
  'difficulty',
  'boardId',
  'year',
  'marks',
] as const

type CSVRow = Record<(typeof CSV_HEADERS)[number], string>

/** Fold the four option columns into the array shape the normalizer expects. */
function toQuestionInput(row: Partial<CSVRow>): Record<string, unknown> {
  const options = [row.option_a, row.option_b, row.option_c, row.option_d]
    .map((o) => (typeof o === 'string' ? o.trim() : ''))
    .filter(Boolean)

  return {
    classLevel: row.classLevel,
    subject: row.subject,
    chapter: row.chapter,
    questionType: row.questionType,
    questionText: row.questionText,
    options,
    correctAnswer: row.correctAnswer,
    difficulty: row.difficulty,
    boardId: row.boardId,
    year: row.year,
    marks: row.marks,
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(ADMIN_ONLY, {
    action: 'POST /api/admin/bulk-upload',
    rateLimit: 'bulkWrite',
  })
  if (guard instanceof NextResponse) return guard

  const startTime = Date.now()

  try {
    // Reject oversized uploads before buffering anything.
    const declared = Number(request.headers.get('content-length') ?? '0')
    if (Number.isFinite(declared) && declared > MAX_CSV_BYTES) {
      return apiError('PAYLOAD_TOO_LARGE', { message: 'CSV must be 5 MB or smaller.' })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return apiError('VALIDATION_FAILED', { message: 'Expected multipart/form-data.' })
    }

    const file = formData.get('file')
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.csv')) {
      return apiError('VALIDATION_FAILED', { message: 'A .csv file is required.' })
    }
    if (file.size > MAX_CSV_BYTES) {
      return apiError('PAYLOAD_TOO_LARGE', { message: 'CSV must be 5 MB or smaller.' })
    }

    const csvText = await file.text()
    if (!csvText.trim()) {
      return apiError('VALIDATION_FAILED', { message: 'The CSV file is empty.' })
    }

    const parsed = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => v.trim(),
    })

    if (parsed.errors.length > 0) {
      // Papaparse messages describe the caller's own file, so they are safe —
      // but bound how many are echoed back.
      return apiError('VALIDATION_FAILED', {
        message: `CSV parse error: ${parsed.errors
          .slice(0, 5)
          .map((e) => e.message)
          .join('; ')}`,
      })
    }

    const rows = parsed.data
    if (rows.length > MAX_BATCH_QUESTIONS) {
      return apiError('PAYLOAD_TOO_LARGE', {
        message: `A single import may contain at most ${MAX_BATCH_QUESTIONS} rows.`,
      })
    }

    const validDocs: NormalizedQuestion[] = []
    const rowErrors: { row: number; errors: string[] }[] = []

    rows.forEach((row, i) => {
      // +2: the array is 0-based and line 1 is the header, so this matches what
      // the admin sees in their spreadsheet.
      const rowNumber = i + 2
      const result = normalizeQuestion(toQuestionInput(row), guard.user.email)
      if (result.ok) validDocs.push(result.value)
      else rowErrors.push({ row: rowNumber, errors: result.errors })
    })

    let inserted = 0
    if (validDocs.length > 0) {
      await connectDB()
      const result = await QuestionModel.insertMany(validDocs, {
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
        source: 'api/admin/bulk-upload',
        fileName: file.name.slice(0, 120),
        fileSize: file.size,
        totalRows: rows.length,
        inserted,
        rejected: rowErrors.length,
        durationMs: Date.now() - startTime,
      },
    })

    return apiSuccess(
      {
        totalRows: rows.length,
        inserted,
        failed: rowErrors.length,
        skipped: rows.length - validDocs.length,
        errors: rowErrors.slice(0, 50),
        durationMs: Date.now() - startTime,
      },
      { status: inserted > 0 ? 200 : 422 },
    )
  } catch (err) {
    return handleApiError(err, 'POST /api/admin/bulk-upload')
  }
}

/**
 * Template download — admin only.
 *
 * Cells go through `csvCell`, which quotes every value and prefixes anything
 * starting with `=`, `+`, `-` or `@` so Excel and Sheets treat it as text
 * rather than a formula.
 */
export async function GET() {
  const guard = await requireApiRole(ADMIN_ONLY, { action: 'GET /api/admin/bulk-upload' })
  if (guard instanceof NextResponse) return guard

  const sampleRows = [
    // `chapter` is the chapter NUMBER, matching the schema's /^\d{1,2}$/ rule.
    ['9', 'Physics', '1', 'MCQ', 'What is the SI unit of force?', 'Joule', 'Newton', 'Pascal', 'Watt', 'Newton', 'Medium', 'BISE Lahore', '2023', '1'],
    ['10', 'Urdu', '2', 'Short', 'What is the central theme of the poem?', '', '', '', '', 'The theme is nature.', 'Easy', 'BISE Lahore', '2024', '2'],
  ]

  const csvContent = [
    CSV_HEADERS.join(','),
    ...sampleRows.map((row) => row.map(csvCell).join(',')),
  ].join('\n')

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="zeeshaoor_questions_template.csv"',
      // Prevents a browser from ever rendering this inline.
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  })
}
