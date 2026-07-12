import { NextResponse } from 'next/server'
import { getConfidentialMessages } from '@/actions/feedback-actions'

export async function GET() {
  try {
    const messages = await getConfidentialMessages()
    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
