import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// In-memory Q&A store (for demo; use DB in production)
interface QAEntry {
  id: string
  sessionId: string
  studentId: string
  question: string
  timestamp: string
  answered?: boolean
}

const qaStore: QAEntry[] = []

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

    const messages = qaStore.filter((q) => q.sessionId === sessionId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    return NextResponse.json(messages)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId, studentId, question } = await req.json()
    if (!sessionId || !studentId || !question) {
      return NextResponse.json({ error: 'sessionId, studentId, question required' }, { status: 400 })
    }

    const entry: QAEntry = {
      id: Date.now().toString(),
      sessionId,
      studentId,
      question,
      timestamp: new Date().toISOString(),
    }
    qaStore.push(entry)

    return NextResponse.json(entry, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
