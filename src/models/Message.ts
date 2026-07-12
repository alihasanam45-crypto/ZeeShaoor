import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReadReceipt {
  parentId: string
  readAt: Date
}

export interface IMessage {
  _id: string
  teacherId: string
  classId: string
  subject?: string
  recipients: string[]
  content: string
  type: 'Urdu_Template' | 'Custom' | 'Emergency'
  status: 'Scheduled' | 'Sent' | 'Delivered' | 'Read'
  scheduledFor?: Date
  sentAt?: Date
  readReceipts: IReadReceipt[]
  language: 'urdu' | 'english'
  createdAt: Date
  updatedAt: Date
}

const ReadReceiptSchema = new Schema<IReadReceipt>(
  {
    parentId: { type: String, required: true },
    readAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
)

const MessageSchema = new Schema<IMessage>(
  {
    teacherId: { type: String, required: true, index: true },
    classId: { type: String, required: true },
    subject: { type: String, trim: true, default: undefined },
    recipients: { type: [String], required: true },
    content: { type: String, required: true, maxlength: 5000 },
    type: {
      type: String,
      required: true,
      enum: ['Urdu_Template', 'Custom', 'Emergency'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Sent', 'Delivered', 'Read'],
      default: 'Scheduled',
    },
    scheduledFor: { type: Date, default: undefined },
    sentAt: { type: Date, default: undefined },
    readReceipts: { type: [ReadReceiptSchema], default: [] },
    language: { type: String, enum: ['urdu', 'english'], default: 'urdu' },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

MessageSchema.index({ teacherId: 1, status: 1, scheduledFor: 1 })
MessageSchema.index({ classId: 1, createdAt: -1 })

const MessageModel: Model<IMessage> =
  mongoose.models.Message ?? mongoose.model<IMessage>('Message', MessageSchema)

export default MessageModel
