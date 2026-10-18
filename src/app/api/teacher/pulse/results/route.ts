import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getSurveyResults } from '@/actions/feedback-actions'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const surveyId = searchParams.get('surveyId')
    if (!surveyId) {
      return NextResponse.json({ error: 'surveyId required' }, { status: 400 })
    }
    const data = await getSurveyResults(surveyId)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
