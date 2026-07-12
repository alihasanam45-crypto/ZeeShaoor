import mongoose, { Schema, Document, Model } from 'mongoose'

export type AlertSeverity = 'green' | 'yellow' | 'red'
export type AlertCategory = 'mood_stress_streak' | 'burnout_decline' | 'engagement_drop' | 'attendance'

export interface ITeacherAlert {
  _id: string
  studentId: string
  classLevel: string
  category: AlertCategory
  severity: AlertSeverity
  message: string
  details?: Record<string, any>
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TeacherAlertSchema = new Schema<ITeacherAlert>(
  {
    studentId: { type: String, required: true, index: true },
    classLevel: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['mood_stress_streak', 'burnout_decline', 'engagement_drop'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['green', 'yellow', 'red'],
      default: 'yellow',
    },
    message: { type: String, required: true, maxlength: 500 },
    details: { type: Schema.Types.Mixed, default: undefined },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: String, default: undefined },
    acknowledgedAt: { type: Date, default: undefined },
    expiresAt: { type: Date, default: undefined },
  },
  { timestamps: true, minimize: true, versionKey: false }
)

TeacherAlertSchema.index({ studentId: 1, severity: 1, acknowledged: 1 })
TeacherAlertSchema.index({ classLevel: 1, severity: 1 })
TeacherAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const TeacherAlertModel: Model<ITeacherAlert> =
  mongoose.models.TeacherAlert ?? mongoose.model<ITeacherAlert>('TeacherAlert', TeacherAlertSchema)

export default TeacherAlertModel
