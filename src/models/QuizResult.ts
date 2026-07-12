import mongoose, { Schema } from "mongoose";

const QuizResultSchema = new Schema({
  studentId:  { type: String, required: true },
  subject:    { type: String, required: true },
  chapter:    { type: String },
  questionId: { type: Schema.Types.ObjectId, ref: "Question" },
  isCorrect:  { type: Boolean, required: true },
  timeTaken:  { type: Number },
  createdAt:  { type: Date, default: Date.now },
});

QuizResultSchema.index({ studentId: 1, subject: 1 });

export default mongoose.models.QuizResult ||
  mongoose.model("QuizResult", QuizResultSchema);