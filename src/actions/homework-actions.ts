'use server'

import { connectDB } from '@/lib/mongodb'
import HomeworkTaskModel, { type IHomeworkTask } from '@/models/HomeworkTask'
import HomeworkSubmissionModel, { type IHomeworkSubmission } from '@/models/HomeworkSubmission'
import Student from '@/models/Student'
import { requireCronOrRole, requireSessionRole } from '@/lib/auth/guard'

/**
 * Homework action layer — task lifecycle, AI-assisted grading and the two
 * cron jobs (recurring-task creation, missing-submission sweep).
 */

const SUBMISSION_STATUSES = ['Pending', 'Submitted', 'Graded', 'Missing'] as const

export interface CreateHomeworkTaskInput {
  classId: string
  title: string
  description?: string
  rubric?: string
  recurrence?: IHomeworkTask['recurrence']
  dayOfWeek?: number
  dueDate: string
  totalPoints?: number
  autoAlertParents?: boolean
}

export async function createHomeworkTask(data: CreateHomeworkTaskInput) {
  const user = await requireSessionRole('teacher')
  if (!data?.classId || !data?.title?.trim() || !data?.dueDate) {
    throw new Error('classId, title and dueDate are required')
  }
  const dueDate = new Date(data.dueDate)
  if (Number.isNaN(dueDate.getTime())) throw new Error('Invalid dueDate')

  await connectDB()
  const task = await HomeworkTaskModel.create({
    teacherId: user.id,
    classId: data.classId,
    title: data.title.trim().slice(0, 200),
    description: data.description?.trim() ?? '',
    rubric: data.rubric?.trim() ?? '',
    recurrence: data.recurrence ?? 'None',
    dayOfWeek: data.dayOfWeek,
    dueDate,
    totalPoints: data.totalPoints ?? 10,
    autoAlertParents: data.autoAlertParents ?? false,
  })

  // Seed a Pending submission per active student so missing work is trackable.
  const students = await Student.find({ class: data.classId, status: 'active' })
    .select('_id')
    .lean()
  if (students.length > 0) {
    await HomeworkSubmissionModel.insertMany(
      students.map((s) => ({
        taskId: String(task._id),
        studentId: String(s._id),
        status: 'Pending' as const,
      })),
      { ordered: false },
    )
  }

  return task.toObject()
}

export async function deleteHomeworkTask(taskId: string) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const result = await HomeworkTaskModel.deleteOne({ _id: taskId, teacherId: user.id })
  if (result.deletedCount === 0) throw new Error('Homework task not found')

  await HomeworkSubmissionModel.deleteMany({ taskId })
  return { success: true }
}

export interface AiGradeInput {
  submissionId: string
  studentContent?: string
  rubric?: string
}

/**
 * Heuristic grading (length + rubric keyword coverage) standing in for the
 * AI provider call. Deterministic so re-grading is stable.
 */
export async function aiGradeSubmission(data: AiGradeInput) {
  const user = await requireSessionRole('teacher')
  if (!data?.submissionId) throw new Error('submissionId is required')
  await connectDB()

  const submission = await HomeworkSubmissionModel.findById(data.submissionId)
  if (!submission) throw new Error('Submission not found')

  const task = await HomeworkTaskModel.findOne({
    _id: submission.taskId,
    teacherId: user.id,
  }).lean()
  if (!task) throw new Error('FORBIDDEN: you do not own this homework task')

  const content = (data.studentContent ?? submission.content ?? '').trim()
  const rubricText = (data.rubric ?? task.rubric ?? '').toLowerCase()
  const rubricWords = [...new Set(rubricText.match(/[a-z]{4,}/g) ?? [])]
  const contentLower = content.toLowerCase()
  const matchedWords = rubricWords.filter((w) => contentLower.includes(w))

  const lengthScore = Math.min(content.length / 400, 1) * 50
  const rubricScore =
    rubricWords.length === 0
      ? content.length > 0
        ? 40
        : 0
      : (matchedWords.length / rubricWords.length) * 50
  const score = Math.round(Math.min(100, lengthScore + rubricScore))

  const feedback =
    content.length === 0
      ? 'No content submitted — unable to grade. Marked for teacher review.'
      : `Scored ${score}/100. ${
          rubricWords.length > 0
            ? `Covered ${matchedWords.length} of ${rubricWords.length} rubric concepts${
                matchedWords.length > 0 ? ` (${matchedWords.slice(0, 5).join(', ')})` : ''
              }.`
            : 'Graded on completeness (no rubric provided).'
        } ${score >= 70 ? 'Strong work overall.' : score >= 40 ? 'Reasonable attempt — revisit the missed concepts.' : 'Needs significant revision — consider a re-submission.'}`

  submission.aiScore = score
  submission.aiFeedback = feedback.slice(0, 2000)
  submission.status = 'Graded'
  await submission.save()
  return submission.toObject()
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: IHomeworkSubmission['status'],
) {
  const user = await requireSessionRole('teacher')
  if (!(SUBMISSION_STATUSES as readonly string[]).includes(status)) {
    throw new Error('Invalid submission status')
  }
  await connectDB()

  const submission = await HomeworkSubmissionModel.findById(submissionId)
  if (!submission) throw new Error('Submission not found')

  const ownsTask = await HomeworkTaskModel.exists({
    _id: submission.taskId,
    teacherId: user.id,
  })
  if (!ownsTask) throw new Error('FORBIDDEN: you do not own this homework task')

  submission.status = status
  if (status === 'Submitted' && !submission.submittedAt) submission.submittedAt = new Date()
  await submission.save()
  return submission.toObject()
}

export async function markMissingSubmissions(taskId: string): Promise<number> {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const ownsTask = await HomeworkTaskModel.exists({ _id: taskId, teacherId: user.id })
  if (!ownsTask) throw new Error('FORBIDDEN: you do not own this homework task')

  const result = await HomeworkSubmissionModel.updateMany(
    { taskId, status: 'Pending' },
    { $set: { status: 'Missing' } },
  )
  return result.modifiedCount
}

/**
 * Cron (weekly): clone Weekly/Monthly recurring tasks whose due date has
 * passed, rolling the due date forward past today.
 */
export async function autoCreateRecurringTasks() {
  await requireCronOrRole('teacher', 'admin')
  await connectDB()

  const now = new Date()
  const recurring = await HomeworkTaskModel.find({
    recurrence: { $ne: 'None' },
    dueDate: { $lt: now },
  }).lean()

  let created = 0
  for (const task of recurring) {
    const nextDue = new Date(task.dueDate)
    while (nextDue < now) {
      if (task.recurrence === 'Weekly') nextDue.setDate(nextDue.getDate() + 7)
      else nextDue.setMonth(nextDue.getMonth() + 1)
    }

    // skip when an upcoming instance of this task already exists
    const upcoming = await HomeworkTaskModel.exists({
      teacherId: task.teacherId,
      classId: task.classId,
      title: task.title,
      dueDate: { $gte: now },
    })
    if (upcoming) continue

    await HomeworkTaskModel.create({
      teacherId: task.teacherId,
      classId: task.classId,
      title: task.title,
      description: task.description,
      rubric: task.rubric,
      recurrence: task.recurrence,
      dayOfWeek: task.dayOfWeek,
      dueDate: nextDue,
      totalPoints: task.totalPoints,
      autoAlertParents: task.autoAlertParents,
    })
    created++
  }

  return { scanned: recurring.length, created }
}

export interface MissingSubmissionAlert {
  taskId: string
  title: string
  classId: string
  missingCount: number
  autoAlertParents: boolean
}

/**
 * Cron (daily): flip Pending submissions on overdue tasks to Missing and
 * report per-task counts so parent alerts can be dispatched.
 */
export async function checkMissingSubmissions(): Promise<MissingSubmissionAlert[]> {
  await requireCronOrRole('teacher', 'admin')
  await connectDB()

  const overdue = await HomeworkTaskModel.find({ dueDate: { $lt: new Date() } }).lean()

  const alerts: MissingSubmissionAlert[] = []
  for (const task of overdue) {
    const taskId = String(task._id)
    await HomeworkSubmissionModel.updateMany(
      { taskId, status: 'Pending' },
      { $set: { status: 'Missing' } },
    )
    const missingCount = await HomeworkSubmissionModel.countDocuments({
      taskId,
      status: 'Missing',
    })
    if (missingCount > 0) {
      alerts.push({
        taskId,
        title: task.title,
        classId: task.classId,
        missingCount,
        autoAlertParents: task.autoAlertParents,
      })
    }
  }
  return alerts
}
