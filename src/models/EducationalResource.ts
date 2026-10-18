import mongoose, { Schema, Model } from 'mongoose'

export interface IEducationalResource {
  _id: string
  topicId: string
  uploadedByTeacherId: string
  title: string
  url: string
  resourceType: 'PDF' | 'Video' | 'Link' | 'Document'
  ratings: { teacherId: string; score: number }[]
  avgRating: number
  savedBy: string[]
  createdAt: Date
  updatedAt: Date
}

const EducationalResourceSchema = new Schema<IEducationalResource>(
  {
    topicId: { type: String, required: true, index: true },
    uploadedByTeacherId: { type: String, required: true },
    title: { type: String, required: true, maxlength: 300 },
    url: { type: String, required: true, maxlength: 1000 },
    resourceType: {
      type: String,
      enum: ['PDF', 'Video', 'Link', 'Document'],
      required: true,
    },
    ratings: [
      {
        teacherId: { type: String, required: true },
        score: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    savedBy: [{ type: String }],
  },
  { timestamps: true, minimize: true, versionKey: false },
)

EducationalResourceSchema.index({ topicId: 1, avgRating: -1 })
EducationalResourceSchema.index({ savedBy: 1 })

// Pre-save: recalculate avgRating
EducationalResourceSchema.pre('save', function () {
  if (this.ratings.length > 0) {
    this.avgRating =
      Math.round((this.ratings.reduce((sum, r) => sum + r.score, 0) / this.ratings.length) * 10) / 10
  }
})

const EducationalResourceModel: Model<IEducationalResource> =
  mongoose.models.EducationalResource ??
  mongoose.model<IEducationalResource>('EducationalResource', EducationalResourceSchema)

export default EducationalResourceModel
