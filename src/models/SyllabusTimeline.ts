import mongoose, { Schema, Model } from 'mongoose'

export interface IChapter {
  chapterName: string
  priorityLevel: 'High' | 'Medium' | 'Low'
  estimatedDays: number
  isCompleted: boolean
  completedOnDate?: Date
}

export interface ISyllabusTimeline {
  _id: string
  classId: string
  subjectId: string
  chapters: IChapter[]
  examStartDate: Date
  createdAt: Date
  updatedAt: Date
}

const ChapterSchema = new Schema<IChapter>(
  {
    chapterName: { type: String, required: true, trim: true, maxlength: 200 },
    priorityLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    estimatedDays: { type: Number, required: true, min: 1 },
    isCompleted: { type: Boolean, default: false },
    completedOnDate: { type: Date, default: undefined },
  },
  { _id: false, minimize: true },
)

const SyllabusTimelineSchema = new Schema<ISyllabusTimeline>(
  {
    classId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    chapters: { type: [ChapterSchema], default: [] },
    examStartDate: { type: Date, required: true },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

SyllabusTimelineSchema.index({ classId: 1, subjectId: 1 }, { unique: true })

const SyllabusTimelineModel: Model<ISyllabusTimeline> =
  mongoose.models.SyllabusTimeline ??
  mongoose.model<ISyllabusTimeline>('SyllabusTimeline', SyllabusTimelineSchema)

export default SyllabusTimelineModel
