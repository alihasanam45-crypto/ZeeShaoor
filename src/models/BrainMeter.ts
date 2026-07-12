import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBrainMeterWeek {
  weekStart: string
  testScore: number
  quizScore: number
  homeworkScore: number
  overallScore: number
}

export interface IBrainMeter extends Document {
  studentId: string
  subject: string
  weeklyData: IBrainMeterWeek[]
  createdAt: Date
  updatedAt: Date
}

const BrainMeterWeekSchema = new Schema<IBrainMeterWeek>(
  {
    weekStart:    { type: String, required: true },
    testScore:    { type: Number, required: true, min: 0, max: 100 },
    quizScore:    { type: Number, required: true, min: 0, max: 100 },
    homeworkScore: { type: Number, required: true, min: 0, max: 100 },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
)

const BrainMeterSchema = new Schema<IBrainMeter>(
  {
    studentId: {
      type:     String,
      required: true,
      index:    true,
    },
    subject: {
      type:     String,
      required: true,
    },
    weeklyData: {
      type:     [BrainMeterWeekSchema],
      default:  [],
    },
  },
  { timestamps: true }
)

BrainMeterSchema.index({ studentId: 1, subject: 1 }, { unique: true })

const BrainMeter: Model<IBrainMeter> =
  mongoose.models.BrainMeter ??
  mongoose.model<IBrainMeter>('BrainMeter', BrainMeterSchema)

export default BrainMeter
