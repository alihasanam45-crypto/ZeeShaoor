// --------- Role Definitions ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export type UserRole = 'admin' | 'teacher' | 'student'

// Fields every token carries regardless of role. `name` is optional because a
// user record may have none — `authorize()` copies it through when present and
// the jwt callback assigns it onto the token, so consumers can rely on it
// existing whenever the account has one.
interface BaseTokenPayload {
  id: string
  email: string
  name?: string
}

// Admin token — God mode
export interface AdminTokenPayload extends BaseTokenPayload {
  role: 'admin'
  superAccess: true          // always true for admin
}

// Teacher token — scoped to assigned subjects/classes
// e.g. permissions: ['teacher:physics:10A', 'teacher:chemistry:9B']
export interface TeacherTokenPayload extends BaseTokenPayload {
  role: 'teacher'
  superAccess: false
  permissions: string[]      // format: "teacher:<subject>:<class>"
}

// Student token — isolated to their own data only
export interface StudentTokenPayload extends BaseTokenPayload {
  role: 'student'
  superAccess: false
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
