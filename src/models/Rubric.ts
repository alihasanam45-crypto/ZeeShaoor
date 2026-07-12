import mongoose, { Schema, Model } from 'mongoose'

export interface ICriterion {
  criterion: string
  maxPoints: number
  description?: string
}

export interface IRubric {
  _id: string
  teacherId: string
  title: string
  criteria: ICriterion[]
  totalPoints: number
  createdAt: Date
  updatedAt: Date
}

const CriterionSchema = new Schema<ICriterion>(
  {
    criterion: { type: String, required: true, maxlength: 200 },
    maxPoints: { type: Number, required: true, min: 1 },
    description: { type: String, maxlength: 500, default: undefined },
  },
  { _id: false },
)

const RubricSchema = new Schema<IRubric>(
  {
    teacherId: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    criteria: { type: [CriterionSchema], required: true, validate: [(v: ICriterion[]) => v.length >= 1, 'At least 1 criterion required'] },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

RubricSchema.pre('save', function () {
  this.totalPoints = this.criteria.reduce((sum, c) => sum + c.maxPoints, 0)
})

const RubricModel: Model<IRubric> =
  mongoose.models.Rubric ?? mongoose.model<IRubric>('Rubric', RubricSchema)

export default RubricModel
