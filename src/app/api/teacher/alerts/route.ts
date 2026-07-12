import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TeacherAlert from '@/models/TeacherAlert'
import { getToken } from 'next-auth/jwt'

/**
 * GET /api/teacher/alerts?classLevel=9&unacknowledged=true
 * Returns all alerts, optionally filtered.
 */
export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const url = new URL(req.url)
    const filter: Record<string, any> = {}

    const classLevel = url.searchParams.get('classLevel')
    if (classLevel) filter.classLevel = classLevel

    const severity = url.searchParams.get('severity')
    if (severity) filter.severity = severity

    if (url.searchParams.get('unacknowledged') === 'true') {
      filter.acknowledged = false
    }

    const alerts = await TeacherAlert.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return NextResponse.json({ data: alerts })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/teacher/alerts
 * Acknowledge an alert. Body: { alertId, acknowledgedBy }
 */
export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    if (body.alertId) {
      const updated = await TeacherAlert.findByIdAndUpdate(
        body.alertId,
        {
          acknowledged: true,
          acknowledgedBy: body.acknowledgedBy || token.id,
          acknowledgedAt: new Date(),
        },
        { new: true },
      ).lean()
      return NextResponse.json({ data: updated })
    }

    return NextResponse.json({ error: 'alertId required' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
