import mongoose, { Schema, Model } from 'mongoose'

export interface ILearningPath {
  _id: string
  studentId: string
  classId: string
  subjectId: string
  assignedGroup: 'Strong' | 'Average' | 'Weak'
  isManuallyOverridden: boolean
  weekStartDate: Date
  createdAt: Date
  updatedAt: Date
}

const LearningPathSchema = new Schema<ILearningPath>(
  {
    studentId: { type: String, required: true },
    classId: { type: String, required: true },
    subjectId: { type: String, required: true },
    assignedGroup: {
      type: String,
      enum: ['Strong', 'Average', 'Weak'],
      required: true,
    },
    isManuallyOverridden: { type: Boolean, default: false },
    weekStartDate: { type: Date, required: true },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

LearningPathSchema.index({ studentId: 1, subjectId: 1, weekStartDate: -1 })
LearningPathSchema.index({ classId: 1, subjectId: 1, weekStartDate: -1 })

const LearningPathModel: Model<ILearningPath> =
  mongoose.models.LearningPath ?? mongoose.model<ILearningPath>('LearningPath', LearningPathSchema)

export default LearningPathModel
