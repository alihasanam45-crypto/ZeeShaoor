import type { ZeeTokenPayload } from '@/types/auth'

export interface PathValidationResult {
  allowed: boolean
  reason?: string
}

const ALWAYS_ALLOWED = new Set([
  '/student',
  '/student/dashboard',
  '/student/settings',
])

export function validateStudentPath(
  token: ZeeTokenPayload,
  pathname: string,
): PathValidationResult {
  if (token.role !== 'student') {
    return { allowed: true }
  }

  if (ALWAYS_ALLOWED.has(pathname) || pathname === '/student') {
    return { allowed: true }
  }

  const student = token as Extract<ZeeTokenPayload, { role: 'student' }>

  const classMatch = pathname.match(/^\/student\/class\/([A-Za-z0-9-]+)(?:\/|$)/)
  if (classMatch) {
    if (classMatch[1] !== student.classId) {
      return { allowed: false, reason: `CLASS_NOT_ENROLLED:${classMatch[1]}` }
    }
    return { allowed: true }
  }

  return { allowed: true }
}
