'use server'

import { connectDB } from '@/lib/mongodb'
import ProfessionalDevelopmentModel, { type ITermGoal } from '@/models/ProfessionalDevelopment'
import TeacherJournalModel from '@/models/TeacherJournal'
import { requireSessionRole } from '@/lib/auth/guard'

/**
 * Teacher growth action layer — PD hours, term goals and the private
 * reflection journal.
 *
 * Every export is a public POST endpoint, so each action validates the
 * session role itself. Journal reflectionText is PRIVATE to the owning
 * teacher: admin aggregates (getAllTeachersPD) only ever expose counts.
 */

const CURRENT_ACADEMIC_YEAR = '2025-2026'

export async function getMyPD() {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const existing = await ProfessionalDevelopmentModel.findOne({ teacherId: user.id }).lean()
  if (existing) return existing

  const created = await ProfessionalDevelopmentModel.create({
    teacherId: user.id,
    academicYear: CURRENT_ACADEMIC_YEAR,
  })
  return created.toObject()
}

export async function getMyJournalEntries() {
  const user = await requireSessionRole('teacher')
  await connectDB()

  return TeacherJournalModel.find({ teacherId: user.id })
    .sort({ entryDate: -1 })
    .limit(100)
    .lean()
}

export interface UpsertPDInput {
  pdHoursCompleted?: number
  pdHoursTarget?: number
  termGoals?: ITermGoal[]
  academicYear?: string
}

export async function upsertPD(data: UpsertPDInput) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const update: Record<string, unknown> = {}
  if (typeof data.pdHoursCompleted === 'number' && Number.isFinite(data.pdHoursCompleted)) {
    update.pdHoursCompleted = Math.max(0, data.pdHoursCompleted)
  }
  if (typeof data.pdHoursTarget === 'number' && Number.isFinite(data.pdHoursTarget)) {
    update.pdHoursTarget = Math.max(1, data.pdHoursTarget)
  }
  if (Array.isArray(data.termGoals)) {
    update.termGoals = data.termGoals
      .filter((g) => typeof g?.goalText === 'string' && g.goalText.trim().length > 0)
      .map((g) => ({ goalText: g.goalText.trim().slice(0, 500), isCompleted: !!g.isCompleted }))
  }
  if (typeof data.academicYear === 'string' && data.academicYear.trim()) {
    update.academicYear = data.academicYear.trim()
  }

  return ProfessionalDevelopmentModel.findOneAndUpdate(
    { teacherId: user.id },
    { $set: update },
    { new: true, upsert: true, runValidators: true },
  ).lean()
}

export async function toggleGoal(goalIndex: number) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const doc = await ProfessionalDevelopmentModel.findOne({ teacherId: user.id })
  if (!doc) throw new Error('PD record not found')

  const goal = doc.termGoals[goalIndex]
  if (!goal) throw new Error('Goal not found')

  goal.isCompleted = !goal.isCompleted
  doc.markModified('termGoals')
  await doc.save()
  return doc.toObject()
}

export async function addJournalEntry(reflectionText: string) {
  const user = await requireSessionRole('teacher')
  if (typeof reflectionText !== 'string' || !reflectionText.trim()) {
    throw new Error('Reflection text is required')
  }
  await connectDB()

  const entry = await TeacherJournalModel.create({
    teacherId: user.id,
    entryDate: new Date(),
    reflectionText: reflectionText.trim().slice(0, 10000),
  })
  return entry.toObject()
}

export async function deleteJournalEntry(entryId: string) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  // teacherId in the filter guarantees a teacher can only delete their own entry
  const result = await TeacherJournalModel.deleteOne({ _id: entryId, teacherId: user.id })
  if (result.deletedCount === 0) throw new Error('Journal entry not found')
  return { success: true }
}

/**
 * Admin-only aggregate across all teachers. Exposes PD hours, goal progress
 * and journal ENTRY COUNTS only — never reflectionText.
 */
export async function getAllTeachersPD() {
  await requireSessionRole('admin')
  await connectDB()

  const [pds, journalCounts] = await Promise.all([
    ProfessionalDevelopmentModel.find({}).sort({ pdHoursCompleted: -1 }).lean(),
    TeacherJournalModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$teacherId', count: { $sum: 1 } } },
    ]),
  ])

  const countByTeacher = new Map(journalCounts.map((c) => [c._id, c.count]))

  return pds.map((pd) => ({
    ...pd,
    journalEntryCount: countByTeacher.get(pd.teacherId) ?? 0,
    goalsCompleted: pd.termGoals.filter((g) => g.isCompleted).length,
    goalsTotal: pd.termGoals.length,
  }))
}
