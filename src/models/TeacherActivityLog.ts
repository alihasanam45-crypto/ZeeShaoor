import mongoose, { Schema, Model } from 'mongoose'

export interface ITeacherActivityLog {
  _id: string
  teacherId: string
  teacherName?: string
  actionType: 'login' | 'logout' | 'create_resource' | 'grade_submission' | 'view_reports' | 'session_start' | 'session_end'
  timestamp: Date
  sessionDuration: number
  createdAt: Date
}

const TeacherActivityLogSchema = new Schema<ITeacherActivityLog>(
  {
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, default: undefined },
    actionType: {
      type: String,
      required: true,
      enum: ['login', 'logout', 'create_resource', 'grade_submission', 'view_reports', 'session_start', 'session_end'],
    },
    timestamp: { type: Date, default: Date.now },
    sessionDuration: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

TeacherActivityLogSchema.index({ teacherId: 1, timestamp: -1 })
TeacherActivityLogSchema.index({ timestamp: -1 })
TeacherActivityLogSchema.index({ actionType: 1, timestamp: -1 })
TeacherActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 })

const TeacherActivityLogModel: Model<ITeacherActivityLog> =
  mongoose.models.TeacherActivityLog ??
  mongoose.model<ITeacherActivityLog>('TeacherActivityLog', TeacherActivityLogSchema)

export default TeacherActivityLogModel
