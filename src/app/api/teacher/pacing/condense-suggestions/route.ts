import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

/**
 * GET /api/teacher/pacing/condense-suggestions?classId=9&subjectId=Physics
 */
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

    const { getCondensationSuggestions } = await import('@/actions/pacing-actions')
    const suggestions = await getCondensationSuggestions(classId, subjectId)

    return NextResponse.json({ suggestions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
