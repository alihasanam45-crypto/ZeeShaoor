import { Schema, model, models, type Model, type Types } from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * Master User schema — the single identity record for every platform role.
 *
 * Field-level contracts this schema MUST honor (verified against callers):
 * - src/lib/auth/options.ts authorize() reads: name, email, password (via
 *   `.select('+password')`), role, status, permissions, classId, boardId,
 *   enrolledSubjects — all top-level, all lowercase role values. Accounts
 *   with status 'pending'/'suspended' are refused login there.
 * - scripts/create-admin.mjs seeds: { name, email, password, role: 'admin',
 *   ghostMode } — raw insert, lowercase role (status defaults to 'active').
 * - Institution self-registration (src/lib/auth/registration.ts) creates the
 *   owner as { role: 'admin', status: 'pending', schoolId: <institution
 *   slug>, institution: <ref> } — pending until a platform admin approves.
 * - Passwords are hashed by the CALLER with bcrypt cost 12 (register route,
 *   seed script). There is deliberately no pre-save hash hook: adding one
 *   would double-hash every existing flow. Use User.hashPassword() for new
 *   call sites.
 */

export const USER_ROLES = ['admin', 'teacher', 'student', 'parent'] as const
export type UserRole = (typeof USER_ROLES)[number]

export interface IUser {
  name: string
  email: string
  /** bcrypt hash (cost 12). Excluded from queries unless `.select('+password')`. */
  password: string
  role: UserRole
  /** Multi-school readiness (feature C11) — every record is school-scoped. */
  schoolId: string
  /** Rich institution record behind schoolId (Institution.slug === schoolId). */
  institution?: Types.ObjectId
  phone?: string
  status: 'active' | 'suspended' | 'pending'
  isPremium: boolean
  lastLoginAt?: Date

  // --------- Teacher (feature B1 — role-based subject system) ---------
  /** Access grants, format "teacher:<subject>:<classId>", e.g. "teacher:physics:10A". */
  permissions: string[]
  assignedSubjects: string[]

  // --------- Student ---------
  classId?: string
  boardId?: string
  grade?: string
  /** Pre-link to a parent account (matched against User.email on signup). */
  parentEmail?: string
  enrolledSubjects: string[]
  /** Learning content the student is enrolled in (Course model TBD). */
  enrolledCourses: Types.ObjectId[]
  /** Rich academic profile (marks, attendance, wellbeing) lives on Student. */
  studentProfile?: Types.ObjectId
  /** Feature 22 — hides the student from peer leaderboards. */
  ghostMode: boolean

  // --------- Parent ---------
  /** User ids of this parent's children (role: 'student'). */
  children: Types.ObjectId[]

  createdAt: Date
  updatedAt: Date
}

export interface IUserMethods {
  /** Compare a plaintext candidate against the stored bcrypt hash. */
  verifyPassword(candidate: string): Promise<boolean>
}

export interface UserModelType extends Model<IUser, object, IUserMethods> {
  /** Canonical hash for new passwords — same cost the register/seed flows use. */
  hashPassword(plain: string): Promise<string>
}

const UserSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'student',
      index: true,
    },
    schoolId: { type: String, default: 'zeeshaoor-main', index: true },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution' },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
    },
    isPremium: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    // Teacher
    permissions: { type: [String], default: [] },
    assignedSubjects: { type: [String], default: [] },

    // Student
    classId: { type: String },
    boardId: { type: String },
    grade: { type: String },
    parentEmail: { type: String, lowercase: true, trim: true },
    enrolledSubjects: { type: [String], default: [] },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'EducationalResource' }],
    studentProfile: { type: Schema.Types.ObjectId, ref: 'Student' },
    ghostMode: { type: Boolean, default: false },

    // Parent
    children: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

// Role rosters per school are the hottest RBAC query path.
UserSchema.index({ schoolId: 1, role: 1 })

UserSchema.method('verifyPassword', function verifyPassword(candidate: string) {
  return bcrypt.compare(candidate, this.password)
})

UserSchema.static('hashPassword', function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12)
})

// Mongoose caches compiled models across HMR reloads — schema edits need a
// dev-server restart to take effect.
const User = (models.User as UserModelType) || model<IUser, UserModelType>('User', UserSchema)

export default User
