import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'

// --------- GET — Single complaint ---------------------------------------------------------------------------------------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const complaint = await Complaint.findById(id).lean()

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: complaint })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaint' },
      { status: 500 }
    )
  }
}

// --------- PATCH — Update status / assign / add response ---------------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const body = await req.json()
    const { status, assignedTo, response } = body

    const updateData: Record<string, unknown> = {}

    if (status)     updateData.status     = status
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo

    // Add response to responses array
    if (response?.text) {
      const complaint = await Complaint.findByIdAndUpdate(
        id,
        {
          ...updateData,
          $push: {
            responses: {
              text:    response.text,
              by:      response.by || 'Admin',
              isAdmin: response.isAdmin ?? true,
            },
          },
        },
        { new: true }
      )

      return NextResponse.json({ success: true, data: complaint })
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: complaint })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint' },
      { status: 500 }
    )
  }
}

// --------- DELETE — Delete complaint ------------------------------------------------------------------------------------------------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const complaint = await Complaint.findByIdAndDelete(id)

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Complaint deleted' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete complaint' },
      { status: 500 }
    )
  }
}