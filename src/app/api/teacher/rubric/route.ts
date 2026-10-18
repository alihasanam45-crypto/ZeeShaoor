import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import RubricModel from '@/models/Rubric'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const rubrics = await RubricModel.find({ teacherId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(rubrics)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    if (body.action === 'delete') {
      await RubricModel.findByIdAndDelete(body.rubricId)
      return NextResponse.json({ success: true })
    }

    const rubric = await RubricModel.create({
      teacherId: session.user.id,
      title: body.title,
      criteria: body.criteria,
    })

    return NextResponse.json(rubric.toObject(), { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
