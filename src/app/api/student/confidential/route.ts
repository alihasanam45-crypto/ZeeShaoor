import { NextRequest, NextResponse } from 'next/server'
import { sendConfidentialMessage } from '@/actions/feedback-actions'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { messageText } = await req.json()
    if (!messageText) {
      return NextResponse.json({ error: 'messageText required' }, { status: 400 })
    }
    const result = await sendConfidentialMessage(messageText)
    return NextResponse.json({ message: result }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
