import mongoose, { Schema, Model } from 'mongoose'

export interface ICollabPlan {
  _id: string
  subjectId: string
  title: string
  authorId: string
  authorName?: string
  content: string
  monthlyRating: number
  ratingCount: number
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

const CollabPlanSchema = new Schema<ICollabPlan>(
  {
    subjectId: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 300 },
    authorId: { type: String, required: true },
    authorName: { type: String, default: undefined },
    content: { type: String, default: '' },
    monthlyRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

CollabPlanSchema.index({ subjectId: 1, monthlyRating: -1 })
CollabPlanSchema.index({ isPinned: 1, monthlyRating: -1 })

const CollabPlanModel: Model<ICollabPlan> =
  mongoose.models.CollabPlan ?? mongoose.model<ICollabPlan>('CollabPlan', CollabPlanSchema)

export default CollabPlanModel
