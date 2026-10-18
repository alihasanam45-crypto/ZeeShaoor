import mongoose, { Schema, Document, Model } from 'mongoose'

// --------- Interface ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface IComplaint extends Document {
  code: string
  category: 'teacher' | 'admin' | 'facility' | 'academic' | 'safety' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  subject: string
  body: string
  status: 'new' | 'reviewing' | 'resolved' | 'dismissed'
  assignedTo: string | null
  isAnonymous: boolean
  tags: string[]
  responses: {
    text: string
    by: string
    isAdmin: boolean
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

// --------- Schema ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const ComplaintSchema = new Schema<IComplaint>(
  {
    code: {
      type: String,
      unique: true,
      default: () => `ZS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    category: {
      type: String,
      enum: ['teacher', 'admin', 'facility', 'academic', 'safety', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    body:    { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'resolved', 'dismissed'],
      default: 'new',
    },
    assignedTo:  { type: String, default: null },
    isAnonymous: { type: Boolean, default: true },
    tags:        [{ type: String }],
    responses: [
      {
        text:      { type: String, required: true },
        by:        { type: String, required: true },
        isAdmin:   { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

// --------- Model (prevent re-compile in dev) ------------------------------------------------------------------------------------------------------------------------
const Complaint: Model<IComplaint> =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>('Complaint', ComplaintSchema)

export default Complaint