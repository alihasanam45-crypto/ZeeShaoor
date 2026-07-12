import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PastPaper from '@/models/PastPaper'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const classLevel = searchParams.get('classLevel')
    const subject    = searchParams.get('subject')
    const board      = searchParams.get('board')
    const year       = searchParams.get('year')

    const filter: any = { isActive: true }
    if (classLevel) filter.classLevel = classLevel
    if (subject)    filter.subject    = subject
    if (board)      filter.board      = board
    if (year)       filter.year       = parseInt(year)

    const papers = await PastPaper.find(filter)
      .sort({ year: -1 })
      .lean()

    return NextResponse.json({ data: papers })
  } catch (error) {
    return NextResponse.json({ error: 'Papers load nahi hue' }, { status: 500 })
  }
}

// Student ne paper solve kiya — counter badao
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { paperId } = await req.json()
    await PastPaper.findByIdAndUpdate(paperId, { $inc: { totalSolves: 1 } })
    return NextResponse.json({ message: 'Updated' })
  } catch (error) {
    return NextResponse.json({ error: 'Update nahi hua' }, { status: 500 })
  }
}