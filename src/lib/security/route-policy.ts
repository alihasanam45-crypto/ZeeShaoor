/**
 * Route classification shared by the proxy and the page guards.
 *
 * Must stay free of Node-only and database imports: the proxy runs this on
 * every request, ahead of rendering.
 *
 * Replaces the previous `src/middleware/teacherAuth.ts`, which authenticated
 * teachers from an unsigned base64 `teacher_token` cookie — any client could
 * mint one — and whose `validateTeacherPath` returned `allowed: true` for
 * every path a teacher could actually reach.
 */

import type { UserRole } from '@/types/auth'

/**
 * Exact paths reachable without a session.
 *
 * `/parent` is deliberately absent: it renders a guardian-facing portal view
 * and must not be world-readable once wired to live data. It currently falls
 * through to default-deny.
 */
const PUBLIC_EXACT: readonly string[] = [
  '/',
  '/login',
  '/register',
  '/register/admin',
  // Marketing pages — no data, linked from the landing page.
  '/founder',
  '/classes',
]

const PUBLIC_PREFIXES: readonly string[] = [
  // next-auth owns this whole prefix and applies its own CSRF protection.
  // /api/auth/register is admin-gated inside the handler.
  '/api/auth',
  // Self-service signup: institutions (/api/register) and students
  // (/api/register/student). Both create non-privileged or pending records.
  '/api/register',
]

/** Static assets and framework internals the proxy must never gate. */
const BYPASS_PREFIXES: readonly string[] = [
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
]

/** Portal ownership. A role may only reach paths under its own prefixes. */
const PORTAL_PREFIXES: Record<UserRole, readonly string[]> = {
  admin: ['/admin', '/dashboard'],
  teacher: ['/teacher'],
  student: ['/student'],
}

/** Landing page per role after login or after an out-of-portal redirect. */
const HOME: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student/dashboard',
}

/**
 * API surfaces and the roles allowed to reach them, most specific first.
 *
 * `/api/admin/*` is admin-only. It was previously open to teachers, which
 * exposed student PII, fee ledgers, confidential messages and system ID
 * issuance to every teacher account.
 */
const API_POLICY: readonly { prefix: string; roles: readonly UserRole[] }[] = [
  { prefix: '/api/admin', roles: ['admin'] },
  { prefix: '/api/teacher', roles: ['admin', 'teacher'] },
  { prefix: '/api/student', roles: ['admin', 'teacher', 'student'] },
  { prefix: '/api/generator', roles: ['admin', 'teacher'] },
  { prefix: '/api/pdf-engine', roles: ['admin', 'teacher'] },
  { prefix: '/api/questions', roles: ['admin', 'teacher'] },
  { prefix: '/api/reports', roles: ['admin', 'teacher'] },
  { prefix: '/api/ai-control', roles: ['admin'] },
  { prefix: '/api/notifications', roles: ['admin', 'teacher', 'student'] },
  { prefix: '/api/bise-news', roles: ['admin', 'teacher', 'student'] },
]

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/**
 * Static files served from /public (logo.png, *.svg, fonts).
 *
 * Matched by extension because their paths are not known ahead of time. Only
 * inert asset types are listed — never .json, .csv, .pdf or .map, any of which
 * could carry exported data that must stay behind the session gate.
 */
const STATIC_ASSET_RE = /\.(?:png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm)$/i

export function isBypassPath(pathname: string): boolean {
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) return true
  return STATIC_ASSET_RE.test(pathname)
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((p) => matches(pathname, p))
}

export function isApiPath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/')
}

export function homeFor(role: UserRole): string {
  return HOME[role] ?? '/login'
}

/** True when `role` owns this page path. */
export function ownsPagePath(role: UserRole, pathname: string): boolean {
  return (PORTAL_PREFIXES[role] ?? []).some((prefix) => matches(pathname, prefix))
}

/**
 * Roles permitted on an API path.
 *
 * Returns `null` for an API path no policy covers — callers treat that as
 * default-deny rather than default-allow, so a newly added endpoint is closed
 * until it is classified here.
 */
export function apiRolesFor(pathname: string): readonly UserRole[] | null {
  const rule = API_POLICY.find((r) => matches(pathname, r.prefix))
  return rule ? rule.roles : null
}

// --------- Open-redirect defence -------------------------------------------

/**
 * Accept only same-origin, absolute-path callbacks.
 *
 * `?callbackUrl=https://evil.example` after a login redirect is a credible
 * phishing primitive; so is `//evil.example`, which browsers treat as
 * protocol-relative. Anything that is not a single-slash absolute path is
 * replaced with the caller's role home.
 */
export function safeCallbackPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback
  if (!raw.startsWith('/')) return fallback
  if (raw.startsWith('//') || raw.startsWith('/\\')) return fallback
  // Reject encoded scheme/host smuggling and control characters.
  if (/[\r\n\t]/.test(raw)) return fallback
  if (raw.includes('://')) return fallback
  return raw
}
