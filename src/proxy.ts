import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { ROUTE_CONFIG } from '@/config/routes'
import type { ZeeTokenPayload } from '@/types/auth'
import { validateTeacherPath } from '@/middleware/teacherAuth'

// Next 16 renamed the `middleware` file convention to `proxy` (middleware.ts
// is deprecated). Same engine: runs before every matched request.
//
// RBAC contract:
// - /admin/*   → role 'admin' only
// - /teacher/* → role 'teacher' only (plus per-subject path validation)
// - /student/* → role 'student' only
// - admin carries superAccess and passes every gate (PDF B1: "the Admin sees
//   everything") — the one sanctioned cross-role passage
// - unauthenticated page requests → /login (with callbackUrl)
// - unauthenticated/foreign-role API requests → 401/403 JSON, never a redirect
// - authenticated users on `/` → their role dashboard

function isPublicRoute(pathname: string): boolean {
  return ROUTE_CONFIG.public.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

function isRoleOwnPath(role: ZeeTokenPayload['role'], pathname: string): boolean {
  const ownPrefixes = ROUTE_CONFIG[role] as readonly string[]
  return ownPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function getHomeForRole(role: ZeeTokenPayload['role']): string {
  return ROUTE_CONFIG.redirectAfterLogin[role]
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
  // Authenticated users never see the marketing page — they go straight to
  // their dashboard. Guests fall through to the public landing page.
  if (pathname === '/') {
    const token = (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })) as ZeeTokenPayload | null

    if (token) {
      return NextResponse.redirect(new URL(getHomeForRole(token.role), request.url))
    }
    return NextResponse.next()
  }

  if (isPublicRoute(pathname)) return NextResponse.next()

  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as ZeeTokenPayload | null

  // --------- API routes: NEVER redirect (breaks client fetch CORS) ------------------------------------------------
  if (pathname.startsWith('/api/')) {
    if (token?.role === 'admin') {
      return attachHeaders(NextResponse.next(), token)
    }
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Login required.' }, { status: 401 })
    }
    if (!isRoleOwnPath(token.role, pathname)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return attachHeaders(NextResponse.next(), token)
  }

  // --------- Page routes ----------------------------------------------------------------------------------------
  if (token?.role === 'admin') {
    return attachHeaders(NextResponse.next(), token)
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

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
