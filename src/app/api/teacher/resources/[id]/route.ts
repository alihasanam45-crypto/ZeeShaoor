import { NextRequest, NextResponse } from 'next/server'
import { rateResource, toggleSaveResource } from '@/actions/lesson-actions'
import { getServerSession } from 'next-auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    if (body.action === 'rate' && body.score) {
      const resource = await rateResource(id, body.score)
      return NextResponse.json({ resource })
    }

    if (body.action === 'toggle-save') {
      const result = await toggleSaveResource(id)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
