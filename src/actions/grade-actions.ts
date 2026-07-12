'use server'

export interface Grade {
  id: string
  studentId: string
  subject: string
  score: number
  totalMarks: number
  grade: string
  term: string
  date: string
}

export interface TestAnalytics {
  testId: string
  classId: string
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number
  scoreDistribution: { range: string; count: number }[]
  commonMistakes: { topic: string; errorRate: number }[]
}

export async function getGrades(studentId?: string) {
  return [] as Grade[]
}

export async function getGradeById(id: string) {
  return null as Grade | null
}

export async function addGrade(data: Omit<Grade, 'id'>) {
  return { id: crypto.randomUUID(), ...data } as Grade
}

export async function getGradeDistribution(subject: string, classId: string) {
  return { A: 0, B: 0, C: 0, D: 0, F: 0 }
}
export async function analyzeTestScores(testId: string, classId: string, scores: number[]) {
  const total = scores.reduce((sum, s) => sum + s, 0)
  const avg = scores.length > 0 ? total / scores.length : 0
  const max = scores.length > 0 ? Math.max(...scores) : 0
  const min = scores.length > 0 ? Math.min(...scores) : 0
  const passing = scores.filter(s => s >= 40).length
  return {
    testId,
    classId,
    totalStudents: scores.length,
    averageScore: Math.round(avg * 10) / 10,
    highestScore: max,
    lowestScore: min,
    passRate: scores.length > 0 ? Math.round((passing / scores.length) * 100) : 0,
    distribution: {
      excellent: scores.filter(s => s >= 80).length,
      good: scores.filter(s => s >= 60 && s < 80).length,
      fair: scores.filter(s => s >= 40 && s < 60).length,
      poor: scores.filter(s => s < 40).length,
    },
  }
}

export async function getTestAnalytics(testId?: string, classId?: string) {
  const analytics: TestAnalytics = {
    testId: testId || 'test-1',
    classId: classId || 'class-1',
    averageScore: 68.5,
    highestScore: 98,
    lowestScore: 22,
    passRate: 78,
    scoreDistribution: [
      { range: '0-39', count: 5 },
      { range: '40-59', count: 8 },
      { range: '60-79', count: 12 },
      { range: '80-100', count: 7 },
    ],
    commonMistakes: [
      { topic: 'Algebraic expressions', errorRate: 0.65 },
      { topic: 'Fractions', errorRate: 0.45 },
      { topic: 'Word problems', errorRate: 0.55 },
    ],
  }
  return analytics
}
