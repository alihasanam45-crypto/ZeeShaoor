import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')

    if (!classId || !subjectId) {
      return NextResponse.json({ error: 'classId and subjectId required' }, { status: 400 })
    }

    const { calculatePacing, getTimeline } = await import('@/actions/pacing-actions')
    const [pacing, timeline] = await Promise.all([
      calculatePacing(classId, subjectId),
      getTimeline(classId, subjectId),
    ])

    return NextResponse.json({ pacing, timeline })
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

    const { upsertTimeline, markChapterComplete } = await import('@/actions/pacing-actions')

    switch (action) {
      case 'upsert':
        return NextResponse.json(
          await upsertTimeline(data.classId, data.subjectId, data.examStartDate, data.chapters),
          { status: 201 },
        )
      case 'mark-complete':
        return NextResponse.json(
          await markChapterComplete(data.classId, data.subjectId, data.chapterName),
        )
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
