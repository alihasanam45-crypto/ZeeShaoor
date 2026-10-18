import { NextResponse } from 'next/server'

/**
 * Vercel Cron endpoint (runs every Monday).
 * POST /api/teacher/homework/auto-create
 */
export async function POST() {
  try {
    const { autoCreateRecurringTasks } = await import('@/actions/homework-actions')
    const result = await autoCreateRecurringTasks()
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
