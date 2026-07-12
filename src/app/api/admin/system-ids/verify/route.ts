import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SystemId from '@/models/SystemId'

// Register form se ID verify karo
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { code } = await req.json()

    const id = await SystemId.findOne({ code })

    if (!id) {
      return NextResponse.json({ valid: false, message: 'ID nahi mili' })
    }
    if (id.isUsed) {
      return NextResponse.json({ valid: false, message: 'ID already use ho chuki hai' })
    }

    return NextResponse.json({ valid: true, message: 'ID verified' })
  } catch (error) {
    return NextResponse.json({ error: 'Verify nahi hua' }, { status: 500 })
  }
}