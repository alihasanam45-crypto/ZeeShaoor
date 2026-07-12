import { connectDB } from '@/lib/mongodb'
import StudentMood from '@/models/StudentMood'
import TeacherAlert from '@/models/TeacherAlert'

export interface EngagementScore {
  studentId: string
  score: number
  components: { quizAttempts: number; loginFrequency: number; streak: number }
  trend: 'rising' | 'stable' | 'declining'
}

/**
 * Calculates the engagement score for a single student using:
 *   score = 0.4 × (quiz attempts / max) + 0.4 × (login freq / max) + 0.2 × (streak / max)
 */
export function calculateEngagementScore(
  quizAttempts: number,
  loginFrequency: number,
  streak: number,
): number {
  const MAX_QUIZ = 20
  const MAX_LOGIN = 15
  const MAX_STREAK = 30

  const quizNorm = Math.min(quizAttempts / MAX_QUIZ, 1)
  const loginNorm = Math.min(loginFrequency / MAX_LOGIN, 1)
  const streakNorm = Math.min(streak / MAX_STREAK, 1)

  return 0.4 * quizNorm + 0.4 * loginNorm + 0.2 * streakNorm
}

/**
 * Detects mood stress streaks: 3 consecutive Stressed days → yellow,
 * 5+ → red. Creates or updates TeacherAlert records.
 */
export async function detectStressStreaks(classLevel?: string): Promise<number> {
  await connectDB()

  const matchFilter: Record<string, any> = { moodValue: 'Stressed' }
  if (classLevel) matchFilter.classLevel = classLevel

  const raw = await StudentMood.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          studentId: '$studentId',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        },
        moodCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.studentId': 1, '_id.date': 1 } },
  ])

  const studentDates: Record<string, string[]> = {}
  for (const r of raw) {
    const sid = r._id.studentId
    if (!studentDates[sid]) studentDates[sid] = []
    studentDates[sid].push(r._id.date)
  }

  let alertsCreated = 0
  const now = new Date()

  for (const [studentId, dates] of Object.entries(studentDates)) {
    if (dates.length < 3) continue

    const sorted = dates.sort()
    let streakLen = 1
    let maxStreak = 1

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)
      if (diffDays === 1) {
        streakLen++
        maxStreak = Math.max(maxStreak, streakLen)
      } else {
        streakLen = 1
      }
    }

    if (maxStreak >= 3) {
      const severity = maxStreak >= 5 ? 'red' : 'yellow'
      const msg =
        severity === 'red'
          ? `${studentId} has been stressed for ${maxStreak}+ days. Immediate intervention recommended.`
          : `${studentId} shows ${maxStreak} consecutive stressed days. Monitor closely.`

      const existing = await TeacherAlert.findOne({
        studentId,
        category: 'mood_stress_streak',
        severity,
        acknowledged: false,
      })

      if (!existing) {
        await TeacherAlert.create({
          studentId,
          classLevel: classLevel || 'unknown',
          category: 'mood_stress_streak',
          severity,
          message: msg,
          details: { streakDays: maxStreak, detectedAt: now.toISOString() },
          expiresAt: new Date(now.getTime() + 7 * 86400000),
        })
        alertsCreated++
      }
    }
  }

  return alertsCreated
}

/**
 * Full burnout scan: runs stress streak detection + engagement analysis.
 * Intended to be called once every 24 hours via a cron or Vercel Cron Job.
 */
export async function runBurnoutScan(classLevel?: string) {
  console.log(`[BurnoutPredictor] Starting scan${classLevel ? ` for ${classLevel}` : ''}...`)
  const start = Date.now()

  const stressAlerts = await detectStressStreaks(classLevel)

  console.log(
    `[BurnoutPredictor] Scan complete. ${stressAlerts} stress alerts created. (${Date.now() - start}ms)`,
  )

  return { stressAlertsCreated: stressAlerts, durationMs: Date.now() - start }
}
