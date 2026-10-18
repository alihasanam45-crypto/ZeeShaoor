import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { connectDB } from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) as any
    if (!token || token.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentClass = token.classId?.replace(/[A-Za-z]/g, '') || ''
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')

    await connectDB()

    const filter: any = {
      $or: [
        { affectedClasses: { $in: [studentClass] } },
        { affectedClasses: { $size: 0 } },
      ],
    }
    if (month) {
      filter.date = { $regex: `^${month}` }
    }

    const events = await CalendarEvent.find(filter)
      .sort({ date: 1, priority: -1 })
      .lean()

    return NextResponse.json({ data: events })
  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json({ error: 'Schedule load nahi hua' }, { status: 500 })
  }
}
