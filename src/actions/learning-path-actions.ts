'use server'

import { connectDB } from '@/lib/mongodb'
import LearningPathModel, { type ILearningPath } from '@/models/LearningPath'
import { requireSessionRole } from '@/lib/auth/guard'
import { getStudentScores } from '@/lib/db/quiz-metrics'

/**
 * Learning path action layer — weekly Strong/Average/Weak grouping driven by
 * quiz accuracy, with manual teacher overrides that survive re-evaluation.
 */

export type LearningGroup = ILearningPath['assignedGroup']

const GROUPS = ['Strong', 'Average', 'Weak'] as const

export interface LearningPathStudent {
  studentId: string
  studentName: string
  averageScore: number
  assignedGroup: LearningGroup
  isManuallyOverridden: boolean
}

export interface GroupHistoryPoint {
  weekStart: string
  strongAvg: number
  averageAvg: number
  weakAvg: number
}

function classifyScore(score: number): LearningGroup {
  if (score >= 70) return 'Strong'
  if (score >= 40) return 'Average'
  return 'Weak'
}

function startOfWeek(from = new Date()): Date {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // back to Monday
  return d
}

export async function getCurrentLearningPaths(
  classId: string,
  subjectId: string,
): Promise<LearningPathStudent[]> {
  await requireSessionRole('teacher')
  await connectDB()

  const latest = await LearningPathModel.findOne({ classId, subjectId })
    .sort({ weekStartDate: -1 })
    .lean()
  if (!latest) return []

  const [paths, scores] = await Promise.all([
    LearningPathModel.find({ classId, subjectId, weekStartDate: latest.weekStartDate }).lean(),
    getStudentScores(classId, subjectId),
  ])
  const scoreByStudent = new Map(scores.map((s) => [s.studentId, s]))

  return paths
    .map((p) => {
      const s = scoreByStudent.get(p.studentId)
      return {
        studentId: p.studentId,
        studentName: s?.studentName ?? p.studentId,
        averageScore: s?.score ?? 0,
        assignedGroup: p.assignedGroup,
        isManuallyOverridden: p.isManuallyOverridden,
      }
    })
    .sort((a, b) => b.averageScore - a.averageScore)
}

export async function reEvaluateGroups(
  classId: string,
  subjectId: string,
): Promise<LearningPathStudent[]> {
  await requireSessionRole('teacher')
  await connectDB()

  const scores = await getStudentScores(classId, subjectId)
  const weekStartDate = startOfWeek()
  const results: LearningPathStudent[] = []

  for (const s of scores) {
    const existing = await LearningPathModel.findOne({
      studentId: s.studentId,
      classId,
      subjectId,
      weekStartDate,
    }).lean()

    // manual overrides survive automatic re-evaluation
    if (existing?.isManuallyOverridden) {
      results.push({
        studentId: s.studentId,
        studentName: s.studentName,
        averageScore: s.score,
        assignedGroup: existing.assignedGroup,
        isManuallyOverridden: true,
      })
      continue
    }

    const assignedGroup = classifyScore(s.score)
    await LearningPathModel.findOneAndUpdate(
      { studentId: s.studentId, classId, subjectId, weekStartDate },
      { $set: { assignedGroup, isManuallyOverridden: false } },
      { upsert: true },
    )
    results.push({
      studentId: s.studentId,
      studentName: s.studentName,
      averageScore: s.score,
      assignedGroup,
      isManuallyOverridden: false,
    })
  }

  return results
}

export async function overrideStudentGroup(
  studentId: string,
  classId: string,
  subjectId: string,
  newGroup: LearningGroup,
) {
  await requireSessionRole('teacher')
  if (!(GROUPS as readonly string[]).includes(newGroup)) throw new Error('Invalid group')
  await connectDB()

  return LearningPathModel.findOneAndUpdate(
    { studentId, classId, subjectId, weekStartDate: startOfWeek() },
    { $set: { assignedGroup: newGroup, isManuallyOverridden: true } },
    { upsert: true, new: true },
  ).lean()
}

export async function getGroupPerformanceHistory(
  classId: string,
  subjectId: string,
): Promise<GroupHistoryPoint[]> {
  await requireSessionRole('teacher')
  await connectDB()

  const paths = await LearningPathModel.find({ classId, subjectId })
    .sort({ weekStartDate: 1 })
    .lean()
  if (paths.length === 0) return []

  const scores = await getStudentScores(classId, subjectId)
  const scoreByStudent = new Map(scores.map((s) => [s.studentId, s.score]))

  const byWeek = new Map<string, { group: LearningGroup; score: number }[]>()
  for (const p of paths) {
    const key = new Date(p.weekStartDate).toISOString().slice(0, 10)
    const rows = byWeek.get(key) ?? []
    rows.push({ group: p.assignedGroup, score: scoreByStudent.get(p.studentId) ?? 0 })
    byWeek.set(key, rows)
  }

  const avg = (rows: { score: number }[]) =>
    rows.length === 0
      ? 0
      : Math.round((rows.reduce((sum, r) => sum + r.score, 0) / rows.length) * 10) / 10

  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8) // last 8 weeks
    .map(([weekStart, rows]) => ({
      weekStart,
      strongAvg: avg(rows.filter((r) => r.group === 'Strong')),
      averageAvg: avg(rows.filter((r) => r.group === 'Average')),
      weakAvg: avg(rows.filter((r) => r.group === 'Weak')),
    }))
}
