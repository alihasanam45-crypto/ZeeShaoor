'use server'

export interface Lesson {
  id: string
  title: string
  subject: string
  classId: string
  objectives: string[]
  content: string
  duration: number
  status: 'draft' | 'published' | 'completed'
}

export interface Resource {
  id: string
  title: string
  type: string
  url: string
  topicId: string
  rating: number
  saved: boolean
  createdAt: string
}

export async function getLessons() {
  return [] as Lesson[]
}

export async function getLessonById(id: string) {
  return null as Lesson | null
}

export async function createLesson(data: Omit<Lesson, 'id'>) {
  return { id: crypto.randomUUID(), ...data } as Lesson
}

export async function publishLesson(id: string) {
  return { success: true }
}

export async function generateLessonPlan(topicName: string, duration: number, studentLevel: string, language: string) {
  return {
    topicName,
    duration,
    studentLevel,
    language,
    objectives: [`Understand ${topicName}`, `Apply ${topicName} concepts`, `Evaluate ${topicName} problems`],
    activities: [
      { time: '0-10min', activity: 'Introduction and hook' },
      { time: '10-25min', activity: 'Direct instruction' },
      { time: '25-40min', activity: 'Guided practice' },
      { time: '40-50min', activity: 'Independent work' },
      { time: '50-60min', activity: 'Wrap-up and assessment' },
    ],
    materials: ['Whiteboard', 'Handouts', 'Digital resources'],
    assessment: 'Formative assessment through exit tickets',
    generatedAt: new Date().toISOString(),
  }
}

export async function saveLessonPlan(data: {
  title: string
  subject: string
  classId: string
  content: string
  duration: number
  objectives: string[]
}) {
  const plan: Lesson = {
    id: crypto.randomUUID(),
    title: data.title,
    subject: data.subject,
    classId: data.classId,
    objectives: data.objectives || [],
    content: data.content,
    duration: data.duration,
    status: 'draft',
  }
  return plan
}

export async function getSavedLessonPlans() {
  const plans: Lesson[] = [
    {
      id: '1',
      title: 'Introduction to Algebra',
      subject: 'Mathematics',
      classId: 'class-1',
      objectives: ['Understand variables', 'Solve simple equations'],
      content: '# Algebra\n\nContent here.',
      duration: 60,
      status: 'draft',
    },
    {
      id: '2',
      title: 'Photosynthesis',
      subject: 'Science',
      classId: 'class-2',
      objectives: ['Explain photosynthesis', 'Identify plant parts'],
      content: '# Photosynthesis\n\nContent here.',
      duration: 45,
      status: 'published',
    },
  ]
  return plans
}

export async function deleteLessonPlan(id: string) {
  return { success: true }
}

export async function getTopResources(topicId: string) {
  const resources: Resource[] = [
    {
      id: 'r1',
      title: 'Interactive Quiz',
      type: 'quiz',
      url: '/resources/quiz-1',
      topicId,
      rating: 4.5,
      saved: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'r2',
      title: 'Video Tutorial',
      type: 'video',
      url: '/resources/video-1',
      topicId,
      rating: 4.8,
      saved: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]
  return resources
}

export async function uploadResource(data: {
  title: string
  type: string
  url: string
  topicId: string
}) {
  const resource: Resource = {
    id: crypto.randomUUID(),
    title: data.title,
    type: data.type,
    url: data.url,
    topicId: data.topicId,
    rating: 0,
    saved: false,
    createdAt: new Date().toISOString(),
  }
  return resource
}

export async function rateResource(id: string, score: number) {
  const resource: Resource = {
    id,
    title: 'Interactive Quiz',
    type: 'quiz',
    url: '/resources/quiz-1',
    topicId: 'topic-1',
    rating: score,
    saved: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
  return resource
}

export async function toggleSaveResource(id: string) {
  return { saved: true, resourceId: id }
}
