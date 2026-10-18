import mongoose, { Schema, Model } from 'mongoose'

export interface IEssaySubmission {
  _id: string
  studentId: string
  rubricId: string
  essayText: string
  aiScore: number
  totalPoints: number
  metCriteria: { criterion: string; points: number }[]
  unmetCriteria: { criterion: string; points: number; reason: string }[]
  aiFeedback: string
  submittedAt: Date
  createdAt: Date
}

const MetCriterionSchema = new Schema(
  {
    criterion: { type: String, required: true },
    points: { type: Number, required: true },
  },
  { _id: false },
)

const UnmetCriterionSchema = new Schema(
  {
    criterion: { type: String, required: true },
    points: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { _id: false },
)

const EssaySubmissionSchema = new Schema<IEssaySubmission>(
  {
    studentId: { type: String, required: true, index: true },
    rubricId: { type: String, required: true, index: true },
    essayText: { type: String, required: true },
    aiScore: { type: Number, required: true, min: 0 },
    totalPoints: { type: Number, required: true },
    metCriteria: { type: [MetCriterionSchema], default: [] },
    unmetCriteria: { type: [UnmetCriterionSchema], default: [] },
    aiFeedback: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

const EssaySubmissionModel: Model<IEssaySubmission> =
  mongoose.models.EssaySubmission ??
  mongoose.model<IEssaySubmission>('EssaySubmission', EssaySubmissionSchema)

export default EssaySubmissionModel
