import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { connectDB } from '@/lib/mongodb'
import QuizResult from '@/models/QuizResult'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) as any
    if (!token || token.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const pipeline = [
      { $match: { studentId: token.id } },
      {
        $group: {
          _id: { subject: '$subject', chapter: '$chapter' },
          totalAttempts: { $sum: 1 },
          correctCount:  { $sum: { $cond: ['$isCorrect', 1, 0] } },
          wrongCount:    { $sum: { $cond: ['$isCorrect', 0, 1] } },
          lastAttempted: { $max: '$createdAt' },
        },
      },
      {
        $addFields: {
          subject:       '$_id.subject',
          chapter:       '$_id.chapter',
          currentScore:  {
            $round: [
              { $multiply: [{ $divide: ['$correctCount', '$totalAttempts'] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $match: { chapter: { $nin: [null, ''] } },
      },
      { $sort: { currentScore: 1 } },
      {
        $project: {
          _id: 0, subject: 1, chapter: 1,
          totalAttempts: 1, correctCount: 1, wrongCount: 1,
          currentScore: 1, lastAttempted: 1,
        },
      },
    ]

    const results = await QuizResult.aggregate(pipeline as any)

    const weakTopics = results
      .filter((r: any) => r.wrongCount >= 3 && r.currentScore < 80)
      .map((r: any) => ({ ...r, isResolved: false }))

    const resolvedTopics = results
      .filter((r: any) => r.wrongCount >= 3 && r.currentScore >= 80)
      .map((r: any) => ({ ...r, isResolved: true }))

    return NextResponse.json({
      data: {
        weak: weakTopics,
        resolved: resolvedTopics,
        all: results,
      },
    })
  } catch (error) {
    console.error('WeakTopics fetch error:', error)
    return NextResponse.json({ error: 'Weak topics load nahi hue' }, { status: 500 })
  }
}
