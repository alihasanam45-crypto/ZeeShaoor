import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IStudent extends Document {
  name: string
  rollNo: string
  class: string
  section: string
  gender: 'male' | 'female'
  dateOfBirth: string
  guardianName: string
  guardianPhone: string
  address: string
  admissionDate: string
  status: 'active' | 'inactive' | 'graduated' | 'expelled'
  // Academic
  gpa: number
  attendance: number
  subjects: { name: string; score: number }[]
  // Wellbeing
  wellbeingScore?: number
  riskLevel?: 'safe' | 'watch' | 'danger' | 'critical'
  createdAt: Date
  updatedAt: Date
}

const StudentSchema = new Schema<IStudent>(
  {
    name:          { type: String, required: true, trim: true },
    rollNo:        { type: String, required: true, unique: true },
    class:         { type: String, required: true },
    section:       { type: String, required: true },
    gender:        { type: String, enum: ['male', 'female'], required: true },
    dateOfBirth:   { type: String },
    guardianName:  { type: String },
    guardianPhone: { type: String },
    address:       { type: String },
    admissionDate: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'expelled'],
      default: 'active',
    },
    gpa:        { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    subjects: [
      {
        name:  { type: String },
        score: { type: Number },
      },
    ],
    wellbeingScore: { type: Number },
    riskLevel: {
      type: String,
      enum: ['safe', 'watch', 'danger', 'critical'],
    },
  },
  { timestamps: true }
)

StudentSchema.index({ rollNo: 1 })
StudentSchema.index({ class: 1, section: 1 })
StudentSchema.index({ status: 1 })

const Student: Model<IStudent> =
  mongoose.models.Student ||
  mongoose.model<IStudent>('Student', StudentSchema)

export default Student