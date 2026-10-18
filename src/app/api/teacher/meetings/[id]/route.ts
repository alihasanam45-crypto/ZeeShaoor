import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { getMeeting } = await import('@/actions/meeting-actions')
    const meeting = await getMeeting(id)
    if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(meeting)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
