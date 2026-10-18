'use server'

import { connectDB } from '@/lib/mongodb'
import { requireSessionRole } from '@/lib/auth/guard'
import { getStudentScores } from '@/lib/db/quiz-metrics'

/**
 * Class analytics action layer — per-student quiz accuracy for a class,
 * ranked. Teachers see named data; students only ever see the anonymized
 * distribution with their own point highlighted.
 */

export interface PeerPoint {
  studentId: string
  studentName: string
  subjectScore: number
  rank: number
  percentile: number
  percentileLabel: string
}

export interface AnonymousPoint {
  score: number
  isYou: boolean
  percentile?: number
}

export interface ClassAnalyticsResult {
  data: PeerPoint[]
  topic: string
  averageScore: number
  highestScore: number
  lowestScore: number
  totalStudents: number
}

export interface AnonymousPeerResult {
  data: AnonymousPoint[]
  yourScore: number
  yourRank: number
  topic: string
  totalStudents: number
}

function percentileForRank(rank: number, total: number): number {
  return total === 0 ? 0 : Math.round(((total - rank) / total) * 100)
}

export async function getClassAnalytics(
  classId: string,
  subject: string,
  chapter?: string,
): Promise<ClassAnalyticsResult> {
  await requireSessionRole('teacher')
  await connectDB()

  const scores = await getStudentScores(classId, subject, chapter) // sorted desc
  const total = scores.length

  const data: PeerPoint[] = scores.map((s, i) => {
    const rank = i + 1
    const percentile = percentileForRank(rank, total)
    return {
      studentId: s.studentId,
      studentName: s.studentName,
      subjectScore: s.score,
      rank,
      percentile,
      percentileLabel: `Top ${Math.max(1, 100 - percentile)}%`,
    }
  })

  const values = data.map((d) => d.subjectScore)
  return {
    data,
    topic: chapter ?? 'All Chapters',
    averageScore:
      total === 0 ? 0 : Math.round((values.reduce((a, b) => a + b, 0) / total) * 10) / 10,
    highestScore: total === 0 ? 0 : Math.max(...values),
    lowestScore: total === 0 ? 0 : Math.min(...values),
    totalStudents: total,
  }
}

export async function getAnonymousPeerData(
  classId: string,
  subject: string,
  studentId: string,
  chapter?: string,
): Promise<AnonymousPeerResult> {
  const user = await requireSessionRole('teacher', 'student')
  // a student may only request their own anonymized view
  if (user.role === 'student' && user.id !== studentId) {
    throw new Error('FORBIDDEN: students can only view their own peer comparison')
  }
  await connectDB()

  const scores = await getStudentScores(classId, subject, chapter) // sorted desc
  const total = scores.length
  const yourIndex = scores.findIndex((s) => s.studentId === studentId)

  const data: AnonymousPoint[] = scores.map((s, i) => ({
    score: s.score,
    isYou: s.studentId === studentId,
    percentile: percentileForRank(i + 1, total),
  }))

  return {
    data,
    yourScore: yourIndex === -1 ? 0 : scores[yourIndex].score,
    yourRank: yourIndex === -1 ? 0 : yourIndex + 1,
    topic: chapter ?? 'All Chapters',
    totalStudents: total,
  }
}
