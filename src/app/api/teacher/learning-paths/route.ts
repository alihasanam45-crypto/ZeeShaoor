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

    const { getCurrentLearningPaths, getGroupPerformanceHistory } = await import('@/actions/learning-path-actions')
    const [paths, history] = await Promise.all([
      getCurrentLearningPaths(classId, subjectId),
      getGroupPerformanceHistory(classId, subjectId),
    ])

    return NextResponse.json({ paths, history })
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

    const { reEvaluateGroups, overrideStudentGroup } = await import('@/actions/learning-path-actions')

    switch (action) {
      case 're-evaluate':
        return NextResponse.json(await reEvaluateGroups(data.classId, data.subjectId))
      case 'override':
        await overrideStudentGroup(data.studentId, data.classId, data.subjectId, data.newGroup)
        return NextResponse.json({ success: true })
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
