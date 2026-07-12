import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { ROUTE_CONFIG } from '@/config/routes'
import { getTeacherOverviewMetrics } from '@/actions/teacher-dashboard-actions'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  LifeBuoy,
  Users,
} from 'lucide-react'

const CARD = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'

function StatTile({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: number
  href: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-indigo-200 hover:shadow-[0_8px_30px_rgb(99,102,241,0.10)]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-black leading-tight text-slate-800">{value}</p>
        <p className="text-xs font-medium text-slate-400">{label}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-400" />
    </Link>
  )
}

export default async function TeacherOverviewPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  // Defense-in-depth behind the proxy: send a wrong-role visitor to their own
  // dashboard, never to '/' (which would bounce back through the root redirect).
  if (session.user.role !== 'teacher') redirect(ROUTE_CONFIG.redirectAfterLogin[session.user.role])

  const data = await getTeacherOverviewMetrics()

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-8 lg:p-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {data.teacherName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your teaching overview across {data.totals.assignedClasses}{' '}
            {data.totals.assignedClasses === 1 ? 'class' : 'classes'} and{' '}
            {data.totals.subjectsTaught}{' '}
            {data.totals.subjectsTaught === 1 ? 'subject' : 'subjects'}
          </p>
        </div>
        <Link
          href="/teacher/generator"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(99,102,241,0.20)] transition-all hover:opacity-90"
        >
          <BookOpen className="h-4 w-4" />
          Open Paper Generator
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={<LayoutGrid className="h-5 w-5" />}
          label="Assigned Classes"
          value={data.totals.assignedClasses}
          href="/teacher/learning-paths"
        />
        <StatTile
          icon={<Users className="h-5 w-5" />}
          label="Total Students"
          value={data.totals.totalStudents}
          href="/teacher/at-risk"
        />
        <StatTile
          icon={<ClipboardList className="h-5 w-5" />}
          label="Homework Tasks"
          value={data.homeworkTasks}
          href="/teacher/homework"
        />
        <StatTile
          icon={<CalendarClock className="h-5 w-5" />}
          label="Upcoming Meetings"
          value={data.upcomingMeetings}
          href="/teacher/meetings"
        />
      </div>

      {/* Open interventions banner */}
      {data.openInterventions > 0 && (
        <Link
          href="/teacher/at-risk"
          className="flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5 transition-colors hover:bg-amber-100/70"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {data.openInterventions} open{' '}
              {data.openInterventions === 1 ? 'intervention' : 'interventions'} in your classes
            </p>
            <p className="text-xs text-amber-600">Review at-risk students and resolve their action plans</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-amber-500" />
        </Link>
      )}

      {/* Class breakdown */}
      <section className={CARD}>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">My Classes</h2>
            <p className="text-xs text-slate-400">Assigned classes with live active-student counts</p>
          </div>
        </div>

        {data.classes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.classes.map((cls) => (
              <div
                key={cls.classId}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">Class {cls.classId}</p>
                    <p className="mt-1 flex flex-wrap gap-1.5">
                      {cls.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
                        >
                          {subject}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-black text-slate-800">{cls.studentCount}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      students
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-slate-500">No classes assigned yet</p>
            <p className="mt-1 text-xs text-slate-400">
              An administrator assigns your subjects and classes — they&apos;ll appear here once set.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
