'use server'

import { connectDB } from '@/lib/mongodb'
import LiveSessionModel from '@/models/LiveSession'
import LivePollModel from '@/models/LivePoll'
import { requireSessionRole } from '@/lib/auth/guard'

/**
 * Live session action layer — session lifecycle, attendance and live polls.
 * Sessions are owned by the teacher who created them; students may only
 * mark their own attendance and cast their own votes.
 */

async function getOwnedSession(sessionId: string, teacherId: string) {
  const doc = await LiveSessionModel.findOne({ _id: sessionId, teacherId })
  if (!doc) throw new Error('Live session not found')
  return doc
}

export async function createLiveSession(classId: string, title: string) {
  const user = await requireSessionRole('teacher')
  if (!classId || typeof title !== 'string' || !title.trim()) {
    throw new Error('classId and title are required')
  }
  await connectDB()

  const doc = await LiveSessionModel.create({
    teacherId: user.id,
    classId,
    title: title.trim().slice(0, 200),
    status: 'Scheduled',
  })
  return doc.toObject()
}

export async function startLiveSession(sessionId: string) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const doc = await getOwnedSession(sessionId, user.id)
  if (doc.status === 'Ended') throw new Error('Session has already ended')

  doc.status = 'Live'
  doc.startedAt = doc.startedAt ?? new Date()
  await doc.save()
  return doc.toObject()
}

export async function endLiveSession(sessionId: string) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const doc = await getOwnedSession(sessionId, user.id)
  const now = new Date()
  doc.status = 'Ended'
  doc.endedAt = now
  for (const record of doc.attendance) {
    if (!record.leaveTime) record.leaveTime = now
  }
  doc.markModified('attendance')
  await doc.save()

  // close any polls still open on this session
  await LivePollModel.updateMany(
    { sessionId: String(doc._id), isActive: true },
    { $set: { isActive: false } },
  )
  return doc.toObject()
}

export async function markAttendance(sessionId: string, studentId: string) {
  const user = await requireSessionRole('teacher', 'student')
  if (user.role === 'student' && user.id !== studentId) {
    throw new Error('FORBIDDEN: students can only mark their own attendance')
  }
  await connectDB()

  const doc = await LiveSessionModel.findById(sessionId)
  if (!doc) throw new Error('Live session not found')
  if (doc.status !== 'Live') throw new Error('Session is not live')

  if (!doc.attendance.some((a) => a.studentId === studentId)) {
    doc.attendance.push({ studentId, joinTime: new Date() })
    await doc.save()
  }
  return doc.toObject()
}

export async function generateAiSummary(sessionId: string): Promise<string> {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const doc = await getOwnedSession(sessionId, user.id)
  const polls = await LivePollModel.find({ sessionId: String(doc._id) }).lean()

  const durationMin =
    doc.startedAt && doc.endedAt
      ? Math.max(1, Math.round((doc.endedAt.getTime() - doc.startedAt.getTime()) / 60000))
      : null
  const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0)

  const summary = [
    `Session "${doc.title}" (class ${doc.classId})${durationMin ? ` ran for ~${durationMin} minutes` : ''}.`,
    `${doc.attendance.length} student(s) attended.`,
    polls.length > 0
      ? `${polls.length} poll(s) were run with ${totalVotes} total vote(s) — engagement was ${
          doc.attendance.length > 0 && totalVotes >= doc.attendance.length ? 'strong' : 'moderate'
        }.`
      : 'No polls were run — consider adding a quick poll next time to check understanding.',
    'Follow-up: share key takeaways with absentees and revisit any poll questions with low correct-vote share.',
  ].join(' ')

  doc.aiSummary = summary.slice(0, 5000)
  await doc.save()
  return summary
}

export async function createPoll(sessionId: string, question: string, options: string[]) {
  const user = await requireSessionRole('teacher')
  if (typeof question !== 'string' || !question.trim()) throw new Error('question is required')

  const cleanOptions = (Array.isArray(options) ? options : [])
    .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
    .map((o) => o.trim().slice(0, 200))
  if (cleanOptions.length < 2) throw new Error('At least 2 options are required')

  await connectDB()
  await getOwnedSession(sessionId, user.id)

  const doc = await LivePollModel.create({
    sessionId,
    question: question.trim().slice(0, 500),
    options: cleanOptions.map((text) => ({ text, votes: 0, voterIds: [] })),
    isActive: true,
    totalVotes: 0,
  })
  return doc.toObject()
}

export async function votePoll(pollId: string, optionIndex: number, studentId: string) {
  const user = await requireSessionRole('teacher', 'student')
  if (user.role === 'student' && user.id !== studentId) {
    throw new Error('FORBIDDEN: students can only cast their own vote')
  }
  await connectDB()

  const poll = await LivePollModel.findById(pollId)
  if (!poll) throw new Error('Poll not found')
  if (!poll.isActive) throw new Error('Poll has ended')

  const option = poll.options[optionIndex]
  if (!option) throw new Error('Invalid option')

  if (poll.options.some((o) => o.voterIds?.includes(studentId))) {
    throw new Error('Student has already voted on this poll')
  }

  option.votes += 1
  option.voterIds = [...(option.voterIds ?? []), studentId]
  poll.totalVotes += 1
  poll.markModified('options')
  await poll.save()
  return poll.toObject()
}

export async function endPoll(pollId: string) {
  const user = await requireSessionRole('teacher')
  await connectDB()

  const poll = await LivePollModel.findById(pollId)
  if (!poll) throw new Error('Poll not found')

  const ownsSession = await LiveSessionModel.exists({ _id: poll.sessionId, teacherId: user.id })
  if (!ownsSession) throw new Error("FORBIDDEN: you do not own this poll's session")

  poll.isActive = false
  await poll.save()
  return poll.toObject()
}
