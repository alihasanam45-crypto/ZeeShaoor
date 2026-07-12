import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { connectDB } from '@/lib/mongodb'
import BrainMeter from '@/models/BrainMeter'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) as any
    if (!token || token.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const records = await BrainMeter.find({ studentId: token.id })
      .sort({ subject: 1 })
      .lean()

    const data = records.map((r: any) => {
      const weeks = (r.weeklyData || [])
        .sort((a: any, b: any) => a.weekStart.localeCompare(b.weekStart))

      const latest = weeks[weeks.length - 1]
      const previous = weeks[weeks.length - 2]

      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (latest && previous) {
        if (latest.overallScore > previous.overallScore + 1) trend = 'up'
        else if (latest.overallScore < previous.overallScore - 1) trend = 'down'
      }

      let droppingStreak = 0
      for (let i = weeks.length - 1; i > 0; i--) {
        if (weeks[i].overallScore < weeks[i - 1].overallScore) {
          droppingStreak++
        } else {
          break
        }
      }

      const last4Weeks = weeks.slice(-4).map((w: any) => ({
        weekStart: w.weekStart,
        overallScore: w.overallScore,
        testScore: w.testScore,
        quizScore: w.quizScore,
        homeworkScore: w.homeworkScore,
      }))

      return {
        subject: r.subject,
        currentScore: latest?.overallScore ?? 0,
        testScore: latest?.testScore ?? 0,
        quizScore: latest?.quizScore ?? 0,
        homeworkScore: latest?.homeworkScore ?? 0,
        trend,
        droppingStreak,
        weeklyHistory: last4Weeks,
        totalWeeks: weeks.length,
      }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('BrainMeter fetch error:', error)
    return NextResponse.json({ error: 'BrainMeter data load nahi hua' }, { status: 500 })
  }
}
