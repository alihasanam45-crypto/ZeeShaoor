'use server'

export interface Feedback {
  id: string
  studentId: string
  teacherId: string
  subject: string
  content: string
  rating: number
  createdAt: string
}

export interface ConfidentialMessage {
  id: string
  studentId: string
  messageText: string
  createdAt: string
  read: boolean
}

export interface PrincipalAlert {
  id: string
  type: string
  message: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'resolved'
  createdAt: string
}

export interface SurveyResult {
  id: string
  surveyId: string
  question: string
  averageRating: number
  responseCount: number
}

export async function getFeedbacks() {
  return [] as Feedback[]
}

export async function getFeedbackById(id: string) {
  return null as Feedback | null
}

export async function submitFeedback(data: Omit<Feedback, 'id'>) {
  return { id: crypto.randomUUID(), ...data } as Feedback
}

export async function getFeedbackAnalytics(teacherId: string) {
  return { total: 0, averageRating: 0, distribution: {} }
}

export async function getConfidentialMessages() {
  const messages: ConfidentialMessage[] = [
    {
      id: 'cm1',
      studentId: 'student-1',
      messageText: 'I am struggling with the new topic.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'cm2',
      studentId: 'student-2',
      messageText: 'I feel anxious about the upcoming test.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    },
  ]
  return messages
}

export async function getPrincipalAlerts() {
  const alerts: PrincipalAlert[] = [
    {
      id: 'alert-1',
      type: 'teacher_feedback',
      message: 'Multiple students reported low satisfaction in Grade 10 Math',
      severity: 'high',
      status: 'open',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'alert-2',
      type: 'attendance',
      message: 'Attendance drop detected in Grade 8 Science',
      severity: 'medium',
      status: 'open',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'alert-3',
      type: 'wellbeing',
      message: 'Wellbeing check completed - 3 teachers flagged',
      severity: 'low',
      status: 'resolved',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ]
  return alerts
}

export async function updateAlertStatus(alertId: string, status: string) {
  return { success: true }
}

export async function getSurveyResults(surveyId: string) {
  const results: SurveyResult[] = [
    {
      id: 'sr1',
      surveyId,
      question: 'Did you understand today\'s lesson?',
      averageRating: 4.2,
      responseCount: 25,
    },
    {
      id: 'sr2',
      surveyId,
      question: 'Was the pace appropriate?',
      averageRating: 3.8,
      responseCount: 25,
    },
  ]
  return { surveyId, results, totalResponses: 25 }
}

export async function sendConfidentialMessage(messageText: string) {
  return {
    id: crypto.randomUUID(),
    messageText,
    createdAt: new Date().toISOString(),
    read: false,
  }
}

export async function submitSurveyResponse(
  surveyId: string,
  userId: string,
  understood: boolean,
  difficultyRating: number,
) {
  return {
    id: crypto.randomUUID(),
    surveyId,
    userId,
    understood,
    difficultyRating,
    submittedAt: new Date().toISOString(),
  }
}
