import mongoose, { Schema, Document, Model } from 'mongoose'

export const CLASS_SUBJECT_MATRIX: Record<string, string[]> = {
  '5': [
    'Urdu', 'English', 'Islamiyat', 'Mathematics', 'Science', 'Social Studies',
  ],
  '6': [
    'Urdu', 'English', 'Islamiyat', 'Al Quran', 'Mathematics',
    'Science', 'Computer', 'History', 'Geography',
  ],
  '7': [
    'Urdu', 'English', 'Islamiyat', 'Al Quran', 'Mathematics',
    'Science', 'Computer', 'History', 'Geography',
  ],
  '8': [
    'Urdu', 'English', 'Islamiyat', 'Al Quran', 'Mathematics',
    'Science', 'Computer', 'History', 'Geography',
  ],
  '9': [
    'Urdu', 'English', 'Al Quran', 'Islamiyat (Compulsory)', 'Pak Studies',
    'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer',
    'General Mathematics', 'General Science', 'Islamiyat (Elective)', 'Punjabi',
    'Home Economics', 'Education', 'Health & Physical Education', 'Poultry',
    'Civics', 'Ethics', 'Economics', 'Food & Nutrition',
  ],
  '10': [
    'Urdu', 'English', 'Al Quran', 'Islamiyat (Compulsory)', 'Pak Studies',
    'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer',
    'General Mathematics', 'General Science', 'Islamiyat (Elective)', 'Punjabi',
    'Home Economics', 'Education', 'Health & Physical Education', 'Poultry',
    'Civics', 'Ethics', 'Economics', 'Food & Nutrition',
  ],
  '11': [
    'Urdu', 'English', 'Islamiyat (Compulsory)', 'Pak Studies', 'Al Quran',
    'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer', 'Statistics',
    'Civics', 'Education', 'Islamiyat (Elective)', 'Punjabi', 'Economics',
    'Accounting', 'Business Maths', 'Principles of Commerce',
    'Principles of Economics', 'Health & Physical Education', 'Sociology',
    'Psychology', 'Physical Geography', 'History of Pakistan', 'Islamic History',
    'Ethics', 'Home Economics', 'Library Science',
  ],
  '12': [
    'Urdu', 'English', 'Islamiyat (Compulsory)', 'Pak Studies', 'Al Quran',
    'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer', 'Statistics',
    'Civics', 'Education', 'Islamiyat (Elective)', 'Punjabi', 'Economics',
    'Accounting', 'Business Maths', 'Principles of Commerce',
    'Principles of Economics', 'Health & Physical Education', 'Sociology',
    'Psychology', 'Physical Geography', 'History of Pakistan', 'Islamic History',
    'Ethics', 'Home Economics', 'Library Science',
  ],
}

export const ALLOWED_CLASS_LEVELS = Object.keys(CLASS_SUBJECT_MATRIX) as string[]

export function isSubjectAllowed(classLevel: string, subject: string): boolean {
  const allowed = CLASS_SUBJECT_MATRIX[classLevel]
  if (!allowed) return false
  return allowed.includes(subject)
}

export interface IQuestion {
  _id:           string
  classLevel:    '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
  subject:       string
  chapter:       string
  questionType:  'MCQ' | 'Short' | 'Long'
  questionText:  string
  options:       string[]
  correctAnswer: string
  difficulty:    'Easy' | 'Medium' | 'Hard'
  sloTag?:       'Knowledge' | 'Comprehension' | 'Application'
  subType?:      'Theory' | 'Numerical_Reasoning'
  questionCategory?: 'Long_Theory' | 'Long_Numerical'
  boardId?:      string
  boardTags?:    string[]
  region?:       string
  year?:         number
  marks?:        number
  createdBy?:    string
  createdAt:     Date
  updatedAt:     Date
}

const QuestionSchema = new Schema<IQuestion>(
  {
    _id: {
      type: String,
    },
    classLevel: {
      type:     String,
      required: [true, 'classLevel is required'],
      enum: {
        values:   ALLOWED_CLASS_LEVELS,
        message:  'classLevel must be one of: 5, 6, 7, 8, 9, 10, 11, 12',
      },
    },
    subject: {
      type:     String,
      required: [true, 'subject is required'],
      trim:     true,
      validate: {
        validator(value: string): boolean {
          const level = (this as unknown as IQuestion).classLevel
          if (!level) return false
          const allowed = CLASS_SUBJECT_MATRIX[level]
          if (!allowed) return false
          return allowed.includes(value)
        },
        message(props: { value: string }): string {
          return (
            `"${props.value}" is not a valid subject for this class level. ` +
            `Please check the Class-Subject Matrix and re-upload.`
          )
        },
      },
    },
    chapter: {
      type:      String,
      required:  [true, 'chapter is required'],
      trim:      true,
      maxlength: [120, 'chapter name too long (max 120 chars)'],
    },
    questionType: {
      type:     String,
      required: [true, 'questionType is required'],
      enum: {
        values:  ['MCQ', 'Short', 'Long'],
        message: 'questionType must be MCQ, Short, or Long',
      },
    },
    questionText: {
      type:      String,
      required:  [true, 'questionText is required'],
      trim:      true,
      minlength: [5,    'questionText too short (min 5 chars)'],
      maxlength: [2000, 'questionText too long (max 2000 chars)'],
    },
    options: {
      type:    [String],
      default: undefined,
      validate: [
        {
          validator(arr: string[]): boolean {
            if (!arr || arr.length === 0) return true
            return arr.length <= 4
          },
          message: 'options cannot have more than 4 items',
        },
        {
          validator(arr: string[]): boolean {
            const doc = this as unknown as IQuestion
            if (doc.questionType === 'MCQ') {
              return Array.isArray(arr) && arr.length >= 2
            }
            return !arr || arr.length === 0
          },
          message: 'MCQ questions require 2–4 options. Short/Long questions must not have options.',
        },
      ],
    },
    correctAnswer: {
      type:      String,
      required:  [true, 'correctAnswer is required'],
      trim:      true,
      maxlength: [500, 'correctAnswer too long (max 500 chars)'],
    },
    difficulty: {
      type:     String,
      required: [true, 'difficulty is required'],
      enum: {
        values:  ['Easy', 'Medium', 'Hard'],
        message: 'difficulty must be Easy, Medium, or Hard',
      },
    },
    sloTag: {
      type:     String,
      enum: {
        values:  ['Knowledge', 'Comprehension', 'Application'],
        message: 'sloTag must be Knowledge, Comprehension, or Application',
      },
      default: undefined,
    },
    subType: {
      type:     String,
      enum: {
        values:  ['Theory', 'Numerical_Reasoning'],
        message: 'subType must be Theory or Numerical_Reasoning',
      },
      default: undefined,
    },
    questionCategory: {
      type:     String,
      enum: {
        values:  ['Long_Theory', 'Long_Numerical'],
        message: 'questionCategory must be Long_Theory or Long_Numerical',
      },
      default: undefined,
    },
    boardId: {
      type:    String,
      trim:    true,
      default: undefined,
    },
    boardTags: {
      type:    [String],
      default: undefined,
    },
    region: {
      type:    String,
      trim:    true,
      default: undefined,
    },
    year: {
      type:    Number,
      min:     [2000, 'year must be 2000 or later'],
      validate: {
        validator(value: number): boolean {
          if (value === undefined || value === null) return true
          return value <= new Date().getFullYear() + 1
        },
        message: 'year cannot be in the future',
      },
      default: undefined,
    },
    marks: {
      type:    Number,
      min:     [1, 'marks must be at least 1'],
      max:     [20, 'marks cannot exceed 20'],
      default: undefined,
    },
    createdBy: {
      type:    String,
      default: undefined,
    },
  },
  {
    timestamps:  true,
    minimize:    true,
    versionKey:  false,
  }
)

QuestionSchema.index({ classLevel: 1, subject: 1 })
QuestionSchema.index({ classLevel: 1, subject: 1, chapter: 1 })
QuestionSchema.index({ classLevel: 1, difficulty: 1 })
QuestionSchema.index({ questionType: 1 })
QuestionSchema.index({ boardId: 1, year: 1 })
QuestionSchema.index({ boardTags: 1 })
QuestionSchema.index({ region: 1 })

const QuestionModel: Model<IQuestion> =
  mongoose.models.Question ?? mongoose.model<IQuestion>('Question', QuestionSchema)

export default QuestionModel