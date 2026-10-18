import { NextRequest, NextResponse } from 'next/server'
import { scanTeacherWellbeing } from '@/actions/wellbeing-actions'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: admin only' }, { status: 403 })
    }

    const result = await scanTeacherWellbeing()
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
