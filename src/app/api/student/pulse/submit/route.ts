import { NextRequest, NextResponse } from 'next/server'
import { submitSurveyResponse } from '@/actions/feedback-actions'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { surveyId, understood, difficultyRating } = await req.json()
    if (!surveyId || understood === undefined || !difficultyRating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const result = await submitSurveyResponse(
      surveyId,
      session.user.id,
      understood,
      difficultyRating,
    )
    return NextResponse.json({ response: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
