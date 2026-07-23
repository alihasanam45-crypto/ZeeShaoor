'use server'

import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Student from '@/models/Student'
import HomeworkTaskModel from '@/models/HomeworkTask'
import MeetingModel from '@/models/Meeting'
import InterventionModel from '@/models/Intervention'
import { requireSessionRole } from '@/lib/auth/guard'

export interface TeacherClassSummary {
  classId: string
  subjects: string[]
  studentCount: number
}

export interface TeacherOverviewData {
  teacherName: string
  classes: TeacherClassSummary[]
  totals: {
    assignedClasses: number
    totalStudents: number
    subjectsTaught: number
  }
  homeworkTasks: number
  upcomingMeetings: number
  openInterventions: number
}

function titleCase(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function parseAssignments(permissions: string[]): Map<string, string[]> {
  const byClass = new Map<string, Set<string>>()
  for (const perm of permissions) {
    const parts = perm.split(':')
    if (parts.length !== 3 || parts[0] !== 'teacher') continue
    const [, subject, classId] = parts
    if (!subject || !classId) continue
    const set = byClass.get(classId) ?? new Set<string>()
    set.add(titleCase(subject))
    byClass.set(classId, set)
  }
  return new Map([...byClass.entries()].map(([classId, subjects]) => [classId, [...subjects].sort()]))
}

function fallbackData(name: string): TeacherOverviewData {
  return {
    teacherName: name,
    classes: [],
    totals: { assignedClasses: 0, totalStudents: 0, subjectsTaught: 0 },
    homeworkTasks: 0,
    upcomingMeetings: 0,
    openInterventions: 0,
  }
}

export async function getTeacherOverviewMetrics(): Promise<TeacherOverviewData> {
  await connectDB()

  const user = await requireSessionRole('teacher')

  try {
    const profile = await User.findById(user.id).select('name permissions').lean()
    const assignments = parseAssignments(profile?.permissions ?? [])
    const classIds = [...assignments.keys()]

    const [studentCounts, homeworkTasks, upcomingMeetings, openInterventions] = await Promise.all([
      Promise.all(
        classIds.map((classId) => Student.countDocuments({ class: classId, status: 'active' })),
      ),
      HomeworkTaskModel.countDocuments({ teacherId: user.id }),
      MeetingModel.countDocuments({
        teacherId: user.id,
        status: 'Scheduled',
        scheduledDate: { $gte: new Date() },
      }),
      classIds.length > 0
        ? InterventionModel.countDocuments({
            classId: { $in: classIds },
            status: { $ne: 'Resolved' },
          })
        : Promise.resolve(0),
    ])

    const classes: TeacherClassSummary[] = classIds
      .map((classId, i) => ({
        classId,
        subjects: assignments.get(classId) ?? [],
        studentCount: studentCounts[i],
      }))
      .sort((a, b) => a.classId.localeCompare(b.classId))

    const subjectsTaught = new Set<string>()
    for (const subjects of assignments.values()) {
      for (const s of subjects) subjectsTaught.add(s)
    }

    return {
      teacherName: profile?.name ?? user.email.split('@')[0],
      classes,
      totals: {
        assignedClasses: classIds.length,
        totalStudents: studentCounts.reduce((sum, n) => sum + n, 0),
        subjectsTaught: subjectsTaught.size,
      },
      homeworkTasks,
      upcomingMeetings,
      openInterventions,
    }
  } catch (err) {
    console.error('[teacher-dashboard] DB query failed:', (err as Error).message ?? err)
    return fallbackData(user.email.split('@')[0])
  }
}
