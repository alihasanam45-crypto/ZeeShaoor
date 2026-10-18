'use server'

import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import BrainMeterModel from '@/models/BrainMeter'
import Streak from '@/models/Streak'
import Result from '@/models/Result'
import QuizResult from '@/models/QuizResult'
import CalendarEvent from '@/models/CalendarEvent'
import { requireSessionRole } from '@/lib/auth/guard'

/**
 * Student dashboard action layer — everything the dashboard renders in one
 * round trip. Student-side records (BrainMeter, Streak, QuizResult, Result)
 * are keyed by the User id, matching the existing /api/student/* routes.
 *
 * Every export of this 'use server' file is a public POST endpoint, so the
 * action validates the session itself and only ever serves the caller's own
 * data (studentId always comes from the session, never from arguments).
 */

const MS_PER_DAY = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export interface DashboardBrainScore {
  subject: string
  score: number
  trend: 'up' | 'down' | 'same'
}

export interface DashboardExam {
  subject: string
  date: string
  type: string
}

export interface StudentDashboardData {
  student: {
    name: string
    classLabel: string
  }
  /** Latest week's average mastery minus the previous week's, or null with <2 weeks of data. */
  weeklyGrowth: number | null
  metrics: {
    overallScore: number
    dayStreak: number
    rank: number | null
    classSize: number
    papersDone: number
  }
  brainScores: DashboardBrainScore[]
  /** Enrolled subjects for quick access; empty when the profile has none recorded. */
  subjects: string[]
  upcomingExams: DashboardExam[]
  boardCountdown: { days: number; label: string } | null
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

function trendOf(latest: number, previous: number | undefined): DashboardBrainScore['trend'] {
  if (previous === undefined) return 'same'
  if (latest > previous + 1) return 'up'
  if (latest < previous - 1) return 'down'
  return 'same'
}

/** Per-subject mastery from QuizResult accuracy — fallback when no BrainMeter records exist yet. */
async function brainScoresFromQuizResults(studentId: string): Promise<DashboardBrainScore[]> {
  const twoWeeksAgo = new Date(Date.now() - 14 * MS_PER_DAY)
  const agg = await QuizResult.aggregate<{
    _id: string
    total: number
    correct: number
    recentTotal: number
    recentCorrect: number
  }>([
    { $match: { studentId } },
    {
      $group: {
        _id: '$subject',
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        recentTotal: { $sum: { $cond: [{ $gte: ['$createdAt', twoWeeksAgo] }, 1, 0] } },
        recentCorrect: {
          $sum: { $cond: [{ $and: ['$isCorrect', { $gte: ['$createdAt', twoWeeksAgo] }] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return agg.map((row) => {
    const score = row.total === 0 ? 0 : Math.round((row.correct / row.total) * 100)
    const earlierTotal = row.total - row.recentTotal
    const earlierCorrect = row.correct - row.recentCorrect
    const recentAcc = row.recentTotal === 0 ? null : (row.recentCorrect / row.recentTotal) * 100
    const earlierAcc = earlierTotal === 0 ? null : (earlierCorrect / earlierTotal) * 100
    return {
      subject: row._id,
      score,
      trend:
        recentAcc === null || earlierAcc === null
          ? ('same' as const)
          : trendOf(recentAcc, earlierAcc),
    }
  })
}

export async function getStudentDashboardMetrics(): Promise<StudentDashboardData> {
  const user = await requireSessionRole('student')
  await connectDB()

  const todayStr = new Date().toISOString().slice(0, 10)

  const [profile, brainRecords, streak, papersDone, examEvents] = await Promise.all([
    User.findById(user.id).select('name classId grade enrolledSubjects').lean(),
    BrainMeterModel.find({ studentId: user.id }).sort({ subject: 1 }).lean(),
    Streak.findOne({ studentId: user.id }).select('currentStreak').lean(),
    Result.countDocuments({ studentId: user.id }),
    CalendarEvent.find({
      category: 'exam',
      status: { $ne: 'completed' },
      date: { $gte: todayStr },
    })
      .sort({ date: 1 })
      .limit(10)
      .lean(),
  ])

  // --------- Subject mastery (BrainMeter primary, QuizResult fallback) ---------
  const recordsWithWeeks = brainRecords.filter((r) => r.weeklyData.length > 0)
  let brainScores: DashboardBrainScore[] = recordsWithWeeks.map((r) => {
    const weeks = [...r.weeklyData].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    const latest = weeks[weeks.length - 1]
    const previous = weeks[weeks.length - 2]
    return {
      subject: r.subject,
      score: Math.round(latest.overallScore),
      trend: trendOf(latest.overallScore, previous?.overallScore),
    }
  })
  if (brainScores.length === 0) {
    brainScores = await brainScoresFromQuizResults(user.id)
  }

  const overallScore =
    brainScores.length === 0
      ? 0
      : Math.round(brainScores.reduce((sum, s) => sum + s.score, 0) / brainScores.length)

  // --------- Week-over-week growth (needs ≥2 weeks of BrainMeter data) ---------
  let weeklyGrowth: number | null = null
  const latestAvgs: number[] = []
  const previousAvgs: number[] = []
  for (const r of recordsWithWeeks) {
    const weeks = [...r.weeklyData].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    if (weeks.length >= 2) {
      latestAvgs.push(weeks[weeks.length - 1].overallScore)
      previousAvgs.push(weeks[weeks.length - 2].overallScore)
    }
  }
  if (latestAvgs.length > 0) {
    const latestAvg = latestAvgs.reduce((a, b) => a + b, 0) / latestAvgs.length
    const previousAvg = previousAvgs.reduce((a, b) => a + b, 0) / previousAvgs.length
    weeklyGrowth = Math.round((latestAvg - previousAvg) * 10) / 10
  }

  // --------- Class rank by overall quiz accuracy among classmates ---------
  const peerFilter: Record<string, unknown> = { role: 'student', status: 'active' }
  if (profile?.classId) peerFilter.classId = profile.classId
  const peers = await User.find(peerFilter).select('_id').lean()
  const peerIds = peers.map((p) => String(p._id))

  const rankAgg = await QuizResult.aggregate<{ _id: string; accuracy: number }>([
    { $match: { studentId: { $in: peerIds } } },
    {
      $group: {
        _id: '$studentId',
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
      },
    },
    { $project: { accuracy: { $divide: ['$correct', '$total'] } } },
    { $sort: { accuracy: -1 } },
  ])
  const rankIndex = rankAgg.findIndex((r) => r._id === user.id)

  // --------- Upcoming exams for this student's class ---------
  const classId = profile?.classId
  const relevantExams = examEvents.filter(
    (e) => !e.affectedClasses?.length || (classId ? e.affectedClasses.includes(classId) : true),
  )
  const upcomingExams: DashboardExam[] = relevantExams.slice(0, 3).map((e) => ({
    subject: e.title,
    type: e.description && e.description.length <= 28 ? e.description : 'Exam',
    date: formatShortDate(e.date),
  }))

  const boardEvent = relevantExams.find((e) => /board/i.test(e.title)) ?? relevantExams[0]
  const boardCountdown = boardEvent
    ? {
        days: Math.max(0, Math.ceil((new Date(boardEvent.date).getTime() - Date.now()) / MS_PER_DAY)),
        label: boardEvent.title,
      }
    : null

  const classLabel = profile?.classId
    ? `Class ${profile.classId}`
    : profile?.grade
      ? `Grade ${profile.grade}`
      : 'Class not set'

  return {
    student: {
      name: profile?.name ?? 'Student',
      classLabel,
    },
    weeklyGrowth,
    metrics: {
      overallScore,
      dayStreak: streak?.currentStreak ?? 0,
      rank: rankIndex === -1 ? null : rankIndex + 1,
      classSize: peerIds.length,
      papersDone,
    },
    brainScores,
    subjects: (profile?.enrolledSubjects ?? []).map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1),
    ),
    upcomingExams,
    boardCountdown,
  }
}
