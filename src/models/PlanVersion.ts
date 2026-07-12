import mongoose, { Schema, Model } from 'mongoose'

export interface IPlanVersion {
  _id: string
  planId: string
  editedById: string
  editorName?: string
  changesMade: string
  contentSnapshot: string
  timestamp: Date
  createdAt: Date
}

const PlanVersionSchema = new Schema<IPlanVersion>(
  {
    planId: { type: String, required: true, index: true },
    editedById: { type: String, required: true },
    editorName: { type: String, default: undefined },
    changesMade: { type: String, required: true, maxlength: 1000 },
    contentSnapshot: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

PlanVersionSchema.index({ planId: 1, timestamp: -1 })

const PlanVersionModel: Model<IPlanVersion> =
  mongoose.models.PlanVersion ?? mongoose.model<IPlanVersion>('PlanVersion', PlanVersionSchema)

export default PlanVersionModel
