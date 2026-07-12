import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SystemId from '@/models/SystemId'

// GET — sab IDs dekho
export async function GET() {
  try {
    await connectDB()
    const ids = await SystemId.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ data: ids })
  } catch (error) {
    return NextResponse.json({ error: 'Load nahi hua' }, { status: 500 })
  }
}

// POST — nai IDs generate karo
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { count = 1 } = await req.json()

    // Last ID number nikalo
    const last = await SystemId.findOne().sort({ createdAt: -1 })
    let lastNum = 0
    if (last) {
      lastNum = parseInt(last.code.replace('ZSH-', '')) || 0
    }

    const generated = []
    for (let i = 1; i <= count; i++) {
      const num  = lastNum + i
      const code = `ZSH-${String(num).padStart(4, '0')}`
      const id   = await SystemId.create({ code })
      generated.push(id)
    }

    return NextResponse.json({ data: generated }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Generate nahi hua' }, { status: 500 })
  }
}

// DELETE — ek ID delete karo
export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const { code } = await req.json()
    await SystemId.deleteOne({ code, isUsed: false })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Delete nahi hua' }, { status: 500 })
  }
}