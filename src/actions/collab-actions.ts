'use server'

export interface CollabSession {
  id: string
  title: string
  teacherId: string
  participants: string[]
  startTime: string
  endTime: string
  status: 'scheduled' | 'active' | 'completed'
}

export interface Plan {
  id: string
  title: string
  subjectId: string
  content: string
  changesMade: number
  rating: number
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface PlanVersion {
  id: string
  planId: string
  content: string
  changesMade: number
  createdAt: string
}

export async function getCollabSessions() {
  return [] as CollabSession[]
}

export async function getCollabSessionById(id: string) {
  return null as CollabSession | null
}

export async function createCollabSession(data: Omit<CollabSession, 'id'>) {
  return { id: crypto.randomUUID(), ...data } as CollabSession
}

export async function joinCollabSession(sessionId: string, userId: string) {
  return { success: true }
}

export async function createPlan(data: { title: string; subjectId: string; content: string }) {
  const plan: Plan = {
    id: crypto.randomUUID(),
    title: data.title,
    subjectId: data.subjectId,
    content: data.content || '',
    changesMade: 0,
    rating: 0,
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return plan
}

export async function getPlans(subjectId?: string) {
  const plans: Plan[] = [
    {
      id: '1',
      title: 'Algebra Fundamentals',
      subjectId: subjectId || 'math',
      content: '# Algebra\n\nIntroduction to variables and expressions.',
      changesMade: 3,
      rating: 4.5,
      pinned: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Quadratic Equations',
      subjectId: subjectId || 'math',
      content: '# Quadratic Equations\n\nSolving ax² + bx + c = 0.',
      changesMade: 5,
      rating: 4.0,
      pinned: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  return plans
}

export async function updatePlanContent(id: string, newContent: string, changesMade: number) {
  const plan: Plan = {
    id,
    title: 'Algebra Fundamentals',
    subjectId: 'math',
    content: newContent,
    changesMade,
    rating: 4.5,
    pinned: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return plan
}

export async function ratePlan(id: string, score: number) {
  const plan: Plan = {
    id,
    title: 'Algebra Fundamentals',
    subjectId: 'math',
    content: '# Algebra\n\nContent here.',
    changesMade: 3,
    rating: score,
    pinned: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return plan
}

export async function deletePlan(id: string) {
  return { success: true }
}

export async function togglePinPlan(id: string) {
  const plan: Plan = {
    id,
    title: 'Algebra Fundamentals',
    subjectId: 'math',
    content: '# Algebra\n\nContent here.',
    changesMade: 3,
    rating: 4.5,
    pinned: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return plan
}

export async function getPlanVersions(id: string) {
  const versions: PlanVersion[] = [
    {
      id: 'v1',
      planId: id,
      content: 'Initial draft of the plan.',
      changesMade: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'v2',
      planId: id,
      content: 'Updated with more examples.',
      changesMade: 2,
      createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
  ]
  return versions
}
