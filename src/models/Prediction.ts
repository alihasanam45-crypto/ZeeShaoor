import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPrediction {
  _id: string
  studentId: string
  classLevel: string
  subject: string
  predictedMin: number
  predictedMax: number
  confidenceScore: number
  factors: {
    quizTrend: number
    homeworkRate: number
    streak: number
    quizScores: number[]
    variance: number
  }
  interventionNeeded: boolean
  createdAt: Date
  updatedAt: Date
}

const PredictionSchema = new Schema<IPrediction>(
  {
    studentId: { type: String, required: true, index: true },
    classLevel: { type: String, required: true },
    subject: { type: String, required: true },
    predictedMin: { type: Number, required: true, min: 0, max: 100 },
    predictedMax: { type: Number, required: true, min: 0, max: 100 },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    factors: {
      type: new Schema(
        {
          quizTrend: { type: Number, default: 0 },
          homeworkRate: { type: Number, default: 0 },
          streak: { type: Number, default: 0 },
          quizScores: { type: [Number], default: [] },
          variance: { type: Number, default: 0 },
        },
        { _id: false },
      ),
      required: true,
    },
    interventionNeeded: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

PredictionSchema.index({ studentId: 1, subject: 1, createdAt: -1 })
PredictionSchema.index({ classLevel: 1, interventionNeeded: 1 })

const PredictionModel: Model<IPrediction> =
  mongoose.models.Prediction ?? mongoose.model<IPrediction>('Prediction', PredictionSchema)

export default PredictionModel
