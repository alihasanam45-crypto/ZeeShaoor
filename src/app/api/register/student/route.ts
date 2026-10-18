import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/User'
import SystemId from '@/models/SystemId'
import { asTrimmedString } from '@/lib/auth/registration'

/**
 * POST /api/register/student — public student self-registration.
 * Public via ROUTE_CONFIG.public ('/api/register' prefix covers this path).
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase()

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }

    const name = asTrimmedString(body.name, 80)
    const email = asTrimmedString(body.email, 254).toLowerCase()
    const password = typeof body.password === 'string' ? body.password.slice(0, 128) : ''
    const classLevel = asTrimmedString(body.classLevel, 20)
    const phone = asTrimmedString(body.phone, 20)
    const parentEmail = asTrimmedString(body.parentEmail, 254).toLowerCase()
    const systemId = asTrimmedString(body.systemId, 40)

    // Validation
    if (!name || !email || !password || !classLevel) {
      return NextResponse.json(
        { message: 'Name, email, password aur class zaroori hain' },
        { status: 400 },
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password kam az kam 8 characters ka hona chahiye' },
        { status: 400 },
      )
    }

    // Duplicate check
    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json(
        { message: 'Yeh email already registered hai' },
        { status: 409 },
      )
    }

    const hashedPassword = await User.hashPassword(password)

    const student = new User({
      name,
      email,
      password: hashedPassword,
      // Role is fixed server-side — public signup can never claim another role.
      role: 'student',
      classId: classLevel,
      phone: phone || undefined,
      parentEmail: parentEmail || undefined,
      ghostMode: false,
    })
    await student.save()

    // Mark the SystemId used only AFTER the student actually persisted —
    // never burn a code for a failed registration.
    if (systemId) {
      await SystemId.findOneAndUpdate(
        { code: systemId },
        { isUsed: true, usedBy: email, usedAt: new Date() },
      )
    }

    return NextResponse.json(
      { message: 'Student registered successfully' },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Student register error:', error)
    if (typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ message: 'Registration fail ho gayi' }, { status: 500 })
  }
}
