import mongoose, { Schema, Model } from 'mongoose'

export interface IPulseSurvey {
  _id: string
  classId: string
  teacherId: string
  topicTitle: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PulseSurveySchema = new Schema<IPulseSurvey>(
  {
    classId: { type: String, required: true, index: true },
    teacherId: { type: String, required: true, index: true },
    topicTitle: { type: String, required: true, maxlength: 200 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

PulseSurveySchema.index({ classId: 1, isActive: 1, createdAt: -1 })
PulseSurveySchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 })

const PulseSurveyModel: Model<IPulseSurvey> =
  mongoose.models.PulseSurvey ?? mongoose.model<IPulseSurvey>('PulseSurvey', PulseSurveySchema)

export default PulseSurveyModel
