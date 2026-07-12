import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import FeeRecord from '@/models/FeeRecord'

// --------- PATCH — Update fee (mark paid etc) ------------------------------------------------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()

    // Auto-calculate balance
    if (body.paid !== undefined || body.amount !== undefined) {
      const existing = await FeeRecord.findById(id)
      if (existing) {
        const amount = body.amount ?? existing.amount
        const paid   = body.paid   ?? existing.paid
        body.balance = amount - paid
        body.status  = paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
      }
    }

    const record = await FeeRecord.findByIdAndUpdate(id, body, { new: true })

    if (!record) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update fee record' }, { status: 500 })
  }
}

// --------- DELETE ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    await FeeRecord.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Record deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete record' }, { status: 500 })
  }
}