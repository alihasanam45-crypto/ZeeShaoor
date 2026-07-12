import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPastPaper extends Document {
  subject: string
  classLevel: string
  year: number
  board: 'Punjab' | 'Sindh' | 'KPK' | 'Federal' | 'AJK'
  paperType: 'Annual' | 'Supplementary'
  pdfUrl: string
  solutionUrl?: string
  totalSolves: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PastPaperSchema = new Schema<IPastPaper>(
  {
    subject:     { type: String, required: true },
    classLevel:  { type: String, required: true },
    year:        { type: Number, required: true },
    board: {
      type: String,
      enum: ['Punjab', 'Sindh', 'KPK', 'Federal', 'AJK'],
      required: true,
    },
    paperType: {
      type: String,
      enum: ['Annual', 'Supplementary'],
      default: 'Annual',
    },
    pdfUrl:      { type: String, required: true },
    solutionUrl: { type: String, default: undefined },
    totalSolves: { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
)

PastPaperSchema.index({ classLevel: 1, subject: 1 })
PastPaperSchema.index({ board: 1, year: 1 })

const PastPaper: Model<IPastPaper> =
  mongoose.models.PastPaper ??
  mongoose.model<IPastPaper>('PastPaper', PastPaperSchema)

export default PastPaper