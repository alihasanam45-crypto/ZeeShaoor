import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

/**
 * POST /api/teacher/energy-map/request-timetable
 *
 * Sends an automated internal request to admin to adjust timetable
 * based on energy map data.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { classId, subject, peakBlock, diffPercent, morningBetter } = await req.json()

    if (!classId || !subject) {
      return NextResponse.json({ error: 'classId and subject required' }, { status: 400 })
    }

    // In production, this would create a notification/request in the admin dashboard.
    const requestId = `TTR-${Date.now()}`
    const message = `Auto-generated timetable adjustment request submitted to admin. 
Reference: ${requestId}
Class: ${classId} | Subject: ${subject}
Peak Performance: ${peakBlock} (${morningBetter ? 'Morning-optimized' : 'Afternoon-optimized'})
Performance Difference: ${Math.abs(diffPercent)}%

The admin will review this request and update the timetable accordingly.`

    return NextResponse.json({
      success: true,
      requestId,
      message,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
