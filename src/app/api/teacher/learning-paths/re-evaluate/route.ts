import { NextRequest, NextResponse } from 'next/server'

/**
 * Weekly cron endpoint to auto-re-evaluate all groups.
 * POST /api/teacher/learning-paths/re-evaluate
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')

    if (!classId || !subjectId) {
      return NextResponse.json({ error: 'classId and subjectId required' }, { status: 400 })
    }

    const { reEvaluateGroups } = await import('@/actions/learning-path-actions')
    const results = await reEvaluateGroups(classId, subjectId)

    return NextResponse.json({ students: results.length, groups: { Strong: results.filter((r) => r.assignedGroup === 'Strong').length, Average: results.filter((r) => r.assignedGroup === 'Average').length, Weak: results.filter((r) => r.assignedGroup === 'Weak').length } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
