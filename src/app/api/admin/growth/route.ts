import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

/**
 * Admin-only endpoint.
 * Returns aggregated PD data across all teachers.
 * STRICTLY excludes TeacherJournal.reflectionText.
 */
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { getAllTeachersPD } = await import('@/actions/growth-actions')
    const data = await getAllTeachersPD()

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
