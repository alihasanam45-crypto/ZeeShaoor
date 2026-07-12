import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITestQuestionRef {
  questionId: string
  marks: number
  order: number
}

export interface ITestSection {
  label: string
  type: 'MCQ' | 'Short' | 'Long'
  instructions?: string
  questions: ITestQuestionRef[]
}

export interface ITest {
  _id: string
  title: string
  description?: string
  classLevel: string
  subject: string
  totalMarks: number
  timeAllowed: number
  sections: ITestSection[]
  antiCheat: {
    randomizeQuestions: boolean
    randomizeChoices: boolean
    shuffleWithinSections: boolean
  }
  status: 'draft' | 'published' | 'archived'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const TestQuestionRefSchema = new Schema<ITestQuestionRef>(
  {
    questionId: { type: String, required: true },
    marks: { type: Number, required: true, min: 1, max: 20 },
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const TestSectionSchema = new Schema<ITestSection>(
  {
    label: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['MCQ', 'Short', 'Long'] },
    instructions: { type: String, trim: true, default: undefined },
    questions: { type: [TestQuestionRefSchema], default: [] },
  },
  { _id: false }
)

const TestSchema = new Schema<ITest>(
  {
    title: { type: String, required: [true, 'Test title is required'], trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: undefined },
    classLevel: { type: String, required: [true, 'Class level is required'] },
    subject: { type: String, required: [true, 'Subject is required'], trim: true },
    totalMarks: { type: Number, required: true, min: 1 },
    timeAllowed: { type: Number, required: true, min: 1 },
    sections: { type: [TestSectionSchema], default: [] },
    antiCheat: {
      type: new Schema(
        {
          randomizeQuestions: { type: Boolean, default: true },
          randomizeChoices: { type: Boolean, default: true },
          shuffleWithinSections: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { randomizeQuestions: true, randomizeChoices: true, shuffleWithinSections: true },
    },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, minimize: true, versionKey: false }
)

TestSchema.index({ createdBy: 1, status: 1 })
TestSchema.index({ classLevel: 1, subject: 1 })

const TestModel: Model<ITest> =
  mongoose.models.Test ?? mongoose.model<ITest>('Test', TestSchema)

export default TestModel
