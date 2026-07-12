import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Student from '@/models/Student'

// --------- GET — All students ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const cls      = searchParams.get('class')
    const section  = searchParams.get('section')
    const status   = searchParams.get('status')
    const risk     = searchParams.get('riskLevel')
    const search   = searchParams.get('search')
    const page     = parseInt(searchParams.get('page')  || '1')
    const limit    = parseInt(searchParams.get('limit') || '50')

    const filter: Record<string, unknown> = {}
    if (cls     && cls     !== 'all') filter.class     = cls
    if (section && section !== 'all') filter.section   = section
    if (status  && status  !== 'all') filter.status    = status
    if (risk    && risk    !== 'all') filter.riskLevel = risk

    if (search) {
      filter.$or = [
        { name:   { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    const [students, total] = await Promise.all([
      Student.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Student.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: students,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// --------- POST — Add student ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { name, rollNo, class: cls, section, gender } = body

    if (!name || !rollNo || !cls || !section || !gender) {
      return NextResponse.json(
        { success: false, error: 'name, rollNo, class, section, gender required' },
        { status: 400 }
      )
    }

    // Check duplicate rollNo
    const existing = await Student.findOne({ rollNo })
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Roll number ${rollNo} already exists` },
        { status: 409 }
      )
    }

    const student = await Student.create({ ...body, class: cls })

    return NextResponse.json({ success: true, data: student }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add student' },
      { status: 500 }
    )
  }
}