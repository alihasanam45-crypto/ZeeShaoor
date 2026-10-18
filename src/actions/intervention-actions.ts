'use server'

import { connectDB } from '@/lib/mongodb'
import InterventionModel, { type IIntervention, type IRiskSignal } from '@/models/Intervention'
import HomeworkSubmissionModel from '@/models/HomeworkSubmission'
import AttendanceModel from '@/models/Attendance'
import Student from '@/models/Student'
import QuizResult from '@/models/QuizResult'
import { requireSessionRole } from '@/lib/auth/guard'
import { accuracyPct } from '@/lib/db/quiz-metrics'

/**
 * Intervention action layer — detects at-risk students from quiz accuracy,
 * attendance and missing homework, and manages the resulting intervention
 * records on the at-risk board.
 */

const INTERVENTION_STATUSES = ['Active', 'In-Progress', 'Resolved'] as const

export interface FlaggedStudent {
  studentId: string
  studentName?: string
  classId?: string
  riskSignals: IRiskSignal[]
}

export async function detectAtRiskStudents(classId?: string): Promise<FlaggedStudent[]> {
  await requireSessionRole('teacher')
  await connectDB()

  const filter: Record<string, unknown> = { status: 'active' }
  if (classId) filter.class = classId
  const students = await Student.find(filter).select('name class').lean()
  if (students.length === 0) return []
  const studentIds = students.map((s) => String(s._id))

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [quizAgg, absenceAgg, missingAgg] = await Promise.all([
    QuizResult.aggregate<{ _id: string; total: number; correct: number }>([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        },
      },
    ]),
    AttendanceModel.aggregate<{ _id: string; absences: number }>([
      { $match: { studentId: { $in: studentIds }, status: 'absent', date: { $gte: since } } },
      { $group: { _id: '$studentId', absences: { $sum: 1 } } },
    ]),
    HomeworkSubmissionModel.aggregate<{ _id: string; missing: number }>([
      { $match: { studentId: { $in: studentIds }, status: 'Missing' } },
      { $group: { _id: '$studentId', missing: { $sum: 1 } } },
    ]),
  ])

  const quizByStudent = new Map(quizAgg.map((r) => [r._id, r]))
  const absencesByStudent = new Map(absenceAgg.map((r) => [r._id, r.absences]))
  const missingByStudent = new Map(missingAgg.map((r) => [r._id, r.missing]))

  const now = new Date()
  const flagged: FlaggedStudent[] = []

  for (const student of students) {
    const id = String(student._id)
    const signals: IRiskSignal[] = []

    const quiz = quizByStudent.get(id)
    if (quiz && quiz.total >= 5) {
      const accuracy = accuracyPct(quiz.correct, quiz.total)
      if (accuracy < 40) {
        signals.push({
          type: 'low_marks',
          detail: `Quiz accuracy ${accuracy}% across ${quiz.total} attempts`,
          severity: accuracy < 25 ? 'high' : 'medium',
          detectedAt: now,
        })
      }
    }

    const absences = absencesByStudent.get(id) ?? 0
    if (absences >= 4) {
      signals.push({
        type: 'absenteeism',
        detail: `${absences} absences in the last 30 days`,
        severity: absences >= 8 ? 'high' : 'medium',
        detectedAt: now,
      })
    }

    const missing = missingByStudent.get(id) ?? 0
    if (missing >= 2) {
      signals.push({
        type: 'missed_homework',
        detail: `${missing} homework submissions missing`,
        severity: missing >= 4 ? 'high' : 'medium',
        detectedAt: now,
      })
    }

    if (signals.length > 0) {
      flagged.push({
        studentId: id,
        studentName: student.name,
        classId: student.class,
        riskSignals: signals,
      })
    }
  }

  return flagged
}

const SIGNAL_ADVICE: Record<IRiskSignal['type'], string> = {
  low_marks:
    'schedule two short concept-revision sessions per week on the weakest chapters and re-test with low-stakes quizzes',
  absenteeism:
    'contact the parent about the recent absences and agree on an attendance plan with a weekly check-in',
  missed_homework:
    'assign a catch-up plan for the missing homework with reduced scope and firm micro-deadlines',
  behavioral:
    'arrange a one-on-one conversation to understand the behavioural pattern before it affects academics',
}

export async function generateAiRecommendation(student: FlaggedStudent): Promise<string> {
  await requireSessionRole('teacher')

  const name = student.studentName ?? 'This student'
  const signalTypes = [...new Set(student.riskSignals.map((s) => s.type))]
  const highSeverity = student.riskSignals.some((s) => s.severity === 'high')

  const advice = signalTypes.map((t) => SIGNAL_ADVICE[t]).filter(Boolean)
  return [
    `${name} shows ${student.riskSignals.length} risk signal(s): ${student.riskSignals
      .map((s) => s.detail)
      .join('; ')}.`,
    `Recommended plan: ${advice.join('; ')}.`,
    highSeverity
      ? 'Severity is HIGH — involve the parent this week and set a 2-week review date.'
      : 'Review progress in 2–3 weeks and resolve the intervention if the signals clear.',
  ].join(' ')
}

export async function saveIntervention(student: FlaggedStudent, aiRecommendation: string) {
  await requireSessionRole('teacher')
  if (!student?.studentId) throw new Error('studentId is required')
  await connectDB()

  // one open intervention per student — refresh it instead of duplicating
  const existing = await InterventionModel.findOne({
    studentId: student.studentId,
    status: { $ne: 'Resolved' },
  })
  if (existing) {
    existing.riskSignals = student.riskSignals
    existing.aiRecommendation = aiRecommendation.slice(0, 3000)
    existing.studentName = student.studentName
    existing.classId = student.classId
    await existing.save()
    return existing.toObject()
  }

  const doc = await InterventionModel.create({
    studentId: student.studentId,
    studentName: student.studentName,
    classId: student.classId,
    riskSignals: student.riskSignals,
    aiRecommendation: aiRecommendation.slice(0, 3000),
    status: 'Active',
  })
  return doc.toObject()
}

export async function getInterventions(status?: string) {
  await requireSessionRole('teacher')
  await connectDB()

  const filter: Record<string, unknown> = {}
  if (status && (INTERVENTION_STATUSES as readonly string[]).includes(status)) {
    filter.status = status
  }
  return InterventionModel.find(filter).sort({ createdAt: -1 }).limit(200).lean()
}

export async function resolveIntervention(interventionId: string) {
  await requireSessionRole('teacher')
  await connectDB()

  const doc = await InterventionModel.findById(interventionId)
  if (!doc) throw new Error('Intervention not found')

  doc.status = 'Resolved'
  doc.resolvedAt = new Date()
  await doc.save()
  return doc.toObject()
}

export async function updateInterventionStatus(
  interventionId: string,
  status: IIntervention['status'],
) {
  await requireSessionRole('teacher')
  if (!(INTERVENTION_STATUSES as readonly string[]).includes(status)) {
    throw new Error('Invalid intervention status')
  }
  await connectDB()

  const doc = await InterventionModel.findById(interventionId)
  if (!doc) throw new Error('Intervention not found')

  doc.status = status
  doc.resolvedAt = status === 'Resolved' ? new Date() : undefined
  await doc.save()
  return doc.toObject()
}
