import mongoose, { Schema, Document } from 'mongoose';

// 1. TypeScript Interface for Strict Analytics Typing
export interface IResult extends Document {
  studentId: mongoose.Types.ObjectId; // Links directly to the User Schema
  assessmentType: 'MockExam' | 'BrainGym' | 'PastPaper';
  title: string;          // e.g., "Physics Chapter 3 Assessment"
  subject: string;
  chapter?: number;       // Optional, because some exams might be full book
  totalQuestions: number;
  correctAnswers: number;
  obtainedMarks: number;
  totalMarks: number;
  accuracy: number;       // Percentage score
  xpEarned: number;       // Experience points gained for Launchpad stats
  timeSpentMinutes: number; // Time taken to complete the exam
}

// 2. Mongoose Schema Definition
const ResultSchema: Schema = new Schema(
  {
    studentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    assessmentType: { 
      type: String, 
      enum: ['MockExam', 'BrainGym', 'PastPaper'], 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    subject: { 
      type: String, 
      required: true 
    },
    chapter: { 
      type: Number 
    },
    totalQuestions: { 
      type: Number, 
      required: true 
    },
    correctAnswers: { 
      type: Number, 
      required: true 
    },
    obtainedMarks: { 
      type: Number, 
      required: true 
    },
    totalMarks: { 
      type: Number, 
      required: true 
    },
    accuracy: { 
      type: Number, 
      required: true 
    },
    xpEarned: { 
      type: Number, 
      default: 0 
    },
    timeSpentMinutes: { 
      type: Number, 
      required: true 
    }
  },
  { 
    // Timestamps automatically record exactly when the exam was submitted
    timestamps: true 
  }
);

// 3. Prevent Model Overwrite in Next.js
const Result = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);

export default Result;