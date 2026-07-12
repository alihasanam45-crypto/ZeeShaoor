import mongoose, { Schema, Model } from 'mongoose'

export interface ICertificate {
  _id: string
  studentId: string
  title: string
  description?: string
  type: 'Streak' | 'Quiz' | 'Attendance' | 'Achievement'
  issuedAt: Date
  createdAt: Date
}

const CertificateSchema = new Schema<ICertificate>(
  {
    studentId: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000, default: undefined },
    type: {
      type: String,
      enum: ['Streak', 'Quiz', 'Attendance', 'Achievement'],
      required: true,
    },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

CertificateSchema.index({ studentId: 1, issuedAt: -1 })

const CertificateModel: Model<ICertificate> =
  mongoose.models.Certificate ??
  mongoose.model<ICertificate>('Certificate', CertificateSchema)

export default CertificateModel
