import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PulseSurveyModel from '@/models/PulseSurvey'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    if (!classId) {
      return NextResponse.json({ error: 'classId required' }, { status: 400 })
    }
    const survey = await PulseSurveyModel.findOne({ classId, isActive: true })
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ survey })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
