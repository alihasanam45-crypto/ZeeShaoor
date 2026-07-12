import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Message from '@/models/Message'
import { getToken } from 'next-auth/jwt'
import { markAsRead } from '@/actions/message-actions'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const message = await Message.findById(id).lean()
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: message })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id } = await params

    if (body._action === 'mark_read' && body.parentId) {
      const updated = await markAsRead(id, body.parentId)
      return NextResponse.json({ data: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
