import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttendanceRecord {
  studentId: string
  joinTime: Date
  leaveTime?: Date
}

export interface ILiveSession {
  _id: string
  teacherId: string
  classId: string
  title: string
  status: 'Scheduled' | 'Live' | 'Ended'
  attendance: IAttendanceRecord[]
  aiSummary?: string
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: String, required: true },
    joinTime: { type: Date, required: true },
    leaveTime: { type: Date, default: undefined },
  },
  { _id: false, minimize: true },
)

const LiveSessionSchema = new Schema<ILiveSession>(
  {
    teacherId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: ['Scheduled', 'Live', 'Ended'],
      default: 'Scheduled',
    },
    attendance: { type: [AttendanceRecordSchema], default: [] },
    aiSummary: { type: String, maxlength: 5000, default: undefined },
    startedAt: { type: Date, default: undefined },
    endedAt: { type: Date, default: undefined },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

LiveSessionSchema.index({ status: 1, teacherId: 1 })

const LiveSessionModel: Model<ILiveSession> =
  mongoose.models.LiveSession ?? mongoose.model<ILiveSession>('LiveSession', LiveSessionSchema)

export default LiveSessionModel
