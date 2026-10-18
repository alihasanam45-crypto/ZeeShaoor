import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const subject = searchParams.get('subject')

    if (!classId || !subject) {
      return NextResponse.json({ error: 'classId and subject required' }, { status: 400 })
    }

    const { getEnergyMap } = await import('@/actions/energy-map-actions')
    const result = await getEnergyMap(classId, subject)

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
