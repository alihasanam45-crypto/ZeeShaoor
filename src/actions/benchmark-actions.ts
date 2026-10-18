'use server'

import { connectDB } from '@/lib/mongodb'
import QuizResult from '@/models/QuizResult'
import { requireSessionRole } from '@/lib/auth/guard'
import { accuracyPct, getActiveClassStudents } from '@/lib/db/quiz-metrics'

/**
 * Benchmark action layer — compares one class's quiz accuracy in a subject
 * against the school-wide average, chapter by chapter.
 */

export interface BenchmarkTopic {
  topic: string
  classAvg: number
  schoolAvg: number
}

export interface BenchmarkData {
  classId: string
  subject: string
  classAverage: number
  schoolAverage: number
  difference: number
  aboveAverage: boolean
  insight: string
  topicBreakdown: BenchmarkTopic[]
}

interface ChapterAgg {
  _id: string | null
  total: number
  correct: number
}

const CHAPTER_GROUP = {
  $group: {
    _id: '$chapter',
    total: { $sum: 1 },
    correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
  },
}

function sumRows(rows: ChapterAgg[]): { total: number; correct: number } {
  return rows.reduce(
    (acc, r) => ({ total: acc.total + r.total, correct: acc.correct + r.correct }),
    { total: 0, correct: 0 },
  )
}

export async function getBenchmark(classId: string, subject: string): Promise<BenchmarkData> {
  await requireSessionRole('teacher', 'admin')
  await connectDB()

  const roster = await getActiveClassStudents(classId)
  const classStudentIds = roster.map((r) => r.studentId)

  const [classAgg, schoolAgg] = await Promise.all([
    QuizResult.aggregate<ChapterAgg>([
      { $match: { subject, studentId: { $in: classStudentIds } } },
      CHAPTER_GROUP,
    ]),
    QuizResult.aggregate<ChapterAgg>([{ $match: { subject } }, CHAPTER_GROUP]),
  ])

  const classTotals = sumRows(classAgg)
  const schoolTotals = sumRows(schoolAgg)
  const classAverage = accuracyPct(classTotals.correct, classTotals.total)
  const schoolAverage = accuracyPct(schoolTotals.correct, schoolTotals.total)
  const difference = Math.round((classAverage - schoolAverage) * 10) / 10
  const aboveAverage = difference >= 0

  const schoolByChapter = new Map(schoolAgg.map((r) => [r._id ?? 'General', r]))
  const topicBreakdown: BenchmarkTopic[] = classAgg
    .map((r) => {
      const topic = r._id ?? 'General'
      const school = schoolByChapter.get(topic)
      return {
        topic,
        classAvg: accuracyPct(r.correct, r.total),
        schoolAvg: school ? accuracyPct(school.correct, school.total) : 0,
      }
    })
    .sort((a, b) => a.topic.localeCompare(b.topic))

  const insight =
    classTotals.total === 0
      ? `No quiz attempts recorded yet for class ${classId} in ${subject}.`
      : aboveAverage
        ? `Class ${classId} is performing ${Math.abs(difference)}% above the school average in ${subject}. Keep reinforcing the current approach.`
        : `Class ${classId} is trailing the school average by ${Math.abs(difference)}% in ${subject}. Review the weakest chapters in the topic breakdown below.`

  return {
    classId,
    subject,
    classAverage,
    schoolAverage,
    difference,
    aboveAverage,
    insight,
    topicBreakdown,
  }
}
