import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'

// --------- GET — All events ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status   = searchParams.get('status')
    const month    = searchParams.get('month') // e.g. "2025-03"

    const filter: Record<string, unknown> = {}
    if (category && category !== 'all') filter.category = category
    if (status   && status   !== 'all') filter.status   = status
    if (month) {
      filter.date = { $regex: `^${month}` }
    }

    const events = await CalendarEvent.find(filter)
      .sort({ date: 1 })
      .lean()

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// --------- POST — Create event ------------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { title, date, category, description, priority, affectedClasses, isRecurring, endDate, icon } = body

    if (!title || !date || !category || !description) {
      return NextResponse.json(
        { success: false, error: 'title, date, category, description required' },
        { status: 400 }
      )
    }

    const event = await CalendarEvent.create({
      title, date, category, description, priority,
      affectedClasses: affectedClasses || [],
      isRecurring:     isRecurring     || false,
      endDate:         endDate         || null,
      icon:            icon            || '📅',
    })

    return NextResponse.json({ success: true, data: event }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}