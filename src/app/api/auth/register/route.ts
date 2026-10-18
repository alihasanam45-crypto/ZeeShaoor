import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import User, { USER_ROLES, type UserRole } from '@/models/User'
import { requireRole } from '@/lib/auth/guard'
import { asTrimmedString } from '@/lib/auth/registration'

/**
 * POST /api/auth/register — ADMIN-ONLY user provisioning (any role).
 *
 * This route lives under the /api/auth public whitelist (next-auth needs the
 * prefix open), so the guard below is the actual security boundary. Public
 * self-service goes through /api/register (institutions) and
 * /api/register/student (students) — never through here.
 */
export async function POST(req: Request) {
  const guard = await requireRole(['admin'])
  if (guard instanceof NextResponse) return guard

  try {
    await connectToDatabase()

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }

    const name = asTrimmedString(body.name, 80)
    const email = asTrimmedString(body.email, 254).toLowerCase()
    const password = typeof body.password === 'string' ? body.password.slice(0, 128) : ''
    const role = asTrimmedString(body.role, 20) as UserRole

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        { message: 'name, email and a password of at least 8 characters are required' },
        { status: 400 },
      )
    }
    if (!USER_ROLES.includes(role)) {
      return NextResponse.json(
        { message: `role must be one of: ${USER_ROLES.join(', ')}` },
        { status: 400 },
      )
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 })
    }

    const newUser = new User({
      name,
      email,
      password: await User.hashPassword(password),
      role,
      // Admin-provisioned accounts are usable immediately.
      status: 'active',
    })
    await newUser.save()

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email, role: newUser.role },
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('[api/auth/register] failed:', error)
    if (typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 })
    }
    return NextResponse.json({ message: 'Error registering user' }, { status: 500 })
  }
}
