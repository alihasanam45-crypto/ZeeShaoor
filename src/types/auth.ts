// --------- Role Definitions ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export type UserRole = 'admin' | 'teacher' | 'student'

// Admin token — God mode
export interface AdminTokenPayload {
  id: string
  role: 'admin'
  superAccess: true          // always true for admin
  email: string
}

// Teacher token — scoped to assigned subjects/classes
// e.g. permissions: ['teacher:physics:10A', 'teacher:chemistry:9B']
export interface TeacherTokenPayload {
  id: string
  role: 'teacher'
  superAccess: false
  email: string
  permissions: string[]      // format: "teacher:<subject>:<class>"
}

// Student token — isolated to their own data only
export interface StudentTokenPayload {
  id: string
  role: 'student'
  superAccess: false
  email: string
  classId: string            // e.g. "10A"
  boardId: string            // e.g. "lahore-board"
  enrolledSubjects: string[] // e.g. ["physics", "chemistry"]
}

export type ZeeTokenPayload =
  | AdminTokenPayload
  | TeacherTokenPayload
  | StudentTokenPayload

// --------- NextAuth type augmentation ---------------------------------------------------------------------------------------------------------------------------------------------
declare module 'next-auth' {
  interface Session {
    user: ZeeTokenPayload
  }
  
  interface User {
    id: string
    role: UserRole
    email: string
    superAccess?: boolean
    permissions?: string[]
    classId?: string
    boardId?: string
    enrolledSubjects?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    email: string
    superAccess?: boolean
    permissions?: string[]
    classId?: string
    boardId?: string
    enrolledSubjects?: string[]
  }
}
