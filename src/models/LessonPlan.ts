import mongoose, { Schema, Model } from 'mongoose'

export interface ILessonPlan {
  _id: string
  teacherId: string
  topicName: string
  duration: number
  studentLevel: string
  language: 'Urdu' | 'English'
  content: {
    hook: string
    explanation: string
    activity: string
    assessment: string
  }
  isSaved: boolean
  createdAt: Date
  updatedAt: Date
}

const LessonPlanSchema = new Schema<ILessonPlan>(
  {
    teacherId: { type: String, required: true, index: true },
    topicName: { type: String, required: true, maxlength: 200 },
    duration: { type: Number, required: true, min: 5, max: 180 },
    studentLevel: { type: String, required: true, maxlength: 100 },
    language: { type: String, enum: ['Urdu', 'English'], required: true },
    content: {
      hook: { type: String, required: true, maxlength: 5000 },
      explanation: { type: String, required: true, maxlength: 10000 },
      activity: { type: String, required: true, maxlength: 5000 },
      assessment: { type: String, required: true, maxlength: 5000 },
    },
    isSaved: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

LessonPlanSchema.index({ teacherId: 1, isSaved: 1, createdAt: -1 })

const LessonPlanModel: Model<ILessonPlan> =
  mongoose.models.LessonPlan ?? mongoose.model<ILessonPlan>('LessonPlan', LessonPlanSchema)

export default LessonPlanModel
