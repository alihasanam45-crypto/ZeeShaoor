'use server'

import { connectDB } from '@/lib/mongodb'
import SyllabusTimelineModel, { type IChapter } from '@/models/SyllabusTimeline'
import { requireSessionRole } from '@/lib/auth/guard'

/**
 * Pacing action layer — syllabus timeline per class+subject, completion
 * velocity vs the exam date, and condensation suggestions when behind.
 */

const MS_PER_DAY = 86_400_000
const PRIORITIES = ['High', 'Medium', 'Low'] as const

export interface PacingData {
  totalChapters: number
  completedChapters: number
  daysElapsed: number
  daysRemaining: number
  velocity: number
  finishRelativeToExam: number
  finishString: string
  onTrack: boolean
  condensationSuggestions: IChapter[]
}

export interface CondenseSuggestion {
  chapterName: string
  priorityLevel: string
  estimatedDays: number
  reason: string
}

function suggestCondensable(chapters: IChapter[], deficitDays: number): IChapter[] {
  // Low-priority incomplete chapters first, then Medium, largest estimates
  // first — stop once enough days are recovered. High priority is never cut.
  const candidates = chapters
    .filter((ch) => !ch.isCompleted && ch.priorityLevel !== 'High')
    .sort((a, b) => {
      if (a.priorityLevel !== b.priorityLevel) return a.priorityLevel === 'Low' ? -1 : 1
      return b.estimatedDays - a.estimatedDays
    })

  const picked: IChapter[] = []
  let recovered = 0
  for (const ch of candidates) {
    if (recovered >= deficitDays) break
    picked.push(ch)
    recovered += Math.ceil(ch.estimatedDays / 2) // condensing ≈ halves the time
  }
  return picked
}

function buildPacing(chapters: IChapter[], examStartDate: Date, trackedSince: Date): PacingData {
  const now = new Date()
  const totalChapters = chapters.length
  const completedChapters = chapters.filter((ch) => ch.isCompleted).length

  const daysElapsed = Math.max(0, Math.floor((now.getTime() - trackedSince.getTime()) / MS_PER_DAY))
  const daysRemaining = Math.max(0, Math.ceil((examStartDate.getTime() - now.getTime()) / MS_PER_DAY))

  const weeksElapsed = Math.max(1, daysElapsed / 7)
  const velocity = Math.round((completedChapters / weeksElapsed) * 10) / 10

  const remainingDays = chapters
    .filter((ch) => !ch.isCompleted)
    .reduce((sum, ch) => sum + ch.estimatedDays, 0)
  const finishRelativeToExam = daysRemaining - remainingDays
  const onTrack = finishRelativeToExam >= 0

  const finishString = onTrack
    ? finishRelativeToExam === 0
      ? 'Projected to finish exactly on exam day'
      : `Projected to finish ${finishRelativeToExam} day(s) before the exam`
    : `Projected to finish ${Math.abs(finishRelativeToExam)} day(s) AFTER the exam starts`

  return {
    totalChapters,
    completedChapters,
    daysElapsed,
    daysRemaining,
    velocity,
    finishRelativeToExam,
    finishString,
    onTrack,
    condensationSuggestions: onTrack ? [] : suggestCondensable(chapters, Math.abs(finishRelativeToExam)),
  }
}

export async function getTimeline(classId: string, subjectId: string) {
  await requireSessionRole('teacher')
  await connectDB()

  return SyllabusTimelineModel.findOne({ classId, subjectId }).lean()
}

export async function calculatePacing(
  classId: string,
  subjectId: string,
): Promise<PacingData | null> {
  await requireSessionRole('teacher')
  await connectDB()

  const timeline = await SyllabusTimelineModel.findOne({ classId, subjectId }).lean()
  if (!timeline) return null

  return buildPacing(
    timeline.chapters,
    new Date(timeline.examStartDate),
    new Date(timeline.createdAt),
  )
}

export interface UpsertChapterInput {
  chapterName: string
  priorityLevel?: IChapter['priorityLevel']
  estimatedDays: number
  isCompleted?: boolean
}

export async function upsertTimeline(
  classId: string,
  subjectId: string,
  examStartDate: string,
  chapters: UpsertChapterInput[],
) {
  await requireSessionRole('teacher')
  if (!classId || !subjectId) throw new Error('classId and subjectId are required')

  const exam = new Date(examStartDate)
  if (Number.isNaN(exam.getTime())) throw new Error('Invalid examStartDate')
  if (!Array.isArray(chapters) || chapters.length === 0) {
    throw new Error('At least one chapter is required')
  }

  const sanitized = chapters.map((ch) => ({
    chapterName: String(ch.chapterName ?? '').trim().slice(0, 200),
    priorityLevel:
      ch.priorityLevel && (PRIORITIES as readonly string[]).includes(ch.priorityLevel)
        ? ch.priorityLevel
        : ('Medium' as IChapter['priorityLevel']),
    estimatedDays: Math.max(1, Math.round(Number(ch.estimatedDays) || 1)),
    isCompleted: !!ch.isCompleted,
  }))
  if (sanitized.some((ch) => !ch.chapterName)) throw new Error('Every chapter needs a name')

  await connectDB()
  return SyllabusTimelineModel.findOneAndUpdate(
    { classId, subjectId },
    { $set: { examStartDate: exam, chapters: sanitized } },
    { new: true, upsert: true, runValidators: true },
  ).lean()
}

export async function markChapterComplete(
  classId: string,
  subjectId: string,
  chapterName: string,
) {
  await requireSessionRole('teacher')
  await connectDB()

  const doc = await SyllabusTimelineModel.findOne({ classId, subjectId })
  if (!doc) throw new Error('Timeline not found')

  const chapter = doc.chapters.find((ch) => ch.chapterName === chapterName)
  if (!chapter) throw new Error('Chapter not found')

  if (!chapter.isCompleted) {
    chapter.isCompleted = true
    chapter.completedOnDate = new Date()
    doc.markModified('chapters')
    await doc.save()
  }
  return doc.toObject()
}

export async function getCondensationSuggestions(
  classId: string,
  subjectId: string,
): Promise<CondenseSuggestion[]> {
  await requireSessionRole('teacher')
  await connectDB()

  const timeline = await SyllabusTimelineModel.findOne({ classId, subjectId }).lean()
  if (!timeline) return []

  const pacing = buildPacing(
    timeline.chapters,
    new Date(timeline.examStartDate),
    new Date(timeline.createdAt),
  )
  if (pacing.onTrack) return []

  const deficit = Math.abs(pacing.finishRelativeToExam)
  return pacing.condensationSuggestions.map((ch) => ({
    chapterName: ch.chapterName,
    priorityLevel: ch.priorityLevel,
    estimatedDays: ch.estimatedDays,
    reason: `${ch.priorityLevel}-priority chapter estimated at ${ch.estimatedDays} day(s); condensing it to key concepts helps recover the ${deficit}-day deficit before the exam.`,
  }))
}
