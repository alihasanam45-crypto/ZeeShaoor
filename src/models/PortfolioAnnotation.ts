import mongoose, { Schema, Model } from 'mongoose'

export interface IPortfolioAnnotation {
  _id: string
  studentId: string
  teacherId: string
  annotationText: string
  createdAt: Date
  updatedAt: Date
}

const PortfolioAnnotationSchema = new Schema<IPortfolioAnnotation>(
  {
    studentId: { type: String, required: true, index: true },
    teacherId: { type: String, required: true, index: true },
    annotationText: { type: String, required: true, maxlength: 5000 },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

PortfolioAnnotationSchema.index({ studentId: 1, createdAt: -1 })

const PortfolioAnnotationModel: Model<IPortfolioAnnotation> =
  mongoose.models.PortfolioAnnotation ??
  mongoose.model<IPortfolioAnnotation>('PortfolioAnnotation', PortfolioAnnotationSchema)

export default PortfolioAnnotationModel
