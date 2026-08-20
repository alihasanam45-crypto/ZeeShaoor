import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { ROUTE_CONFIG } from '@/config/routes'
import { getTeacherOverviewMetrics } from '@/actions/teacher-dashboard-actions'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  PageHeader,
  StatCard,
} from '@/components/ui'
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  ClipboardList,
  FileText,
  FileClock,
  GraduationCap,
  LayoutGrid,
  LifeBuoy,
  Users,
  WandSparkles,
} from 'lucide-react'

/* Quick actions surface the four things a teacher does most, so the dashboard
   is a launchpad rather than a read-only summary. */
const QUICK_ACTIONS = [
  { label: 'Generate a paper', href: '/teacher/generator', icon: WandSparkles },
  { label: 'Assign homework', href: '/teacher/homework', icon: ClipboardList },
  { label: 'Plan a lesson', href: '/teacher/lesson-planner', icon: GraduationCap },
  { label: 'Review grades', href: '/teacher/grade-distribution', icon: BarChart3 },
]

export default async function TeacherOverviewPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  // Defense-in-depth behind the proxy: send a wrong-role visitor to their own
  // dashboard, never to '/' (which would bounce back through the root redirect).
  if (session.user.role !== 'teacher') redirect(ROUTE_CONFIG.redirectAfterLogin[session.user.role])

  const data = await getTeacherOverviewMetrics()

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Teacher Portal"
        title={`Welcome back, ${data.teacherName}`}
        description={`Your teaching overview across ${data.totals.assignedClasses} ${
          data.totals.assignedClasses === 1 ? 'class' : 'classes'
        } and ${data.totals.subjectsTaught} ${
          data.totals.subjectsTaught === 1 ? 'subject' : 'subjects'
        }.`}
        actions={
          <Button href="/teacher/generator" leadingIcon={<WandSparkles className="h-4 w-4" />}>
            Open Paper Generator
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Papers Generated"
          value="Soon"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Draft Papers"
          value="Soon"
          icon={<FileClock className="h-5 w-5" />}
        />
        <StatCard
          label="Assigned Classes"
          value={data.totals.assignedClasses}
          icon={<LayoutGrid className="h-5 w-5" />}
          href="/teacher/learning-paths"
        />
        <StatCard
          label="Total Students"
          value={data.totals.totalStudents}
          icon={<Users className="h-5 w-5" />}
          tone="info"
          href="/teacher/at-risk"
        />
        <StatCard
          label="Homework Tasks"
          value={data.homeworkTasks}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="success"
          href="/teacher/homework"
        />
        <StatCard
          label="Upcoming Meetings"
          value={data.upcomingMeetings}
          icon={<CalendarClock className="h-5 w-5" />}
          tone="warning"
          href="/teacher/meetings"
        />
      </div>

      {/* Open interventions — only rendered when there is something to act on. */}
      {data.openInterventions > 0 && (
        <Card
          href="/teacher/at-risk"
          padding="sm"
          className="flex items-center gap-3.5 ring-1 ring-inset ring-warning-soft"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning-text"
            aria-hidden
          >
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg">
              {data.openInterventions} open{' '}
              {data.openInterventions === 1 ? 'intervention' : 'interventions'} in your classes
            </p>
            <p className="mt-0.5 text-[13px] text-fg-subtle">
              Review at-risk students and resolve their action plans
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-fg-faint" aria-hidden />
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Classes */}
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<GraduationCap className="h-5 w-5" />}
            title="My Classes"
            description="Assigned classes with live active-student counts"
          />

          <div className="mt-5">
            {data.classes.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.classes.map((cls) => (
                  <div
                    key={cls.classId}
                    className="rounded-xl bg-surface-inset p-4 ring-1 ring-inset ring-line"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-fg">Class {cls.classId}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {cls.subjects.map((subject) => (
                            <Badge key={subject} tone="accent" size="sm">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xl font-bold leading-none text-fg" data-numeric>
                          {cls.studentCount}
                        </p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-fg-faint">
                          students
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<GraduationCap className="h-6 w-6" />}
                title="No classes assigned yet"
                description="An administrator assigns your subjects and classes — they'll appear here once set."
              />
            )}
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader
            title="Quick actions"
            description="Jump straight into your most-used tools"
          />
          <ul className="mt-4 space-y-1.5">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text"
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">{label}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-fg-faint transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageContainer>
  )
}
