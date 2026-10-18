import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import LiveSessionModel from '@/models/LiveSession'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const sessions = await LiveSessionModel.find({ teacherId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(sessions)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { action, ...data } = body

    const {
      createLiveSession,
      startLiveSession,
      endLiveSession,
      markAttendance,
      generateAiSummary,
    } = await import('@/actions/live-session-actions')

    switch (action) {
      case 'create': {
        const s = await createLiveSession(data.classId, data.title)
        return NextResponse.json(s, { status: 201 })
      }
      case 'start': {
        const s = await startLiveSession(data.sessionId)
        return NextResponse.json(s)
      }
      case 'end': {
        const s = await endLiveSession(data.sessionId)
        return NextResponse.json(s)
      }
      case 'attendance': {
        const s = await markAttendance(data.sessionId, data.studentId)
        return NextResponse.json(s)
      }
      case 'generate-summary': {
        const summary = await generateAiSummary(data.sessionId)
        return NextResponse.json({ summary })
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
