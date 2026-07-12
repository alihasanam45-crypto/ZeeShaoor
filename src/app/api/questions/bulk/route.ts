import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Question from '@/models/Question'

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const { questions } = body
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'questions array is required' }, { status: 400 })
    }

    const results = { inserted: 0, errors: 0, errorDetails: [] as string[] }
    for (const q of questions) {
      try {
        await Question.create(q)
        results.inserted++
      } catch (e: any) {
        results.errors++
        results.errorDetails.push(`Row ${results.inserted + results.errors}: ${e.message}`)
      }
    }

    return NextResponse.json({ data: results }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
