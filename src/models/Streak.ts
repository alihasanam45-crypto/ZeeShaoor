import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDailyLog {
  date: string
  isActive: boolean
  hasQuiz: boolean
  hasHomework: boolean
  hasNotes: boolean
}

export interface IMilestone {
  day: number
  achievedAt: Date
}

export interface INanoStreak {
  type: string
  count: number
  active: boolean
  startedAt: Date
}

export interface IStreak extends Document {
  studentId: string
  logs: IDailyLog[]
  lastActiveDate: string
  currentStreak: number
  longestStreak: number
  milestonesReached: number[]      // ← yeh add hua
  milestoneHistory: IMilestone[]
  nanoStreaks: INanoStreak[]
  createdAt: Date
  updatedAt: Date
}

const DailyLogSchema = new Schema<IDailyLog>(
  {
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD format'],
    },
    isActive:    { type: Boolean, default: false },
    hasQuiz:     { type: Boolean, default: false },
    hasHomework: { type: Boolean, default: false },
    hasNotes:    { type: Boolean, default: false },
  },
  { _id: false }
)

const MilestoneSchema = new Schema<IMilestone>(
  {
    day:        { type: Number, required: true },
    achievedAt: { type: Date, required: true },
  },
  { _id: false }
)

const NanoStreakSchema = new Schema<INanoStreak>(
  {
    type:      { type: String, required: true },
    count:     { type: Number, default: 0 },
    active:    { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const StreakSchema = new Schema<IStreak>(
  {
    studentId:        { type: String, required: true, unique: true, index: true },
    logs:             { type: [DailyLogSchema], default: [] },
    lastActiveDate:   { type: String, default: '' },
    currentStreak:    { type: Number, default: 0 },
    longestStreak:    { type: Number, default: 0 },
    milestonesReached:{ type: [Number], default: [] },   // ← yeh add hua
    milestoneHistory: { type: [MilestoneSchema], default: [] },
    nanoStreaks:      { type: [NanoStreakSchema], default: [] },
  },
  { timestamps: true }
)

StreakSchema.index({ lastActiveDate: 1 })

const Streak: Model<IStreak> =
  mongoose.models.Streak ??
  mongoose.model<IStreak>('Streak', StreakSchema)

export default Streak