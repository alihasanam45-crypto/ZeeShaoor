import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PulseSurveyModel from '@/models/PulseSurvey'
import SurveyResponseModel from '@/models/SurveyResponse'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const { classId, topicTitle } = await req.json()
    if (!classId || !topicTitle) {
      return NextResponse.json({ error: 'classId and topicTitle required' }, { status: 400 })
    }
    const survey = await PulseSurveyModel.create({
      classId,
      teacherId: session.user.id,
      topicTitle,
      isActive: true,
    })
    return NextResponse.json({ survey: survey.toObject() }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')

    const filter: any = { teacherId: session.user.id }
    if (classId) filter.classId = classId

    const surveys = await PulseSurveyModel.find(filter).sort({ createdAt: -1 }).lean()

    // Attach response counts
    const result = await Promise.all(
      surveys.map(async (s) => {
        const total = await SurveyResponseModel.countDocuments({ surveyId: s._id })
        const yes = await SurveyResponseModel.countDocuments({ surveyId: s._id, understood: true })
        const no = await SurveyResponseModel.countDocuments({ surveyId: s._id, understood: false })
        return {
          ...s,
          responseCount: total,
          yesCount: yes,
          noCount: no,
          pctYes: total > 0 ? Math.round((yes / total) * 100) : 0,
        }
      }),
    )

    return NextResponse.json({ surveys: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
