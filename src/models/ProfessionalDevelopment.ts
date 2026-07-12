import mongoose, { Schema, Model } from 'mongoose'

export interface ITermGoal {
  goalText: string
  isCompleted: boolean
}

export interface IProfessionalDevelopment {
  _id: string
  teacherId: string
  pdHoursCompleted: number
  pdHoursTarget?: number
  termGoals: ITermGoal[]
  academicYear: string
  createdAt: Date
  updatedAt: Date
}

const TermGoalSchema = new Schema<ITermGoal>(
  {
    goalText: { type: String, required: true, maxlength: 500 },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false },
)

const ProfessionalDevelopmentSchema = new Schema<IProfessionalDevelopment>(
  {
    teacherId: { type: String, required: true, index: true, unique: true },
    pdHoursCompleted: { type: Number, default: 0, min: 0 },
    pdHoursTarget: { type: Number, default: 40, min: 1 },
    termGoals: { type: [TermGoalSchema], default: [] },
    academicYear: { type: String, required: true, default: '2025-2026' },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

const ProfessionalDevelopmentModel: Model<IProfessionalDevelopment> =
  mongoose.models.ProfessionalDevelopment ??
  mongoose.model<IProfessionalDevelopment>('ProfessionalDevelopment', ProfessionalDevelopmentSchema)

export default ProfessionalDevelopmentModel
