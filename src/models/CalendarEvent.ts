import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICalendarEvent extends Document {
  title: string
  date: string
  endDate?: string
  category: 'exam' | 'holiday' | 'event' | 'meeting' | 'deadline' | 'activity'
  description: string
  affectedClasses: string[]
  isRecurring: boolean
  priority: 'high' | 'medium' | 'low'
  status: 'upcoming' | 'ongoing' | 'completed'
  icon: string
  createdAt: Date
  updatedAt: Date
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    title:           { type: String, required: true, trim: true },
    date:            { type: String, required: true },
    endDate:         { type: String },
    category: {
      type: String,
      enum: ['exam', 'holiday', 'event', 'meeting', 'deadline', 'activity'],
      required: true,
    },
    description:     { type: String, required: true },
    affectedClasses: [{ type: String }],
    isRecurring:     { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    icon: { type: String, default: '📅' },
  },
  { timestamps: true }
)

const CalendarEvent: Model<ICalendarEvent> =
  mongoose.models.CalendarEvent ||
  mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema)

export default CalendarEvent