import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import {
  apiRolesFor,
  homeFor,
  isApiPath,
  isBypassPath,
  isPublicPath,
  ownsPagePath,
  safeCallbackPath,
} from '@/lib/security/route-policy'
import type { UserRole, ZeeTokenPayload } from '@/types/auth'

/**
 * Edge authorization gate.
 *
 * This is the OUTER perimeter only. Per the Next.js proxy documentation,
 * Server Functions are POSTs to the page route that uses them, so a matcher
 * change can silently drop coverage — and route handlers can be reached
 * directly on the Node server. Every handler and action therefore re-checks
 * the session itself (src/lib/security/rbac.ts). Two independent layers.
 */

const VALID_ROLES: readonly UserRole[] = ['admin', 'teacher', 'student']

/**
 * Identity headers this application sets for downstream logging.
 *
 * They are stripped from every INBOUND request before anything else runs. A
 * client can address the Node server directly and send `x-user-role: admin`;
 * if any handler ever trusted that header, the entire RBAC model would
 * collapse. Stripping here means the header, when present downstream, can
 * only have been set by this function.
 */
const IDENTITY_HEADERS = ['x-user-id', 'x-user-role', 'x-user-school', 'x-teacher-subjects'] as const

function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role)
}

/** Inbound headers with all spoofable identity claims removed. */
function scrubbedHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers)
  for (const name of IDENTITY_HEADERS) headers.delete(name)
  return headers
}

/**
 * Forward verified identity to the app on the REQUEST.
 *
 * The previous implementation set these on the response, which both leaked the
 * user's id and role to the browser and left them invisible to route handlers.
 */
function forward(request: NextRequest, token: ZeeTokenPayload): NextResponse {
  const headers = scrubbedHeaders(request)
  headers.set('x-user-id', token.id)
  headers.set('x-user-role', token.role)
  // Useful for audit correlation; the proxy sees the path, the handler does not.
  headers.set('x-invoked-path', request.nextUrl.pathname)

  if (token.role === 'teacher' && token.permissions?.length) {
    const subjects = token.permissions
      .map((p) => p.split(':')[1])
      .filter(Boolean)
      .join(',')
    if (subjects) headers.set('x-teacher-subjects', subjects)
  }

  return NextResponse.next({ request: { headers } })
}

/** Anonymous pass-through — still scrubbed, so no spoofed identity leaks in. */
function passThrough(request: NextRequest): NextResponse {
  const headers = scrubbedHeaders(request)
  headers.set('x-invoked-path', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers } })
}

function unauthorizedJson(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'UNAUTHORIZED', message: 'Authentication required.' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } },
  )
}

function forbiddenJson(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'FORBIDDEN', message: 'You do not have permission to perform this action.' },
    { status: 403, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isBypassPath(pathname)) return NextResponse.next()

  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as ZeeTokenPayload | null

  const authenticated = Boolean(token && isValidRole(token.role))

  // --------- Root: send signed-in users to their own portal ------------------
  if (pathname === '/') {
    if (authenticated) {
      return NextResponse.redirect(new URL(homeFor(token!.role), request.url))
    }
    return passThrough(request)
  }

  // --------- Public surfaces -------------------------------------------------
  if (isPublicPath(pathname)) {
    // Bounce an authenticated user away from login/register rather than
    // letting them re-authenticate into a different role.
    if (authenticated && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL(homeFor(token!.role), request.url))
    }
    return authenticated ? forward(request, token!) : passThrough(request)
  }

  // --------- API routes: respond in JSON, never redirect ---------------------
  // Redirecting an XHR turns a 401 into an opaque CORS failure, which hides
  // the real cause from the client.
  if (isApiPath(pathname)) {
    if (!authenticated) return unauthorizedJson()

    const allowed = apiRolesFor(pathname)

    // Default-deny: an API path with no policy entry is closed until it is
    // classified in route-policy.ts. A new endpoint is never open by accident.
    if (allowed === null) return forbiddenJson()
    if (!allowed.includes(token!.role)) return forbiddenJson()

    return forward(request, token!)
  }

  // --------- Page routes -----------------------------------------------------
  if (!authenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', safeCallbackPath(pathname, '/'))
    return NextResponse.redirect(loginUrl)
  }

  // Confine each role to its own portal.
  if (!ownsPagePath(token!.role, pathname)) {
    return NextResponse.redirect(new URL(homeFor(token!.role), request.url))
  }

  return forward(request, token!)
}

export const config = {
  /**
   * Everything except static assets and image optimization.
   *
   * Broader than the previous portal-only matcher: any future route is gated
   * by default instead of being exposed until someone remembers to add it.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
