import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import StudentMood from '@/models/StudentMood'
import { getToken } from 'next-auth/jwt'

const MOOD_ORDER: Record<string, number> = {
  Stressed: 0, Confused: 1, Tired: 2, Happy: 3, Excited: 4,
}

/**
 * GET /api/teacher/mood?classLevel=9&weekStart=2026-07-06
 * Returns heatmap-ready data: array of { studentId, day, moodValue, timestamp }
 * plus aggregated class stats.
 */
export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const url = new URL(req.url)
    const classLevel = url.searchParams.get('classLevel') || ''
    const weekStartStr = url.searchParams.get('weekStart')

    const weekStart = weekStartStr ? new Date(weekStartStr) : new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const filter: Record<string, any> = {
      timestamp: { $gte: weekStart, $lt: weekEnd },
    }
    if (classLevel) filter.classLevel = classLevel

    const moods = await StudentMood.find(filter)
      .sort({ timestamp: -1 })
      .lean()

    // Per-student latest mood per day
    const dayMap: Record<string, Record<string, any>> = {}
    for (const m of moods) {
      const day = new Date(m.timestamp).toISOString().slice(0, 10)
      const key = `${m.studentId}:${day}`
      if (!dayMap[key]) {
        dayMap[key] = {
          studentId: m.studentId,
          day,
          moodValue: m.moodValue,
          timestamp: m.timestamp,
          deviceType: m.metadata?.deviceType,
          timeOfDay: m.metadata?.timeOfDay,
        }
      }
    }

    // Student list with their week data
    const studentDays: Record<string, any> = {}
    for (const entry of Object.values(dayMap)) {
      const e = entry as any
      if (!studentDays[e.studentId]) {
        studentDays[e.studentId] = { studentId: e.studentId, days: {} }
      }
      studentDays[e.studentId].days[e.day] = e
    }

    const heatmap = Object.values(studentDays).map((s: any) => ({
      studentId: s.studentId,
      days: s.days,
    }))

    // Mood distribution stats
    const dist: Record<string, number> = { Happy: 0, Tired: 0, Stressed: 0, Confused: 0, Excited: 0 }
    for (const m of moods) {
      if (dist[m.moodValue] !== undefined) dist[m.moodValue]++
    }

    return NextResponse.json({
      data: { heatmap, stats: dist, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/teacher/mood
 * Log a mood entry (student-facing, but endpoint lives under teacher for demo).
 * Body: { studentId, classLevel, moodValue, metadata? }
 */
export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    if (!body.studentId || !body.moodValue) {
      return NextResponse.json({ error: 'studentId and moodValue required' }, { status: 400 })
    }

    const mood = await StudentMood.create({
      studentId: body.studentId,
      classLevel: body.classLevel || 'unknown',
      moodValue: body.moodValue,
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      metadata: {
        deviceType: body.metadata?.deviceType,
        timeOfDay: body.metadata?.timeOfDay,
      },
    })

    return NextResponse.json({ data: mood }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
