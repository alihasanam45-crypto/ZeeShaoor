import { NextResponse } from 'next/server'

const notifications = [
  { id: '1', title: 'New assignment uploaded', message: 'Math assignment for Chapter 5 is now available.', type: 'info', createdAt: '2026-07-10T08:00:00Z' },
  { id: '2', title: 'Fee deadline approaching', message: 'Fee submission deadline is July 15th.', type: 'warning', createdAt: '2026-07-09T10:30:00Z' },
  { id: '3', title: 'Result announced', message: 'Annual results are now published on the portal.', type: 'success', createdAt: '2026-07-08T14:00:00Z' },
]

export async function GET() {
  return NextResponse.json(notifications)
}
