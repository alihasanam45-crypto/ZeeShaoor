import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import RubricModel from '@/models/Rubric'
import EssaySubmissionModel from '@/models/EssaySubmission'

/**
 * POST /api/teacher/rubric/grade
 *
 * Accepts: { rubricId, studentId, essayText }
 * Calls OpenAI with a strict system prompt to evaluate the essay
 * against the rubric criteria, returns structured JSON output.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { rubricId, studentId, essayText } = await req.json()

    if (!rubricId || !essayText) {
      return NextResponse.json({ error: 'rubricId and essayText required' }, { status: 400 })
    }

    const rubric = await RubricModel.findById(rubricId).lean()
    if (!rubric) return NextResponse.json({ error: 'Rubric not found' }, { status: 404 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const criteriaJson = JSON.stringify(
      (rubric as any).criteria.map((c: any) => ({
        criterion: c.criterion,
        maxPoints: c.maxPoints,
        description: c.description || '',
      })),
    )

    const systemPrompt = `You are an expert grader. Evaluate the student's essay strictly against the provided rubric criteria.

Rubric Criteria:
${criteriaJson}

Total possible points: ${(rubric as any).totalPoints || 'sum of maxPoints across all criteria'}

Respond ONLY with a JSON object in exactly this format (no markdown, no backticks):
{
  "score": <total score number>,
  "totalPoints": <total possible points>,
  "metCriteria": [
    {"criterion": "<criterion name>", "points": <points awarded>}
  ],
  "unmetCriteria": [
    {"criterion": "<criterion name>", "points": <points lost>, "reason": "<brief explanation>"}
  ],
  "feedback": "<detailed feedback paragraph in English or Urdu, addressing strengths and weaknesses>"
}

Rules:
- score must be <= totalPoints
- metCriteria: list criteria where the student achieved partial or full points
- unmetCriteria: list criteria where points were deducted, with specific reason
- Feedback should be constructive, specific, and actionable
- Use a mix of English and Urdu if appropriate for a Pakistani student`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Essay to grade:\n\n${essayText}` },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `OpenAI API error: ${res.status} ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? ''

    let parsed: {
      score: number
      totalPoints: number
      metCriteria: { criterion: string; points: number }[]
      unmetCriteria: { criterion: string; points: number; reason: string }[]
      feedback: string
    }

    try {
      parsed = JSON.parse(raw)
    } catch {
      // Fallback regex extraction
      const scoreMatch = raw.match(/"score":\s*(\d+)/)
      const totalMatch = raw.match(/"totalPoints":\s*(\d+)/)
      const feedbackMatch = raw.match(/"feedback":\s*"([^"]+)"/)
      parsed = {
        score: scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 0,
        totalPoints: totalMatch ? parseInt(totalMatch[1]) : (rubric as any).totalPoints || 100,
        metCriteria: [],
        unmetCriteria: [],
        feedback: feedbackMatch ? feedbackMatch[1] : 'Grading completed.',
      }
    }

    // Persist submission
    if (studentId) {
      await EssaySubmissionModel.create({
        studentId,
        rubricId,
        essayText,
        aiScore: parsed.score,
        totalPoints: parsed.totalPoints,
        metCriteria: parsed.metCriteria || [],
        unmetCriteria: parsed.unmetCriteria || [],
        aiFeedback: parsed.feedback,
      })
    }

    return NextResponse.json({
      score: parsed.score,
      totalPoints: parsed.totalPoints,
      percentage: Math.round((parsed.score / Math.max(1, parsed.totalPoints)) * 100),
      metCriteria: parsed.metCriteria || [],
      unmetCriteria: parsed.unmetCriteria || [],
      feedback: parsed.feedback,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
