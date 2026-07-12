'use server'

import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import FeeRecord from '@/models/FeeRecord'
import StudentMood from '@/models/StudentMood'
import { requireSessionRole } from '@/lib/auth/guard'

/**
 * Admin "Live School Pulse" action layer. Every export is a public POST
 * endpoint, so the action validates the admin role itself before touching
 * the database. Returns only school-wide aggregates (no per-student PII).
 *
 * The four headline cards are DB-backed. The login timeline and anomaly
 * stream on the dashboard remain client-side live-monitoring visuals — there
 * is no event/audit collection backing them yet.
 */

const MS_PER_DAY = 86_400_000

export type AdminMetricKey = 'students' | 'teachers' | 'fees' | 'mood'

export interface AdminPulseMetric {
  key: AdminMetricKey
  value: number
  /** New records in the last 7 days for count metrics; null when not applicable. */
  delta7d: number | null
}

export interface AdminPulseData {
  metrics: AdminPulseMetric[]
  pendingApprovals: number
  generatedAt: string
}

export async function getAdminPulseMetrics(): Promise<AdminPulseData> {
  await requireSessionRole('admin')
  await connectDB()

  const now = Date.now()
  const sevenDaysAgo = new Date(now - 7 * MS_PER_DAY)
  const since24h = new Date(now - MS_PER_DAY)
  const todayStr = new Date(now).toISOString().slice(0, 10)

  const [
    activeStudents,
    newStudents7d,
    activeTeachers,
    newTeachers7d,
    pendingApprovals,
    feeAgg,
    moodAgg,
  ] = await Promise.all([
    User.countDocuments({ role: 'student', status: 'active' }),
    User.countDocuments({ role: 'student', status: 'active', createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ role: 'teacher', status: 'active' }),
    User.countDocuments({ role: 'teacher', status: 'active', createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ status: 'pending' }),
    FeeRecord.aggregate<{ _id: null; total: number }>([
      { $match: { paidDate: todayStr } },
      { $group: { _id: null, total: { $sum: '$paid' } } },
    ]),
    StudentMood.aggregate<{ _id: null; total: number; positive: number }>([
      { $match: { timestamp: { $gte: since24h } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          positive: {
            $sum: { $cond: [{ $in: ['$moodValue', ['Happy', 'Excited']] }, 1, 0] },
          },
        },
      },
    ]),
  ])

  const feesToday = feeAgg[0]?.total ?? 0
  const mood = moodAgg[0]
  const moodPct = mood && mood.total > 0 ? Math.round((mood.positive / mood.total) * 100) : 0

  const metrics: AdminPulseMetric[] = [
    { key: 'students', value: activeStudents, delta7d: newStudents7d },
    { key: 'teachers', value: activeTeachers, delta7d: newTeachers7d },
    { key: 'fees', value: feesToday, delta7d: null },
    { key: 'mood', value: moodPct, delta7d: null },
  ]

  return {
    metrics,
    pendingApprovals,
    generatedAt: new Date(now).toISOString(),
  }
}
