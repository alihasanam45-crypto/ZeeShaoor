import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { runBurnoutScan } from '@/lib/burnout-predictor'

/**
 * POST /api/teacher/burnout-predictor
 * Manually triggers the burnout predictor scan.
 * In production this runs via a Vercel Cron Job every 24 hours.
 * Body: { classLevel?: string }
 */
export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const result = await runBurnoutScan(body.classLevel)

    return NextResponse.json({ data: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * GET /api/teacher/burnout-predictor
 * Returns the status of the last scan (stored in-memory for simplicity).
 * In production, store scan results in a ScanLog collection.
 */
export async function GET() {
  return NextResponse.json({
    data: {
      message:
        'Burnout predictor ready. POST to trigger a scan. ' +
        'In production, this runs automatically every 24 hours via Vercel Cron.',
      nextScheduledScan: 'Every 24 hours',
    },
  })
}
