import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import FeeRecord from '@/models/FeeRecord'

// --------- GET — All fee records ------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status  = searchParams.get('status')
    const cls     = searchParams.get('class')
    const month   = searchParams.get('month')
    const page    = parseInt(searchParams.get('page')  || '1')
    const limit   = parseInt(searchParams.get('limit') || '50')

    const filter: Record<string, unknown> = {}
    if (status && status !== 'all') filter.status = status
    if (cls    && cls    !== 'all') filter.class  = cls
    if (month)                      filter.month  = month

    const skip = (page - 1) * limit

    const [records, total] = await Promise.all([
      FeeRecord.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FeeRecord.countDocuments(filter),
    ])

    // Summary stats
    const allRecords = await FeeRecord.find(filter).lean()
    const totalAmount  = allRecords.reduce((s, r) => s + r.amount, 0)
    const totalPaid    = allRecords.reduce((s, r) => s + r.paid,   0)
    const totalBalance = allRecords.reduce((s, r) => s + r.balance, 0)

    return NextResponse.json({
      success: true,
      data: records,
      summary: { totalAmount, totalPaid, totalBalance },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fee records' },
      { status: 500 }
    )
  }
}

// --------- POST — Create fee record ---------------------------------------------------------------------------------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { studentId, studentName, rollNo, class: cls, month, amount, dueDate } = body

    if (!studentId || !studentName || !rollNo || !cls || !month || !amount || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const record = await FeeRecord.create({
      ...body,
      balance: amount - (body.paid || 0),
      class: cls,
    })

    return NextResponse.json({ success: true, data: record }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create fee record' },
      { status: 500 }
    )
  }
}