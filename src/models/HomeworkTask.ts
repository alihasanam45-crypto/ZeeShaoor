import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IHomeworkTask {
  _id: string
  teacherId: string
  classId: string
  title: string
  description: string
  rubric: string
  recurrence: 'None' | 'Weekly' | 'Monthly'
  dayOfWeek?: number
  dueDate: Date
  totalPoints: number
  autoAlertParents: boolean
  createdAt: Date
  updatedAt: Date
}

const HomeworkTaskSchema = new Schema<IHomeworkTask>(
  {
    teacherId: { type: String, required: true, index: true },
    classId: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    rubric: { type: String, trim: true, maxlength: 2000, default: '' },
    recurrence: { type: String, enum: ['None', 'Weekly', 'Monthly'], default: 'None' },
    dayOfWeek: { type: Number, min: 0, max: 6, default: undefined },
    dueDate: { type: Date, required: true },
    totalPoints: { type: Number, default: 10, min: 1, max: 100 },
    autoAlertParents: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

HomeworkTaskSchema.index({ classId: 1, dueDate: 1 })
HomeworkTaskSchema.index({ recurrence: 1, dayOfWeek: 1 })

const HomeworkTaskModel: Model<IHomeworkTask> =
  mongoose.models.HomeworkTask ?? mongoose.model<IHomeworkTask>('HomeworkTask', HomeworkTaskSchema)

export default HomeworkTaskModel
