import mongoose, { Schema, Model } from 'mongoose'

export interface IActionItem {
  task: string
  isCompleted: boolean
}

export interface IMeeting {
  _id: string
  teacherId: string
  parentId: string
  parentName?: string
  studentId: string
  studentName?: string
  scheduledDate: Date
  meetingLink?: string
  aiPreSummary?: string
  meetingNotes?: string
  actionItems: IActionItem[]
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled'
  createdAt: Date
  updatedAt: Date
}

const ActionItemSchema = new Schema<IActionItem>(
  {
    task: { type: String, required: true, maxlength: 500 },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false },
)

const MeetingSchema = new Schema<IMeeting>(
  {
    teacherId: { type: String, required: true, index: true },
    parentId: { type: String, required: true },
    parentName: { type: String, default: undefined },
    studentId: { type: String, required: true },
    studentName: { type: String, default: undefined },
    scheduledDate: { type: Date, required: true },
    meetingLink: { type: String, default: undefined },
    aiPreSummary: { type: String, maxlength: 5000, default: undefined },
    meetingNotes: { type: String, maxlength: 10000, default: undefined },
    actionItems: { type: [ActionItemSchema], default: [] },
    status: {
      type: String,
      enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

MeetingSchema.index({ studentId: 1, scheduledDate: -1 })
MeetingSchema.index({ teacherId: 1, status: 1 })

const MeetingModel: Model<IMeeting> =
  mongoose.models.Meeting ?? mongoose.model<IMeeting>('Meeting', MeetingSchema)

export default MeetingModel
