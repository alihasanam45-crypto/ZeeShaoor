import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Student from '@/models/Student'

// --------- GET single ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const student = await Student.findById(id).lean()
    if (!student) return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch student' }, { status: 500 })
  }
}

// --------- PATCH — Update student ---------------------------------------------------------------------------------------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id }  = await params
    const body    = await req.json()
    const student = await Student.findByIdAndUpdate(id, body, { new: true })
    if (!student) return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update student' }, { status: 500 })
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
    await Student.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Student deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete student' }, { status: 500 })
  }
}