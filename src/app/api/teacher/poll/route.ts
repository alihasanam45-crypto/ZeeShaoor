import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import LivePollModel from '@/models/LivePoll'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const pollId = searchParams.get('pollId')

    if (pollId) {
      const poll = await LivePollModel.findById(pollId).lean()
      return NextResponse.json(poll)
    }

    const filter: Record<string, any> = {}
    if (sessionId) filter.sessionId = sessionId
    const polls = await LivePollModel.find(filter).sort({ createdAt: -1 }).lean()
    return NextResponse.json(polls)
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

    const { createPoll, votePoll, endPoll } = await import('@/actions/live-session-actions')

    switch (action) {
      case 'create': {
        const poll = await createPoll(data.sessionId, data.question, data.options)
        return NextResponse.json(poll, { status: 201 })
      }
      case 'vote': {
        const poll = await votePoll(data.pollId, data.optionIndex, data.studentId)
        return NextResponse.json(poll)
      }
      case 'end': {
        const poll = await endPoll(data.pollId)
        return NextResponse.json(poll)
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
