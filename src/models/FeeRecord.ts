import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFeeRecord extends Document {
  studentId: string
  studentName: string
  rollNo: string
  class: string
  month: string        // e.g. "2025-03"
  amount: number
  paid: number
  balance: number
  status: 'paid' | 'partial' | 'unpaid' | 'waived'
  dueDate: string
  paidDate?: string
  paymentMethod?: 'cash' | 'bank' | 'online'
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

const FeeRecordSchema = new Schema<IFeeRecord>(
  {
    studentId:     { type: String, required: true },
    studentName:   { type: String, required: true },
    rollNo:        { type: String, required: true },
    class:         { type: String, required: true },
    month:         { type: String, required: true },
    amount:        { type: Number, required: true },
    paid:          { type: Number, default: 0 },
    balance:       { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['paid', 'partial', 'unpaid', 'waived'],
      default: 'unpaid',
    },
    dueDate:       { type: String, required: true },
    paidDate:      { type: String },
    paymentMethod: { type: String, enum: ['cash', 'bank', 'online'] },
    remarks:       { type: String },
  },
  { timestamps: true }
)

// Index for fast queries
FeeRecordSchema.index({ studentId: 1, month: 1 })
FeeRecordSchema.index({ status: 1 })
FeeRecordSchema.index({ class: 1 })

const FeeRecord: Model<IFeeRecord> =
  mongoose.models.FeeRecord ||
  mongoose.model<IFeeRecord>('FeeRecord', FeeRecordSchema)

export default FeeRecord