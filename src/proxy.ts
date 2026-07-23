import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { ROUTE_CONFIG } from '@/config/routes'
import type { UserRole, ZeeTokenPayload } from '@/types/auth'
import { validateTeacherPath } from '@/middleware/teacherAuth'

const VALID_ROLES: UserRole[] = ['admin', 'teacher', 'student']

// Roles permitted on the /api/admin/* surface. Staff only — students never
// reach it. Route handlers re-check the session themselves; this is the outer
// gate, not the only one.
const ADMIN_API_ROLES: readonly UserRole[] = ['admin', 'teacher']

function isValidRole(role: string): role is UserRole {
  return (VALID_ROLES as readonly string[]).includes(role)
}

function isAdminApiPath(pathname: string): boolean {
  return pathname === '/api/admin' || pathname.startsWith('/api/admin/')
}

function isPublicRoute(pathname: string): boolean {
  return ROUTE_CONFIG.public.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

function isRoleOwnPath(role: ZeeTokenPayload['role'], pathname: string): boolean {
  const ownPrefixes = ROUTE_CONFIG[role] as readonly string[] | undefined
  if (!ownPrefixes) return false
  return ownPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function getHomeForRole(role: UserRole): string {
  return ROUTE_CONFIG.redirectAfterLogin[role] ?? '/login'
}

function attachHeaders(response: NextResponse, token: ZeeTokenPayload): NextResponse {
  response.headers.set('x-user-role', token.role)
  response.headers.set('x-user-id', token.id)
  if (token.role === 'teacher' && token.permissions && token.permissions.length > 0) {
    const subjectCsv = token.permissions.map((p) => p.split(':')[1]).filter(Boolean).join(',')
    response.headers.set('x-teacher-subjects', subjectCsv)
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --------- Root: role-aware landing --------------------------------------------------------------------------
  if (pathname === '/') {
    const token = (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })) as ZeeTokenPayload | null

    if (token?.role && isValidRole(token.role)) {
      return NextResponse.redirect(new URL(getHomeForRole(token.role), request.url))
    }
    return NextResponse.next()
  }

  if (isPublicRoute(pathname)) return NextResponse.next()

  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as ZeeTokenPayload | null

  // --------- API routes: NEVER redirect (breaks client fetch CORS) -----------------------------------------------
  // The generic per-role prefix check doesn't apply here: API paths are
  // /api/*, not /teacher/api/*, so ROUTE_CONFIG's page prefixes never match.
  // Sensitive API surfaces are gated explicitly instead.
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Login required.' }, { status: 401 })
    }
    if (!token.role || !isValidRole(token.role)) {
      return NextResponse.json({ error: 'Forbidden', message: 'Unrecognized role.' }, { status: 403 })
    }
    if (isAdminApiPath(pathname) && !ADMIN_API_ROLES.includes(token.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Staff access required.' },
        { status: 403 },
      )
    }
    return attachHeaders(NextResponse.next(), token)
  }

  // --------- Page routes ----------------------------------------------------------------------------------------
  if (!token || !token.role || !isValidRole(token.role)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Confine every role to its own portal
  if (!isRoleOwnPath(token.role, pathname)) {
    return NextResponse.redirect(new URL(getHomeForRole(token.role), request.url))
  }

  if (token.role === 'teacher') {
    const validation = validateTeacherPath(token, pathname)
    if (!validation.allowed) {
      const homeUrl = new URL('/teacher', request.url)
      homeUrl.searchParams.set('error', validation.reason ?? 'ACCESS_DENIED')
      return NextResponse.redirect(homeUrl)
    }
  }

  return attachHeaders(NextResponse.next(), token)
}

export const config = {
  matcher: ['/', '/teacher/:path*', '/admin/:path*', '/student/:path*', '/api/:path*'],
}
