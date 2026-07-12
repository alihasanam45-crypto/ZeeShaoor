import mongoose, { Schema, Model } from 'mongoose'

/**
 * ConfidentialMessage — bypasses the teacher completely.
 * Only accessible by the Admin/Principal role.
 * The teacher CANNOT see these messages.
 */
export interface IConfidentialMessage {
  _id: string
  studentId: string
  studentName?: string
  messageText: string
  timestamp: Date
  createdAt: Date
}

const ConfidentialMessageSchema = new Schema<IConfidentialMessage>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: undefined },
    messageText: { type: String, required: true, maxlength: 5000 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

ConfidentialMessageSchema.index({ createdAt: -1 })

const ConfidentialMessageModel: Model<IConfidentialMessage> =
  mongoose.models.ConfidentialMessage ??
  mongoose.model<IConfidentialMessage>('ConfidentialMessage', ConfidentialMessageSchema)

export default ConfidentialMessageModel
