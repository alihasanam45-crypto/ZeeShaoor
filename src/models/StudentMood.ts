import mongoose, { Schema, Document, Model } from 'mongoose'

export type MoodValue = 'Happy' | 'Tired' | 'Stressed' | 'Confused' | 'Excited'

export interface IStudentMood {
  _id: string
  studentId: string
  classLevel: string
  moodValue: MoodValue
  timestamp: Date
  metadata: {
    deviceType?: string
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
    ipHash?: string
  }
  createdAt: Date
  updatedAt: Date
}

const StudentMoodSchema = new Schema<IStudentMood>(
  {
    studentId: { type: String, required: true, index: true },
    classLevel: { type: String, required: true },
    moodValue: {
      type: String,
      required: true,
      enum: ['Happy', 'Tired', 'Stressed', 'Confused', 'Excited'],
    },
    timestamp: { type: Date, required: true, default: Date.now },
    metadata: {
      type: new Schema(
        {
          deviceType: { type: String, default: undefined },
          timeOfDay: {
            type: String,
            enum: ['morning', 'afternoon', 'evening', 'night'],
            default: undefined,
          },
          ipHash: { type: String, default: undefined },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true, minimize: true, versionKey: false }
)

StudentMoodSchema.index({ studentId: 1, timestamp: -1 })
StudentMoodSchema.index({ classLevel: 1, timestamp: -1 })
StudentMoodSchema.index({ moodValue: 1 })
StudentMoodSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 })

const StudentMoodModel: Model<IStudentMood> =
  mongoose.models.StudentMood ?? mongoose.model<IStudentMood>('StudentMood', StudentMoodSchema)

export default StudentMoodModel
