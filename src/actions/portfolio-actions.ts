'use server'

// Student Portfolio Builder (feature B10) data layer.
// Mock in-memory implementation — swap the internals for MongoDB models
// (Student, QuizResult, Certificate, PortfolioAnnotation) without touching
// the exported signatures when real data integration lands.

export interface StudentSearchResult {
  _id: string
  name: string
  classId: string
  rollNo: string
  avgScore: number
}

export interface PortfolioSubject {
  name: string
  score: number
}

export interface PortfolioStudentInfo {
  name: string
  classId: string
  subjects: PortfolioSubject[]
  averageScore: number
  attendance: number
}

export interface PortfolioQuizScore {
  chapter: string
  subject: string
  score: number
  date: string
}

export interface PortfolioCertificate {
  title: string
  description?: string
  type: string
  issuedAt: string
}

export interface PortfolioAnnotation {
  _id: string
  annotationText: string
  date: string
}

export interface PortfolioData {
  studentInfo: PortfolioStudentInfo | null
  topQuizScores: PortfolioQuizScore[]
  certificates: PortfolioCertificate[]
  annotations: PortfolioAnnotation[]
}

type StudentRecord = StudentSearchResult & {
  attendance: number
  subjects: PortfolioSubject[]
  topQuizScores: PortfolioQuizScore[]
  certificates: PortfolioCertificate[]
}

const STUDENTS: StudentRecord[] = [
  {
    _id: 'stu-001', name: 'Ali Hassan', classId: '10A', rollNo: '10A-04', avgScore: 78, attendance: 94,
    subjects: [
      { name: 'Physics', score: 82 }, { name: 'Chemistry', score: 74 }, { name: 'Mathematics', score: 88 },
      { name: 'English', score: 69 }, { name: 'Urdu', score: 77 },
    ],
    topQuizScores: [
      { chapter: 'Trigonometry', subject: 'Mathematics', score: 96, date: '2026-06-28' },
      { chapter: 'Motion & Force', subject: 'Physics', score: 91, date: '2026-06-14' },
      { chapter: 'Chemical Bonds', subject: 'Chemistry', score: 87, date: '2026-05-30' },
    ],
    certificates: [
      { title: 'Gold — Trigonometry', description: 'Scored 96% on chapter test', type: 'gold', issuedAt: '2026-06-29' },
      { title: 'Focus Beast', description: '5 focus sessions in one week', type: 'badge', issuedAt: '2026-06-20' },
    ],
  },
  {
    _id: 'stu-002', name: 'Sara Ahmed', classId: '10A', rollNo: '10A-11', avgScore: 91, attendance: 98,
    subjects: [
      { name: 'Physics', score: 93 }, { name: 'Chemistry', score: 89 }, { name: 'Mathematics', score: 95 },
      { name: 'English', score: 90 }, { name: 'Urdu', score: 88 },
    ],
    topQuizScores: [
      { chapter: 'Electrostatics', subject: 'Physics', score: 98, date: '2026-07-02' },
      { chapter: 'Quadratic Equations', subject: 'Mathematics', score: 97, date: '2026-06-21' },
      { chapter: 'Organic Chemistry', subject: 'Chemistry', score: 94, date: '2026-06-07' },
    ],
    certificates: [
      { title: 'Gold — Electrostatics', description: 'Scored 98% on chapter test', type: 'gold', issuedAt: '2026-07-03' },
      { title: 'Topic Expert — Mathematics', description: 'Expert Notes suggested to classmates', type: 'expert', issuedAt: '2026-06-22' },
      { title: 'Silver — Organic Chemistry', type: 'silver', issuedAt: '2026-06-08' },
    ],
  },
  {
    _id: 'stu-003', name: 'Kamran Iqbal', classId: '9B', rollNo: '9B-07', avgScore: 54, attendance: 81,
    subjects: [
      { name: 'Physics', score: 48 }, { name: 'Chemistry', score: 52 }, { name: 'Mathematics', score: 45 },
      { name: 'English', score: 63 }, { name: 'Urdu', score: 62 },
    ],
    topQuizScores: [
      { chapter: 'Kinematics', subject: 'Physics', score: 71, date: '2026-06-18' },
      { chapter: 'Sets & Functions', subject: 'Mathematics', score: 66, date: '2026-05-25' },
    ],
    certificates: [
      { title: 'Bronze — Kinematics', description: 'Scored 71% on chapter test', type: 'bronze', issuedAt: '2026-06-19' },
    ],
  },
  {
    _id: 'stu-004', name: 'Fatima Noor', classId: '9B', rollNo: '9B-02', avgScore: 85, attendance: 96,
    subjects: [
      { name: 'Physics', score: 84 }, { name: 'Chemistry', score: 88 }, { name: 'Mathematics', score: 81 },
      { name: 'English', score: 87 }, { name: 'Urdu', score: 85 },
    ],
    topQuizScores: [
      { chapter: 'Periodic Table', subject: 'Chemistry', score: 95, date: '2026-06-25' },
      { chapter: 'Light & Optics', subject: 'Physics', score: 90, date: '2026-06-11' },
    ],
    certificates: [
      { title: 'Gold — Periodic Table', description: 'Scored 95% on chapter test', type: 'gold', issuedAt: '2026-06-26' },
      { title: 'Mini Teacher', description: 'Published an approved peer lesson', type: 'badge', issuedAt: '2026-06-15' },
    ],
  },
  {
    _id: 'stu-005', name: 'Usman Tariq', classId: '10A', rollNo: '10A-19', avgScore: 67, attendance: 89,
    subjects: [
      { name: 'Physics', score: 64 }, { name: 'Chemistry', score: 70 }, { name: 'Mathematics', score: 61 },
      { name: 'English', score: 72 }, { name: 'Urdu', score: 68 },
    ],
    topQuizScores: [
      { chapter: 'Thermodynamics', subject: 'Physics', score: 83, date: '2026-06-30' },
    ],
    certificates: [
      { title: 'Silver — Thermodynamics', description: 'Scored 83% on chapter test', type: 'silver', issuedAt: '2026-07-01' },
    ],
  },
]

// Annotations survive add/delete within a dev-server session.
const annotationStore = new Map<string, PortfolioAnnotation[]>([
  ['stu-002', [{
    _id: 'ann-seed-1',
    annotationText: 'Sara has shown remarkable growth this term — consistently in the top 3 of every quiz.',
    date: '2026-07-05',
  }]],
])

let annotationCounter = 1

const today = () => new Date().toISOString().slice(0, 10)

export async function searchStudents(q: string, classId?: string): Promise<StudentSearchResult[]> {
  const query = q.trim().toLowerCase()
  return STUDENTS.filter(
    (s) =>
      (!classId || s.classId === classId) &&
      (s.name.toLowerCase().includes(query) || s.rollNo.toLowerCase().includes(query)),
  ).map(({ _id, name, classId: cls, rollNo, avgScore }) => ({ _id, name, classId: cls, rollNo, avgScore }))
}

export async function compilePortfolio(studentId: string): Promise<PortfolioData> {
  const student = STUDENTS.find((s) => s._id === studentId)
  if (!student) {
    return { studentInfo: null, topQuizScores: [], certificates: [], annotations: [] }
  }
  return {
    studentInfo: {
      name: student.name,
      classId: student.classId,
      subjects: student.subjects,
      averageScore: student.avgScore,
      attendance: student.attendance,
    },
    topQuizScores: student.topQuizScores,
    certificates: student.certificates,
    annotations: annotationStore.get(studentId) ?? [],
  }
}

export async function getAnnotations(studentId: string): Promise<PortfolioAnnotation[]> {
  return annotationStore.get(studentId) ?? []
}

export async function addAnnotation(studentId: string, annotationText: string): Promise<PortfolioAnnotation> {
  const annotation: PortfolioAnnotation = {
    _id: `ann-${Date.now()}-${annotationCounter++}`,
    annotationText: annotationText.trim(),
    date: today(),
  }
  annotationStore.set(studentId, [annotation, ...(annotationStore.get(studentId) ?? [])])
  return annotation
}

export async function deleteAnnotation(annotationId: string): Promise<{ success: boolean }> {
  for (const [studentId, list] of annotationStore) {
    if (list.some((a) => a._id === annotationId)) {
      annotationStore.set(studentId, list.filter((a) => a._id !== annotationId))
      return { success: true }
    }
  }
  return { success: false }
}
