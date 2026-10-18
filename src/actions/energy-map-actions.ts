'use server'

import { connectDB } from '@/lib/mongodb'
import QuizResult from '@/models/QuizResult'
import { requireSessionRole } from '@/lib/auth/guard'
import { accuracyPct, getActiveClassStudents } from '@/lib/db/quiz-metrics'

/**
 * Energy map action layer — quiz accuracy bucketed by time of day, so a
 * teacher can see when a class performs best and request timetable changes.
 */

export interface EnergyBucket {
  timeBlock: string
  startHour: number
  endHour: number
  avgScore: number
  totalAttempts: number
  color: string
}

export interface EnergyMapData {
  classId: string
  subject: string
  buckets: EnergyBucket[]
  peakBlock: string
  peakScore: number
  lowBlock: string
  lowScore: number
  performanceDiff: number
  diffPercent: number
  morningBetter: boolean
  insight: string
}

const TIME_BLOCKS = [
  { timeBlock: 'Early Morning', startHour: 7, endHour: 10 },
  { timeBlock: 'Late Morning', startHour: 10, endHour: 13 },
  { timeBlock: 'Afternoon', startHour: 13, endHour: 16 },
  { timeBlock: 'Evening', startHour: 16, endHour: 19 },
] as const

function scoreColor(score: number): string {
  if (score >= 70) return '#10b981' // emerald
  if (score >= 50) return '#2563eb' // blue
  if (score >= 30) return '#f59e0b' // amber
  return '#f43f5e' // rose
}

function weightedAverage(buckets: EnergyBucket[]): number {
  const attempts = buckets.reduce((sum, b) => sum + b.totalAttempts, 0)
  if (attempts === 0) return 0
  return buckets.reduce((sum, b) => sum + b.avgScore * b.totalAttempts, 0) / attempts
}

export async function getEnergyMap(classId: string, subject: string): Promise<EnergyMapData> {
  await requireSessionRole('teacher')
  await connectDB()

  const roster = await getActiveClassStudents(classId)
  const hourly =
    roster.length === 0
      ? []
      : await QuizResult.aggregate<{ _id: number; total: number; correct: number }>([
          { $match: { subject, studentId: { $in: roster.map((r) => r.studentId) } } },
          {
            $group: {
              _id: { $hour: { date: '$createdAt', timezone: 'Asia/Karachi' } },
              total: { $sum: 1 },
              correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
            },
          },
        ])

  const buckets: EnergyBucket[] = TIME_BLOCKS.map((block) => {
    const rows = hourly.filter((h) => h._id >= block.startHour && h._id < block.endHour)
    const total = rows.reduce((sum, r) => sum + r.total, 0)
    const correct = rows.reduce((sum, r) => sum + r.correct, 0)
    const avgScore = accuracyPct(correct, total)
    return { ...block, avgScore, totalAttempts: total, color: scoreColor(avgScore) }
  })

  const active = buckets.filter((b) => b.totalAttempts > 0)
  const peak = active.length > 0 ? active.reduce((a, b) => (b.avgScore > a.avgScore ? b : a)) : buckets[0]
  const low = active.length > 0 ? active.reduce((a, b) => (b.avgScore < a.avgScore ? b : a)) : buckets[0]

  const performanceDiff = Math.round((peak.avgScore - low.avgScore) * 10) / 10
  const diffPercent = low.avgScore === 0 ? 0 : Math.round((performanceDiff / low.avgScore) * 100)

  const morningBetter = weightedAverage(buckets.slice(0, 2)) >= weightedAverage(buckets.slice(2))

  const insight =
    active.length === 0
      ? `No quiz activity recorded yet for class ${classId} in ${subject} — the energy map will populate as students attempt quizzes.`
      : `Class ${classId} performs best in the ${peak.timeBlock.toLowerCase()} block (${peak.avgScore}%) and weakest in the ${low.timeBlock.toLowerCase()} block (${low.avgScore}%). ${
          morningBetter
            ? `Morning slots suit this class better — consider scheduling ${subject} earlier in the day.`
            : `Afternoon slots suit this class better — consider scheduling ${subject} later in the day.`
        }`

  return {
    classId,
    subject,
    buckets,
    peakBlock: peak.timeBlock,
    peakScore: peak.avgScore,
    lowBlock: low.timeBlock,
    lowScore: low.avgScore,
    performanceDiff,
    diffPercent,
    morningBetter,
    insight,
  }
}
