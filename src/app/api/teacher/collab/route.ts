import { NextRequest, NextResponse } from 'next/server'
import { createPlan, getPlans } from '@/actions/collab-actions'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    if (body.action === 'create') {
      const plan = await createPlan(body)
      return NextResponse.json({ plan }, { status: 201 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get('subjectId') || undefined

    const plans = await getPlans(subjectId)
    return NextResponse.json({ plans })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
