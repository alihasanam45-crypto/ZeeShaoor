import { NextResponse } from 'next/server'

const parentReports = [
  { id: '1', studentName: 'Ali Khan', className: '10-A', attendance: 92, avgScore: 85, meetingsAttended: 3, lastUpdated: '2026-07-10' },
  { id: '2', studentName: 'Fatima Ali', className: '10-B', attendance: 88, avgScore: 91, meetingsAttended: 2, lastUpdated: '2026-07-09' },
]

export async function GET() {
  return NextResponse.json(parentReports)
}
