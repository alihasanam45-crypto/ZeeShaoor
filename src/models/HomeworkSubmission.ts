import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IHomeworkSubmission {
  _id: string
  taskId: string
  studentId: string
  content: string
  status: 'Pending' | 'Submitted' | 'Graded' | 'Missing'
  submittedAt?: Date
  aiScore?: number
  aiFeedback?: string
  teacherNotes?: string
  createdAt: Date
  updatedAt: Date
}

const HomeworkSubmissionSchema = new Schema<IHomeworkSubmission>(
  {
    taskId: { type: String, required: true, index: true },
    studentId: { type: String, required: true },
    content: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Graded', 'Missing'],
      default: 'Pending',
    },
    submittedAt: { type: Date, default: undefined },
    aiScore: { type: Number, min: 0, max: 100, default: undefined },
    aiFeedback: { type: String, maxlength: 2000, default: undefined },
    teacherNotes: { type: String, maxlength: 2000, default: undefined },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

HomeworkSubmissionSchema.index({ taskId: 1, studentId: 1 }, { unique: true })
HomeworkSubmissionSchema.index({ taskId: 1, status: 1 })
HomeworkSubmissionSchema.index({ studentId: 1, status: 1 })

const HomeworkSubmissionModel: Model<IHomeworkSubmission> =
  mongoose.models.HomeworkSubmission ??
  mongoose.model<IHomeworkSubmission>('HomeworkSubmission', HomeworkSubmissionSchema)

export default HomeworkSubmissionModel
