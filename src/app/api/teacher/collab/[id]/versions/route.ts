import { NextRequest, NextResponse } from 'next/server'
import { getPlanVersions } from '@/actions/collab-actions'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const versions = await getPlanVersions(id)
    return NextResponse.json({ versions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
