import crypto from 'crypto'
import { CLASS_SUBJECT_MATRIX, ALLOWED_CLASS_LEVELS } from '@/models/Question'
import { toNum, toStr, toStrArray } from '@/lib/security/sanitize'

/**
 * Shared, validated shape for question ingestion.
 *
 * Three routes write to the question bank (single create, bulk create, CSV
 * upload). All three previously passed the request body — or a CSV row —
 * straight into `Question.create()`. Two consequences:
 *
 * - `Question._id` is a plain `String` with no default, so a caller could
 *   choose the primary key of any document they wrote, and squat on ids the
 *   importer would later need.
 * - `createdBy` and every other schema field were caller-controlled.
 *
 * This module is the single normalizer. The Mongoose schema's own validators
 * (class/subject matrix, MCQ option counts, chapter format) still run on top;
 * this layer exists so bad input is rejected before it reaches the driver and
 * so the id is always server-generated.
 *
 * Paper-generation logic is untouched — this only governs what may enter the
 * bank, not how papers are built from it.
 */

export const QUESTION_TYPES = ['MCQ', 'Short', 'Long'] as const
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const
const SLO_TAGS = ['Knowledge', 'Comprehension', 'Application'] as const
const SUB_TYPES = ['Theory', 'Numerical_Reasoning'] as const
const CATEGORIES = ['Long_Theory', 'Long_Numerical'] as const

export interface NormalizedQuestion {
  _id: string
  classLevel: string
  subject: string
  chapter: string
  chapterName?: string
  topic?: string
  topicId?: string
  questionType: (typeof QUESTION_TYPES)[number]
  questionText: string
  options?: string[]
  correctAnswer: string
  difficulty: (typeof DIFFICULTIES)[number]
  sloTag?: (typeof SLO_TAGS)[number]
  subType?: (typeof SUB_TYPES)[number]
  questionCategory?: (typeof CATEGORIES)[number]
  boardId?: string
  boardTags?: string[]
  region?: string
  year?: number
  marks?: number
  createdBy: string
}

export type QuestionResult =
  | { ok: true; value: NormalizedQuestion }
  | { ok: false; errors: string[] }

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const s = toStr(value, 40)
  return (allowed as readonly string[]).includes(s) ? (s as T) : undefined
}

/**
 * Validate and normalize one untrusted question.
 *
 * `createdBy` is supplied by the caller's session, never by the payload.
 */
export function normalizeQuestion(input: unknown, createdBy: string): QuestionResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, errors: ['Question must be an object.'] }
  }
  const raw = input as Record<string, unknown>
  const errors: string[] = []

  const classLevel = toStr(raw.classLevel, 4)
  if (!ALLOWED_CLASS_LEVELS.includes(classLevel)) {
    errors.push(`classLevel must be one of: ${ALLOWED_CLASS_LEVELS.join(', ')}.`)
  }

  const subject = toStr(raw.subject, 60)
  if (!subject) {
    errors.push('subject is required.')
  } else if (CLASS_SUBJECT_MATRIX[classLevel] && !CLASS_SUBJECT_MATRIX[classLevel]!.includes(subject)) {
    errors.push(`"${subject}" is not a valid subject for class ${classLevel}.`)
  }

  // Chapter identity is numeric across the codebase — a prose name here is
  // what silently empties chapter-filtered queries.
  const chapter = toStr(raw.chapter, 4)
  if (!/^\d{1,2}$/.test(chapter)) {
    errors.push('chapter must be a chapter number as a string, e.g. "4".')
  }

  const questionType = oneOf(raw.questionType, QUESTION_TYPES)
  if (!questionType) errors.push(`questionType must be one of: ${QUESTION_TYPES.join(', ')}.`)

  const questionText = toStr(raw.questionText, 2000)
  if (questionText.length < 5) errors.push('questionText must be at least 5 characters.')

  const correctAnswer = toStr(raw.correctAnswer, 500)
  if (!correctAnswer) errors.push('correctAnswer is required.')

  const difficulty = oneOf(raw.difficulty, DIFFICULTIES)
  if (!difficulty) errors.push(`difficulty must be one of: ${DIFFICULTIES.join(', ')}.`)

  // Options: accept an array or the CSV pipe-delimited form.
  let options: string[] = []
  if (Array.isArray(raw.options)) {
    options = toStrArray(raw.options, 4, 500)
  } else if (typeof raw.options === 'string' && raw.options.length > 0) {
    options = raw.options
      .split('|')
      .map((o) => toStr(o, 500))
      .filter(Boolean)
      .slice(0, 4)
  }

  if (questionType === 'MCQ') {
    if (options.length < 2) errors.push('MCQ questions require 2–4 options.')
  } else if (options.length > 0) {
    errors.push('Short/Long questions must not carry options.')
  }

  if (errors.length > 0) return { ok: false, errors }

  const currentYear = new Date().getFullYear()
  const yearRaw = raw.year
  const year =
    yearRaw === undefined || yearRaw === null || yearRaw === ''
      ? undefined
      : toNum(yearRaw, 0, 2000, currentYear + 1) || undefined

  const marksRaw = raw.marks
  const marks =
    marksRaw === undefined || marksRaw === null || marksRaw === ''
      ? undefined
      : toNum(marksRaw, 0, 1, 20) || undefined

  return {
    ok: true,
    value: {
      // Server-generated. The schema declares a String `_id` with no default,
      // so leaving this to the payload let callers choose primary keys.
      _id: crypto.randomUUID(),
      classLevel,
      subject,
      chapter,
      chapterName: toStr(raw.chapterName, 120) || undefined,
      topic: toStr(raw.topic, 200) || undefined,
      topicId: toStr(raw.topicId, 20) || undefined,
      questionType: questionType!,
      questionText,
      options: options.length > 0 ? options : undefined,
      correctAnswer,
      difficulty: difficulty!,
      sloTag: oneOf(raw.sloTag, SLO_TAGS),
      subType: oneOf(raw.subType, SUB_TYPES),
      questionCategory: oneOf(raw.questionCategory, CATEGORIES),
      boardId: toStr(raw.boardId, 60) || undefined,
      boardTags: toStrArray(raw.boardTags, 20, 40),
      region: toStr(raw.region, 60) || undefined,
      year,
      marks,
      createdBy,
    },
  }
}

/** Hard ceiling on one import request — bounds memory and write amplification. */
export const MAX_BATCH_QUESTIONS = 2000
