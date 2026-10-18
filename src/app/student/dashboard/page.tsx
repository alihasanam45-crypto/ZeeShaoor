import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { ROUTE_CONFIG } from '@/config/routes'
import { getStudentDashboardMetrics } from '@/actions/student-dashboard-actions'
import BrainMeter from '@/components/student/BrainMeter'
import StreakCounter from '@/components/student/StreakCounter'
import WeakTopicRadar from '@/components/student/WeakTopicRadar'
import MotivationBanner from '@/components/student/MotivationBanner'
import StudentGreeting from '@/components/student/StudentGreeting'
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  StatCard,
} from '@/components/ui'
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CalendarDays,
  FileCheck2,
  Flame,
  Gauge,
  Target,
  Trophy,
} from 'lucide-react'

// Fallback quick-access list for profiles with no enrolledSubjects recorded yet
const CLASS_SUBJECTS = [
  'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer',
  'English', 'Urdu', 'Islamiyat', 'Pak Studies',
]

// Widgets that are not part of an active study session dim out in Focus Mode.
// The `/shell` group is published by StudentShell on the app shell root.
const FOCUS_DIM =
  'transition-opacity duration-500 group-data-[focus=on]/shell:pointer-events-none group-data-[focus=on]/shell:opacity-25'

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-')

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  // Defense-in-depth behind the proxy: send a wrong-role visitor to their own
  // dashboard, never to '/' (which would bounce back through the root redirect).
  if (session.user.role !== 'student') redirect(ROUTE_CONFIG.redirectAfterLogin[session.user.role])

  const data = await getStudentDashboardMetrics()
  const { metrics } = data
  const subjects = data.subjects.length > 0 ? data.subjects : CLASS_SUBJECTS

  return (
    <PageContainer width="wide">
      <StudentGreeting
        name={data.student.name}
        classLabel={data.student.classLabel}
        weeklyGrowth={data.weeklyGrowth}
      />

      {/* Headline metrics */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ${FOCUS_DIM}`}>
        <StatCard
          label="Overall Score"
          value={`${metrics.overallScore}%`}
          icon={<Gauge className="h-5 w-5" />}
        />
        <StatCard
          label="Day Streak"
          value={`${metrics.dayStreak}`}
          hint={metrics.dayStreak === 1 ? 'day' : 'days'}
          icon={<Flame className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label="Class Rank"
          value={metrics.rank ? `#${metrics.rank}` : '—'}
          hint={metrics.rank ? `of ${metrics.classSize}` : undefined}
          icon={<Trophy className="h-5 w-5" />}
          tone="success"
        />
        <StatCard
          label="Papers Done"
          value={`${metrics.papersDone}`}
          icon={<FileCheck2 className="h-5 w-5" />}
          tone="info"
        />
      </div>

      <div className={FOCUS_DIM}>
        <MotivationBanner />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <CardHeader
              icon={<Brain className="h-5 w-5" />}
              title="Neural Brain Meter"
              description="Live mastery across your subjects"
            />
            <div className="mt-5">
              {data.brainScores.length > 0 ? (
                <BrainMeter scores={data.brainScores} />
              ) : (
                <EmptyState
                  size="sm"
                  icon={<Brain className="h-5 w-5" />}
                  title="No mastery data yet"
                  description="Attempt quizzes and tests to power up your Brain Meter."
                />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={<Target className="h-5 w-5" />}
              title="Weak Topic Radar"
              description="AI-detected gaps to close first"
            />
            <div className="mt-5">
              <WeakTopicRadar />
            </div>
          </Card>

          <Card className={FOCUS_DIM}>
            <CardHeader
              icon={<BookOpen className="h-5 w-5" />}
              title="Quick Subject Access"
              description="Jump into any subject workspace"
            />
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Link
                  key={subject}
                  href={`/student/subject/${toSlug(subject)}`}
                  className="group flex items-center gap-2.5 rounded-xl bg-surface-inset px-3.5 py-3 text-[13.5px] font-medium text-fg-muted ring-1 ring-inset ring-line transition-colors hover:bg-accent-soft hover:text-accent-text hover:ring-accent-soft"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span className="flex-1 truncate">{subject}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-fg-faint transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className={FOCUS_DIM}>
            <CardHeader icon={<Flame className="h-5 w-5" />} title="Streak Tracker" />
            <div className="mt-5">
              <StreakCounter />
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Award className="h-5 w-5" />} title="Upcoming Exams" />
            <div className="mt-5">
              {data.upcomingExams.length > 0 ? (
                <ul className="space-y-2">
                  {data.upcomingExams.map((exam) => (
                    <li
                      key={`${exam.subject}-${exam.date}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface-inset p-3.5 ring-1 ring-inset ring-line"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold text-fg">
                          {exam.subject}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-fg-subtle">{exam.type}</p>
                      </div>
                      <Badge tone="accent">{exam.date}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  size="sm"
                  icon={<Award className="h-5 w-5" />}
                  title="No exams scheduled"
                  description="Upcoming exams for your class will appear here."
                />
              )}
            </div>
          </Card>

          {/* Countdown — the one deliberately saturated surface on the page, so
              it reads as the single most urgent thing. */}
          <section
            className={`relative overflow-hidden rounded-xl p-6 shadow-accent ${FOCUS_DIM}`}
            style={{ background: 'var(--accent-grad)' }}
          >
            <div className="mb-2.5 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-white/80" aria-hidden />
              <h2 className="text-[13px] font-semibold text-white/90">
                {data.boardCountdown ? 'Board Exam Countdown' : 'Exam Countdown'}
              </h2>
            </div>

            <p className="text-4xl font-bold tracking-tight text-white" data-numeric>
              {data.boardCountdown ? `${data.boardCountdown.days} days` : '—'}
            </p>
            <p className="mt-1.5 text-xs text-white/75">
              {data.boardCountdown ? data.boardCountdown.label : 'No exams scheduled yet'}
            </p>

            <Link
              href="/student/exams"
              className="mt-5 block w-full rounded-lg bg-white/15 py-2.5 text-center text-[13px] font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/25"
            >
              View Full Schedule
            </Link>
          </section>
        </div>
      </div>
    </PageContainer>
  )
}
