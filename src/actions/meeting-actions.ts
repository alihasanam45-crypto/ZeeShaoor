'use server'

import { connectDB } from '@/lib/mongodb'
import MeetingModel, { type IMeeting } from '@/models/Meeting'
import HomeworkSubmissionModel from '@/models/HomeworkSubmission'
import AttendanceModel from '@/models/Attendance'
import InterventionModel from '@/models/Intervention'
import QuizResult from '@/models/QuizResult'
import { requireSessionRole } from '@/lib/auth/guard'
import { accuracyPct } from '@/lib/db/quiz-metrics'

/**
 * Parent-teacher meeting action layer. Meetings are owned by the teacher who
 * scheduled them; every mutation is scoped by teacherId.
 */

const MEETING_STATUSES = ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'] as const

async function getOwnedMeeting(meetingId: string, teacherId: string) {
  const doc = await MeetingModel.findOne({ _id: meetingId, teacherId })
  if (!doc) throw new Error('Meeting not found')
  return doc
}

export async function getMeetings() {
  const user = await requireSessionRole('teacher')
  await connectDB()

  return MeetingModel.find({ teacherId: user.id })
    .sort({ scheduledDate: -1 })
    .limit(200)
    .lean()
}

export async function getMeeting(meetingId: string) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  return MeetingModel.findOne({ _id: meetingId, teacherId: user.id }).lean()
}

export interface ScheduleMeetingInput {
  parentId: string
  parentName?: string
  studentId: string
  studentName?: string
  scheduledDate: string
  meetingLink?: string
}

export async function scheduleMeeting(data: ScheduleMeetingInput) {
  const user = await requireSessionRole('teacher')
  if (!data?.parentId || !data?.studentId || !data?.scheduledDate) {
    throw new Error('parentId, studentId and scheduledDate are required')
  }
  const scheduledDate = new Date(data.scheduledDate)
  if (Number.isNaN(scheduledDate.getTime())) throw new Error('Invalid scheduledDate')

  await connectDB()
  const doc = await MeetingModel.create({
    teacherId: user.id,
    parentId: data.parentId,
    parentName: data.parentName?.trim() || undefined,
    studentId: data.studentId,
    studentName: data.studentName?.trim() || undefined,
    scheduledDate,
    meetingLink: data.meetingLink?.trim() || undefined,
    status: 'Scheduled',
  })
  return doc.toObject()
}

/**
 * Builds a data-driven brief (quiz accuracy, absences, missing homework,
 * open interventions) and stores it on the meeting as aiPreSummary.
 */
export async function generatePreMeetingSummary(meetingId: string): Promise<string> {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const meeting = await getOwnedMeeting(meetingId, user.id)

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [quizAgg, absences, missingHomework, openInterventions] = await Promise.all([
    QuizResult.aggregate<{ _id: null; total: number; correct: number }>([
      { $match: { studentId: meeting.studentId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        },
      },
    ]),
    AttendanceModel.countDocuments({
      studentId: meeting.studentId,
      status: 'absent',
      date: { $gte: since },
    }),
    HomeworkSubmissionModel.countDocuments({ studentId: meeting.studentId, status: 'Missing' }),
    InterventionModel.countDocuments({
      studentId: meeting.studentId,
      status: { $ne: 'Resolved' },
    }),
  ])

  const quiz = quizAgg[0]
  const name = meeting.studentName ?? meeting.studentId
  const summary = [
    `Pre-meeting brief for ${name}:`,
    quiz
      ? `• Quiz accuracy: ${accuracyPct(quiz.correct, quiz.total)}% across ${quiz.total} attempts.`
      : '• No quiz attempts recorded yet.',
    `• Absences in the last 30 days: ${absences}.`,
    `• Missing homework submissions: ${missingHomework}.`,
    openInterventions > 0
      ? `• ${openInterventions} open intervention(s) — review the at-risk board before the meeting.`
      : '• No open interventions.',
    'Suggested focus: agree one academic goal and one attendance/homework goal with the parent, then schedule a follow-up check-in.',
  ].join('\n')

  meeting.aiPreSummary = summary.slice(0, 5000)
  await meeting.save()
  return summary
}

export async function updateMeetingNotes(meetingId: string, notes: string) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const meeting = await getOwnedMeeting(meetingId, user.id)
  meeting.meetingNotes = String(notes ?? '').slice(0, 10000)
  await meeting.save()
  return meeting.toObject()
}

export async function updateMeetingStatus(meetingId: string, status: IMeeting['status']) {
  const user = await requireSessionRole('teacher')
  if (!(MEETING_STATUSES as readonly string[]).includes(status)) {
    throw new Error('Invalid meeting status')
  }
  await connectDB()

  const meeting = await getOwnedMeeting(meetingId, user.id)
  meeting.status = status
  await meeting.save()
  return meeting.toObject()
}

export async function addActionItem(meetingId: string, task: string) {
  const user = await requireSessionRole('teacher')
  if (typeof task !== 'string' || !task.trim()) throw new Error('task is required')
  await connectDB()

  const meeting = await getOwnedMeeting(meetingId, user.id)
  meeting.actionItems.push({ task: task.trim().slice(0, 500), isCompleted: false })
  await meeting.save()
  return meeting.toObject()
}

export async function toggleActionItem(meetingId: string, itemIndex: number) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const meeting = await getOwnedMeeting(meetingId, user.id)
  const item = meeting.actionItems[itemIndex]
  if (!item) throw new Error('Action item not found')

  item.isCompleted = !item.isCompleted
  meeting.markModified('actionItems')
  await meeting.save()
  return meeting.toObject()
}
