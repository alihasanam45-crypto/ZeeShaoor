import mongoose, { Schema, Model } from 'mongoose'

export interface IPrincipalAlert {
  _id: string
  teacherId: string
  teacherName?: string
  classId: string
  alertType: 'Consecutive_Low_Understanding' | 'Direct_Confidential_Message'
  description: string
  status: 'Unread' | 'Investigating' | 'Resolved'
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

const PrincipalAlertSchema = new Schema<IPrincipalAlert>(
  {
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, default: undefined },
    classId: { type: String, required: true },
    alertType: {
      type: String,
      enum: ['Consecutive_Low_Understanding', 'Direct_Confidential_Message'],
      required: true,
    },
    description: { type: String, required: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ['Unread', 'Investigating', 'Resolved'],
      default: 'Unread',
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

PrincipalAlertSchema.index({ status: 1, createdAt: -1 })
PrincipalAlertSchema.index({ teacherId: 1, status: 1 })

const PrincipalAlertModel: Model<IPrincipalAlert> =
  mongoose.models.PrincipalAlert ??
  mongoose.model<IPrincipalAlert>('PrincipalAlert', PrincipalAlertSchema)

export default PrincipalAlertModel
