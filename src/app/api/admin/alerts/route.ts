import { NextRequest, NextResponse } from 'next/server'
import { getPrincipalAlerts, updateAlertStatus } from '@/actions/feedback-actions'

export async function GET() {
  try {
    const alerts = await getPrincipalAlerts()
    return NextResponse.json({ alerts })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { alertId, status } = await req.json()
    if (!alertId || !status) {
      return NextResponse.json({ error: 'alertId and status required' }, { status: 400 })
    }
    await updateAlertStatus(alertId, status)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
