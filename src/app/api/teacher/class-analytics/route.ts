import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const subject = searchParams.get('subject')
    const chapter = searchParams.get('chapter')
    const anonymous = searchParams.get('anonymous')
    const studentId = searchParams.get('studentId')

    if (!classId || !subject) {
      return NextResponse.json({ error: 'classId and subject required' }, { status: 400 })
    }

    if (anonymous === 'true' && studentId) {
      const { getAnonymousPeerData } = await import('@/actions/class-analytics-actions')
      const result = await getAnonymousPeerData(classId, subject, studentId, chapter ?? undefined)
      return NextResponse.json(result)
    }

    const { getClassAnalytics } = await import('@/actions/class-analytics-actions')
    const result = await getClassAnalytics(classId, subject, chapter ?? undefined)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
