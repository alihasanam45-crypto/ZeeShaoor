import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import HomeworkTaskModel from '@/models/HomeworkTask'
import HomeworkSubmissionModel from '@/models/HomeworkSubmission'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const taskId = searchParams.get('taskId')

    if (taskId) {
      const task = await HomeworkTaskModel.findById(taskId).lean()
      const submissions = await HomeworkSubmissionModel.find({ taskId }).sort({ createdAt: -1 }).lean()
      return NextResponse.json({ task, submissions })
    }

    const filter: Record<string, any> = { teacherId: session.user.id }
    if (classId) filter.classId = classId
    const tasks = await HomeworkTaskModel.find(filter).sort({ dueDate: -1 }).lean()

    const tasksWithStats = await Promise.all(
      tasks.map(async (t) => {
        const total = await HomeworkSubmissionModel.countDocuments({ taskId: t._id })
        const submitted = await HomeworkSubmissionModel.countDocuments({
          taskId: t._id,
          status: { $in: ['Submitted', 'Graded'] },
        })
        const graded = await HomeworkSubmissionModel.countDocuments({ taskId: t._id, status: 'Graded' })
        return { ...t, stats: { total, submitted, graded } }
      }),
    )

    return NextResponse.json(tasksWithStats)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const { action, ...data } = body

    if (action === 'grade') {
      const { aiGradeSubmission } = await import('@/actions/homework-actions')
      const result = await aiGradeSubmission(data)
      return NextResponse.json(result)
    }

    if (action === 'update-status') {
      const { updateSubmissionStatus } = await import('@/actions/homework-actions')
      await updateSubmissionStatus(data.submissionId, data.status)
      return NextResponse.json({ success: true })
    }

    if (action === 'mark-missing') {
      const { markMissingSubmissions } = await import('@/actions/homework-actions')
      const count = await markMissingSubmissions(data.taskId)
      return NextResponse.json({ modifiedCount: count })
    }

    const { createHomeworkTask } = await import('@/actions/homework-actions')
    const task = await createHomeworkTask(data)
    return NextResponse.json(task, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
