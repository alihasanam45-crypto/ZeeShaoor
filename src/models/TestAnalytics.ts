import mongoose, { Schema, Model } from 'mongoose'

export interface ITestAnalytics {
  _id: string
  testId: string
  classId: string
  meanScore: number
  standardDeviation: number
  difficultyFlag: boolean
  suggestedNormalizationCurve: string
  scoreDistribution: number[]
  failureRate: number
  createdAt: Date
  updatedAt: Date
}

const TestAnalyticsSchema = new Schema<ITestAnalytics>(
  {
    testId: { type: String, required: true, unique: true, index: true },
    classId: { type: String, required: true, index: true },
    meanScore: { type: Number, required: true, min: 0, max: 100 },
    standardDeviation: { type: Number, required: true, min: 0 },
    difficultyFlag: { type: Boolean, default: false },
    suggestedNormalizationCurve: { type: String, default: '' },
    scoreDistribution: { type: [Number], default: [] },
    failureRate: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

const TestAnalyticsModel: Model<ITestAnalytics> =
  mongoose.models.TestAnalytics ?? mongoose.model<ITestAnalytics>('TestAnalytics', TestAnalyticsSchema)

export default TestAnalyticsModel
