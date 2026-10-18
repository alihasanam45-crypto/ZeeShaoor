import mongoose, { Schema, Model } from 'mongoose'

export interface IAttendance {
  _id: string
  studentId: string
  classId: string
  date: Date
  status: 'present' | 'absent'
  teacherId: string
  createdAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
    teacherId: { type: String, required: true },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

AttendanceSchema.index({ studentId: 1, date: -1 })
AttendanceSchema.index({ classId: 1, date: -1 })
AttendanceSchema.index({ studentId: 1, status: 1, date: -1 })

const AttendanceModel: Model<IAttendance> =
  mongoose.models.Attendance ?? mongoose.model<IAttendance>('Attendance', AttendanceSchema)

export default AttendanceModel
