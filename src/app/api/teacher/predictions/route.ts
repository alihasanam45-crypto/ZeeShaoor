import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Prediction from '@/models/Prediction'
import { getToken } from 'next-auth/jwt'
import { predictClass } from '@/actions/predictor-actions'

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const url = new URL(req.url)
    const filter: Record<string, any> = {}
    const classLevel = url.searchParams.get('classLevel')
    const subject = url.searchParams.get('subject')
    if (classLevel) filter.classLevel = classLevel
    if (subject) filter.subject = subject
    if (url.searchParams.get('intervention') === 'true') filter.interventionNeeded = true

    // Return latest prediction per student
    const predictions = await Prediction.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$studentId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { predictedMax: 1 } },
    ])

    return NextResponse.json({ data: predictions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { classLevel, subject, studentIds } = body
    if (!classLevel || !subject || !studentIds?.length) {
      return NextResponse.json({ error: 'classLevel, subject, and studentIds[] required' }, { status: 400 })
    }

    const results = await predictClass(classLevel, subject, studentIds)
    return NextResponse.json({ data: results }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
