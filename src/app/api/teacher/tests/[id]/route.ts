import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Test from '@/models/Test'
import { getToken } from 'next-auth/jwt'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const test = await Test.findById(id).lean()
    if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (test.createdBy !== token.id && token.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ data: test })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const existing = await Test.findById(id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.createdBy !== token.id && token.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    delete body._id
    delete body.createdBy
    delete body.createdAt

    const updated = await Test.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean()
    return NextResponse.json({ data: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const existing = await Test.findById(id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.createdBy !== token.id && token.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await Test.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
