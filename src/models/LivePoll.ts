import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPollOption {
  text: string
  votes: number
  voterIds?: string[]
}

export interface ILivePoll {
  _id: string
  sessionId: string
  question: string
  options: IPollOption[]
  isActive: boolean
  totalVotes: number
  createdAt: Date
  updatedAt: Date
}

const PollOptionSchema = new Schema<IPollOption>(
  {
    text: { type: String, required: true, maxlength: 200 },
    votes: { type: Number, default: 0, min: 0 },
    voterIds: { type: [String], default: [] },
  },
  { _id: false, minimize: true },
)

const LivePollSchema = new Schema<ILivePoll>(
  {
    sessionId: { type: String, required: true, index: true },
    question: { type: String, required: true, trim: true, maxlength: 500 },
    options: { type: [PollOptionSchema], required: true, validate: [(v: IPollOption[]) => v.length >= 2, 'At least 2 options required'] },
    isActive: { type: Boolean, default: true },
    totalVotes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

const LivePollModel: Model<ILivePoll> =
  mongoose.models.LivePoll ?? mongoose.model<ILivePoll>('LivePoll', LivePollSchema)

export default LivePollModel
