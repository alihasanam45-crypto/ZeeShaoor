import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PastPaper from '@/models/PastPaper'

// GET — sab papers
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
    return NextResponse.json({ error: 'Load nahi hua' }, { status: 500 })
  }
}

// POST — naya paper add karo
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { subject, classLevel, year, board, paperType, pdfUrl, solutionUrl } = body

    if (!subject || !classLevel || !year || !board || !pdfUrl) {
      return NextResponse.json(
        { error: 'Subject, class, year, board aur PDF URL zaroori hain' },
        { status: 400 }
      )
    }

    // Duplicate check
    const existing = await PastPaper.findOne({ subject, classLevel, year, board, paperType: paperType || 'Annual' })
    if (existing) {
      return NextResponse.json(
        { error: 'Yeh paper already exist karta hai' },
        { status: 409 }
      )
    }

    const paper = await PastPaper.create({
      subject, classLevel, year, board,
      paperType: paperType || 'Annual',
      pdfUrl, solutionUrl,
    })

    return NextResponse.json({ data: paper }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Save nahi hua' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const { id } = await req.json()
    await PastPaper.findByIdAndUpdate(id, { isActive: false })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Delete nahi hua' }, { status: 500 })
  }
}