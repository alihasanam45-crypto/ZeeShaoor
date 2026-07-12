import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISystemId extends Document {
  code: string        // ZSH-0001
  isUsed: boolean
  usedBy?: string     // User email
  usedAt?: Date
  createdAt: Date
}

const SystemIdSchema = new Schema<ISystemId>(
  {
    code:    { type: String, required: true, unique: true },
    isUsed:  { type: Boolean, default: false },
    usedBy:  { type: String, default: undefined },
    usedAt:  { type: Date,   default: undefined },
  },
  { timestamps: true }
)

const SystemId: Model<ISystemId> =
  mongoose.models.SystemId ??
  mongoose.model<ISystemId>('SystemId', SystemIdSchema)

export default SystemId