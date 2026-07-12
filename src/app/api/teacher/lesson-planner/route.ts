import { NextRequest, NextResponse } from 'next/server'
import { generateLessonPlan, saveLessonPlan, getSavedLessonPlans, deleteLessonPlan } from '@/actions/lesson-actions'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    if (body.action === 'generate') {
      const content = await generateLessonPlan(body.topicName, body.duration, body.studentLevel, body.language)
      return NextResponse.json({ content })
    }

    if (body.action === 'save') {
      const plan = await saveLessonPlan(body)
      return NextResponse.json({ plan }, { status: 201 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const plans = await getSavedLessonPlans()
    return NextResponse.json({ plans })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await deleteLessonPlan(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
