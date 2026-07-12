import { NextRequest, NextResponse } from 'next/server'
import { getTopResources, uploadResource } from '@/actions/lesson-actions'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const topicId = searchParams.get('topicId')
    if (!topicId) return NextResponse.json({ error: 'topicId required' }, { status: 400 })

    const resources = await getTopResources(topicId)
    return NextResponse.json({ resources })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const resource = await uploadResource(body)
    return NextResponse.json({ resource }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
