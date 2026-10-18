import Student from '@/models/Student'
import QuizResult from '@/models/QuizResult'

/**
 * Shared quiz-performance metrics used by the teacher action layer
 * (benchmark, class analytics, learning paths, interventions, energy map).
 * Callers are responsible for connectDB() before invoking these.
 */

export interface RosterEntry {
  studentId: string
  studentName: string
}

export interface StudentScore extends RosterEntry {
  /** Accuracy percentage 0–100, one decimal. */
  score: number
  attempts: number
}

export function accuracyPct(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 1000) / 10
}

export async function getActiveClassStudents(classId: string): Promise<RosterEntry[]> {
  const students = await Student.find({ class: classId, status: 'active' }).select('name').lean()
  return students.map((s) => ({ studentId: String(s._id), studentName: s.name }))
}

/** Per-student accuracy in a subject (optionally scoped to one chapter) for a class. */
export async function getStudentScores(
  classId: string,
  subject: string,
  chapter?: string,
): Promise<StudentScore[]> {
  const roster = await getActiveClassStudents(classId)
  if (roster.length === 0) return []

  const match: Record<string, unknown> = {
    subject,
    studentId: { $in: roster.map((r) => r.studentId) },
  }
  if (chapter) match.chapter = chapter

  const agg = await QuizResult.aggregate<{ _id: string; total: number; correct: number }>([
    { $match: match },
    {
      $group: {
        _id: '$studentId',
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
      },
    },
  ])
  const byStudent = new Map(agg.map((r) => [r._id, r]))

  return roster
    .map(({ studentId, studentName }) => {
      const row = byStudent.get(studentId)
      return {
        studentId,
        studentName,
        score: row ? accuracyPct(row.correct, row.total) : 0,
        attempts: row?.total ?? 0,
      }
    })
    .sort((a, b) => b.score - a.score)
}
