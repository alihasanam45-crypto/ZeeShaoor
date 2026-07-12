import { Schema, model, models, type Model, type Types } from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * Institution schema — one record per registered academy/school (feature C11,
 * multi-school readiness).
 *
 * Relationship contract:
 * - `slug` is the institution's stable string id. Every member User carries it
 *   as `User.schoolId`, so all existing school-scoped queries keep working.
 * - `owner` points at the User (role 'admin') created during registration.
 *   That User also back-references us via `User.institution`.
 * - New institutions are `status: 'pending'` and their owner User is also
 *   'pending' — authorize() in src/lib/auth/options.ts blocks pending accounts,
 *   so nobody can use a self-registered admin account until a platform admin
 *   approves it.
 * - Creation goes through src/lib/auth/registration.ts (single code path for
 *   the server action and the /api/register route). Do not insert raw.
 */

export const INSTITUTION_STATUSES = ['pending', 'active', 'suspended', 'rejected'] as const
export type InstitutionStatus = (typeof INSTITUTION_STATUSES)[number]

export const SUBSCRIPTION_PLANS = ['TRIAL', '6_MONTHS', '1_YEAR'] as const
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number]

export interface IInstitution {
  /** Display name, e.g. "ZeeShaoor Sci Academy". */
  name: string
  /** URL-safe unique id; mirrored into User.schoolId for every member. */
  slug: string
  ownerName: string
  /** The admin User created at registration. Set right after the owner insert. */
  owner?: Types.ObjectId
  /** Contact email — normally the same address as the owner's User account. */
  email: string
  phone: string
  branchAddress: string

  /** Branding assets (vault upload lands in Phase 3 — paths only for now). */
  logoPath?: string
  headerPath?: string

  subscriptionPlan: SubscriptionPlan
  status: InstitutionStatus
  /** Optional second factor for destructive owner operations. bcrypt cost 12. */
  masterPasswordHash?: string
  /** sha256(email|user-agent|ip) captured at signup — anti-piracy lock. */
  hardwareFingerprint?: string

  approvedAt?: Date
  /** Platform admin who approved/rejected the institution. */
  approvedBy?: Types.ObjectId

  createdAt: Date
  updatedAt: Date
}

export interface IInstitutionMethods {
  /** Compare a plaintext candidate against the stored master-password hash. */
  verifyMasterPassword(candidate: string): Promise<boolean>
}

export type InstitutionModelType = Model<IInstitution, object, IInstitutionMethods>

const InstitutionSchema = new Schema<IInstitution, InstitutionModelType, IInstitutionMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerName: { type: String, required: true, trim: true, maxlength: 80 },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    branchAddress: { type: String, required: true, trim: true, maxlength: 200 },

    logoPath: { type: String, default: '' },
    headerPath: { type: String, default: '' },

    subscriptionPlan: {
      type: String,
      enum: SUBSCRIPTION_PLANS,
      default: '6_MONTHS',
    },
    status: {
      type: String,
      enum: INSTITUTION_STATUSES,
      default: 'pending',
      index: true,
    },
    masterPasswordHash: { type: String, select: false },
    hardwareFingerprint: { type: String },

    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

InstitutionSchema.method(
  'verifyMasterPassword',
  function verifyMasterPassword(candidate: string) {
    if (!this.masterPasswordHash) return Promise.resolve(false)
    return bcrypt.compare(candidate, this.masterPasswordHash)
  },
)

// Mongoose caches compiled models across HMR reloads — schema edits need a
// dev-server restart to take effect.
const Institution =
  (models.Institution as InstitutionModelType) ||
  model<IInstitution, InstitutionModelType>('Institution', InstitutionSchema)

export default Institution
