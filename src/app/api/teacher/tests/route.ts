import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Test from '@/models/Test'
import { getToken } from 'next-auth/jwt'

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const url = new URL(req.url)
    const classLevel = url.searchParams.get('classLevel')
    const subject = url.searchParams.get('subject')
    const status = url.searchParams.get('status')

    const filter: Record<string, any> = { createdBy: token.id }
    if (classLevel) filter.classLevel = classLevel
    if (subject) filter.subject = subject
    if (status) filter.status = status

    const tests = await Test.find(filter).sort({ updatedAt: -1 }).lean()
    return NextResponse.json({ data: tests })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    body.createdBy = token.id
    const test = await Test.create(body)
    return NextResponse.json({ data: test }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
