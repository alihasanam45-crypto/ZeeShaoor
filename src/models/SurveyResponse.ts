import mongoose, { Schema, Model } from 'mongoose'
import crypto from 'crypto'

/**
 * SurveyResponse — fully anonymous.
 *
 * studentHash = SHA256(studentId + '|' + surveyId + '|' + PEPPER)
 * This prevents duplicate submissions while keeping the student identity
 * completely hidden from the teacher and the system.
 *
 * PEPPER is loaded from env: PULSE_PEPPER (default 'zee-pulse-pepper')
 */
export interface ISurveyResponse {
  _id: string
  surveyId: string
  studentHash: string
  understood: boolean
  difficultyRating: number
  createdAt: Date
}

const SurveyResponseSchema = new Schema<ISurveyResponse>(
  {
    surveyId: { type: String, required: true, index: true },
    studentHash: { type: String, required: true },
    understood: { type: Boolean, required: true },
    difficultyRating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

SurveyResponseSchema.index({ surveyId: 1, studentHash: 1 }, { unique: true })
SurveyResponseSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 })

/**
 * Generate an anonymous hash for a student's survey response.
 * The teacher CANNOT reverse this to identify the student.
 */
export function hashStudent(surveyId: string, studentId: string): string {
  const pepper = process.env.PULSE_PEPPER || 'zee-pulse-pepper'
  return crypto
    .createHash('sha256')
    .update(`${studentId}|${surveyId}|${pepper}`)
    .digest('hex')
}

const SurveyResponseModel: Model<ISurveyResponse> =
  mongoose.models.SurveyResponse ??
  mongoose.model<ISurveyResponse>('SurveyResponse', SurveyResponseSchema)

export default SurveyResponseModel
