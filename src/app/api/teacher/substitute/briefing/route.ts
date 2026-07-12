import { NextResponse } from 'next/server'

const briefing = {
  teacher: 'Mr. Ahmed Raza',
  substitute: 'Ms. Sara Khan',
  date: '2026-07-10',
  classes: [
    { period: 1, class: '10-A', subject: 'Mathematics', topic: 'Quadratic Equations', notes: 'Complete exercise 4.2' },
    { period: 2, class: '9-B', subject: 'Physics', topic: 'Laws of Motion', notes: 'Revision for test' },
    { period: 3, class: '11-A', subject: 'Chemistry', topic: 'Organic Compounds', notes: 'Lab demonstration' },
  ],
  tasks: ['Collect homework from 10-A', 'Distribute test papers to 9-B', 'Take attendance in all classes'],
  emergencyContacts: [{ name: 'Principal Office', phone: '1234-567890' }, { name: 'Admin Office', phone: '1234-567891' }],
}

export async function GET() {
  return NextResponse.json(briefing)
}
