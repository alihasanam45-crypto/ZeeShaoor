import { getServerSession } from 'next-auth'
import { headers } from 'next/headers'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'
import type { ZeeTokenPayload, UserRole } from '@/types/auth'

// Use this inside every API route handler
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<{ user: ZeeTokenPayload } | NextResponse> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: 'FORBIDDEN', requiredRoles: allowedRoles },
      { status: 403 }
    )
  }

  return { user: session.user }
}

// Usage in any API route:
// const result = await requireRole(['admin'])
// if (result instanceof NextResponse) return result
// const { user } = result  ← now fully typed

/**
 * Use this inside server actions ('use server' files) — every export of such
 * a file is a public POST endpoint, so each action must validate the session
 * itself. Throws instead of returning a NextResponse; the API routes' catch
 * blocks translate the error into a JSON response.
 */
export async function requireSessionRole(...allowedRoles: UserRole[]): Promise<ZeeTokenPayload> {
  const session = await getServerSession(authOptions)

  if (!session?.user) throw new Error('UNAUTHORIZED')

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    throw new Error(`FORBIDDEN: requires role ${allowedRoles.join(' | ')}`)
  }

  return session.user
}

/**
 * For actions invoked by scheduled jobs (Vercel Cron sends
 * `Authorization: Bearer ${CRON_SECRET}` with the request) that teachers or
 * admins may also trigger manually from the dashboard. Throws when neither
 * a permitted session nor a valid cron secret is present.
 */
export async function requireCronOrRole(...allowedRoles: UserRole[]): Promise<void> {
  const session = await getServerSession(authOptions)
  if (session?.user && allowedRoles.includes(session.user.role)) return

  const headerStore = await headers()
  const authHeader = headerStore.get('authorization')
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) return

  throw new Error('UNAUTHORIZED')
}