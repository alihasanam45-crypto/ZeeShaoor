import { NextRequest, NextResponse } from 'next/server'
import { updatePlanContent, ratePlan, deletePlan, togglePinPlan } from '@/actions/collab-actions'
import { getServerSession } from 'next-auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    if (body.action === 'update-content') {
      const plan = await updatePlanContent(id, body.newContent, body.changesMade)
      return NextResponse.json({ plan })
    }

    if (body.action === 'rate') {
      const plan = await ratePlan(id, body.score)
      return NextResponse.json({ plan })
    }

    if (body.action === 'toggle-pin') {
      const plan = await togglePinPlan(id)
      return NextResponse.json({ plan })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await deletePlan(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
