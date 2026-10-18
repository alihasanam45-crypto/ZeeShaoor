import { NextResponse } from 'next/server'

/**
 * Vercel Cron endpoint (runs daily).
 * POST /api/teacher/homework/check-missing
 */
export async function POST() {
  try {
    const { checkMissingSubmissions } = await import('@/actions/homework-actions')
    const alerts = await checkMissingSubmissions()
    return NextResponse.json({ alerts, count: alerts.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
