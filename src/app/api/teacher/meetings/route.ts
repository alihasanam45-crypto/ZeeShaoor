import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { getMeetings } = await import('@/actions/meeting-actions')
    const meetings = await getMeetings()
    return NextResponse.json(meetings)
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
      scheduleMeeting,
      generatePreMeetingSummary,
      updateMeetingNotes,
      updateMeetingStatus,
      addActionItem,
      toggleActionItem,
    } = await import('@/actions/meeting-actions')

    switch (action) {
      case 'schedule':
        return NextResponse.json(await scheduleMeeting(data), { status: 201 })
      case 'generate-summary':
        return NextResponse.json({ summary: await generatePreMeetingSummary(data.meetingId) })
      case 'update-notes':
        await updateMeetingNotes(data.meetingId, data.notes)
        return NextResponse.json({ success: true })
      case 'update-status':
        await updateMeetingStatus(data.meetingId, data.status)
        return NextResponse.json({ success: true })
      case 'add-action':
        return NextResponse.json(await addActionItem(data.meetingId, data.task), { status: 201 })
      case 'toggle-action':
        return NextResponse.json(await toggleActionItem(data.meetingId, data.itemIndex))
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
