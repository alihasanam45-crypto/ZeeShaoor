import mongoose, { Schema, Model } from 'mongoose'

export interface IRiskSignal {
  type: 'low_marks' | 'absenteeism' | 'missed_homework' | 'behavioral'
  detail: string
  severity: 'low' | 'medium' | 'high'
  detectedAt: Date
}

export interface IIntervention {
  _id: string
  studentId: string
  studentName?: string
  classId?: string
  riskSignals: IRiskSignal[]
  aiRecommendation: string
  status: 'Active' | 'In-Progress' | 'Resolved'
  createdAt: Date
  resolvedAt?: Date
  updatedAt: Date
}

const RiskSignalSchema = new Schema<IRiskSignal>(
  {
    type: {
      type: String,
      enum: ['low_marks', 'absenteeism', 'missed_homework', 'behavioral'],
      required: true,
    },
    detail: { type: String, required: true, maxlength: 500 },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    detectedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const InterventionSchema = new Schema<IIntervention>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: undefined },
    classId: { type: String, default: undefined },
    riskSignals: { type: [RiskSignalSchema], default: [] },
    aiRecommendation: { type: String, default: '', maxlength: 3000 },
    status: { type: String, enum: ['Active', 'In-Progress', 'Resolved'], default: 'Active' },
    resolvedAt: { type: Date, default: undefined },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

InterventionSchema.index({ status: 1, createdAt: -1 })
InterventionSchema.index({ studentId: 1, status: 1 })

const InterventionModel: Model<IIntervention> =
  mongoose.models.Intervention ??
  mongoose.model<IIntervention>('Intervention', InterventionSchema)

export default InterventionModel
