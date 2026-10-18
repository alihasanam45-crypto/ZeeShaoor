import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import LiveSessionModel from '@/models/LiveSession'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const liveSession = await LiveSessionModel.findById(id).lean()
    if (!liveSession) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(liveSession)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
