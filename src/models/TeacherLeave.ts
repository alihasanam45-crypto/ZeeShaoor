import mongoose, { Schema, Model } from 'mongoose'

export interface ITeacherLeave {
  _id: string
  teacherId: string
  classId: string
  subjectId?: string
  date: Date
  pinnedNotes: string
  todayPlan?: string
  status: 'Pending' | 'Approved'
  substituteId?: string
  createdAt: Date
  updatedAt: Date
}

const TeacherLeaveSchema = new Schema<ITeacherLeave>(
  {
    teacherId: { type: String, required: true, index: true },
    classId: { type: String, required: true },
    subjectId: { type: String, default: undefined },
    date: { type: Date, required: true },
    pinnedNotes: { type: String, default: '', maxlength: 3000 },
    todayPlan: { type: String, default: undefined, maxlength: 3000 },
    status: { type: String, enum: ['Pending', 'Approved'], default: 'Approved' },
    substituteId: { type: String, default: undefined },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

TeacherLeaveSchema.index({ classId: 1, date: -1 })
TeacherLeaveSchema.index({ teacherId: 1, status: 1 })

const TeacherLeaveModel: Model<ITeacherLeave> =
  mongoose.models.TeacherLeave ?? mongoose.model<ITeacherLeave>('TeacherLeave', TeacherLeaveSchema)

export default TeacherLeaveModel
