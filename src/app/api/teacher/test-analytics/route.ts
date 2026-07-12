import { NextRequest, NextResponse } from 'next/server'
import { analyzeTestScores, getTestAnalytics } from '@/actions/grade-actions'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = await analyzeTestScores(body.testId, body.classId, body.scores)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const testId = searchParams.get('testId') || undefined
    const classId = searchParams.get('classId') || undefined

    const analytics = await getTestAnalytics(testId, classId)
    return NextResponse.json({ analytics })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
