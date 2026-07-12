import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Message from '@/models/Message'
import { getToken } from 'next-auth/jwt'
import { sendOrScheduleMessage, dispatchScheduledMessages } from '@/actions/message-actions'

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const url = new URL(req.url)
    const filter: Record<string, any> = {}
    const classId = url.searchParams.get('classId')
    const status = url.searchParams.get('status')
    if (classId) filter.classId = classId
    if (status) filter.status = status

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ data: messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const action = body._action

    if (action === 'dispatch') {
      const dispatched = await dispatchScheduledMessages()
      return NextResponse.json({ data: { dispatched } })
    }

    const message = await sendOrScheduleMessage({
      teacherId: body.teacherId || token.id,
      classId: body.classId,
      subject: body.subject,
      recipients: body.recipients,
      content: body.content,
      type: body.type,
      scheduledFor: body.scheduledFor,
      language: body.language,
    })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
