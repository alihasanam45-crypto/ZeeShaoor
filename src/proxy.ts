import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { ROUTE_CONFIG } from '@/config/routes'
import type { UserRole, ZeeTokenPayload } from '@/types/auth'
import { validateTeacherPath } from '@/middleware/teacherAuth'

const VALID_ROLES: UserRole[] = ['admin', 'teacher', 'student']

function isValidRole(role: string): role is UserRole {
  return (VALID_ROLES as readonly string[]).includes(role)
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

  // --------- API routes: role-prefix check doesn't apply (paths are /api/*, not /teacher/api/*) -------------------
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Login required.' }, { status: 401 })
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
