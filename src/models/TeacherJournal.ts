import mongoose, { Schema, Model } from 'mongoose'

/**
 * TeacherJournal schema.
 *
 * ACCESS CONTROL (enforced at API / service layer):
 * - reflectionText is PRIVATE. Admin users MUST NEVER have read access.
 * - Only the owning teacher and the teacher's own session can read/create entries.
 * - When querying for admin dashboards, reflectionText must be explicitly excluded
 *   via `.select('-reflectionText')` or by using a projection that omits it.
 */
export interface ITeacherJournal {
  _id: string
  teacherId: string
  entryDate: Date
  reflectionText: string
  createdAt: Date
  updatedAt: Date
}

const TeacherJournalSchema = new Schema<ITeacherJournal>(
  {
    teacherId: { type: String, required: true, index: true },
    entryDate: { type: Date, required: true, default: Date.now },
    reflectionText: { type: String, required: true, maxlength: 10000 },
  },
  { timestamps: true, minimize: true, versionKey: false },
)

TeacherJournalSchema.index({ teacherId: 1, entryDate: -1 })

const TeacherJournalModel: Model<ITeacherJournal> =
  mongoose.models.TeacherJournal ??
  mongoose.model<ITeacherJournal>('TeacherJournal', TeacherJournalSchema)

export default TeacherJournalModel
