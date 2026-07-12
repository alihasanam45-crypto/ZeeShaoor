import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export interface TeacherSession {
  id: string
  email: string
  name: string
  role: 'teacher'
}

export function getTeacherSession(request: NextRequest): TeacherSession | null {
  const token = request.cookies.get('teacher_token')?.value
  if (!token) return null
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    if (decoded.role === 'teacher') return decoded as TeacherSession
    return null
  } catch {
    return null
  }
}

export function withTeacherAuth(handler: (req: NextRequest, session: TeacherSession) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const session = getTeacherSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(request, session)
  }
}

export function validateTeacherPath(token: { role: string; permissions?: string[] }, pathname: string): { allowed: boolean; reason?: string } {
  const isTeacherPath = pathname.startsWith('/teacher/')
  if (!isTeacherPath) return { allowed: true }

  const subjectMatch = pathname.match(/\/teacher\/([^/]+)/)
  if (!subjectMatch) return { allowed: true }

  const requestedArea = subjectMatch[1]
  const exemptAreas = ['dashboard', 'generator', 'layout']
  if (exemptAreas.includes(requestedArea)) return { allowed: true }

  if (!token.permissions || token.permissions.length === 0) {
    return { allowed: false, reason: 'No teaching permissions assigned' }
  }

  const allowedSubjects = token.permissions.map(p => p.split(':')[1]).filter(Boolean)
  if (allowedSubjects.length === 0) {
    return { allowed: false, reason: 'Invalid permission format' }
  }

  return { allowed: true }
}
