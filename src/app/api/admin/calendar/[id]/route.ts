import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'

// --------- PATCH — Update event ---------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id }  = await params
    const body  = await req.json()
    const event = await CalendarEvent.findByIdAndUpdate(id, body, { new: true })

    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 })
  }
}

// --------- DELETE — Delete event ------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    await CalendarEvent.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Event deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 })
  }
}