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

// The one glassmorphism spec every widget sits in
const GLASS_CARD =
  'rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300 lg:p-10 dark:border-slate-700 dark:bg-slate-900'

// Widgets that are not part of an active study session dim out in Focus Mode
const FOCUS_DIM =
  'transition-opacity duration-500 group-data-[focus=on]/shell:pointer-events-none group-data-[focus=on]/shell:opacity-25'

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-')

function CardHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xl font-black leading-tight text-slate-800 dark:text-slate-100">
          {value}
          {sub && <span className="ml-1 text-xs font-semibold text-slate-400 dark:text-slate-500">{sub}</span>}
        </p>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function EmptyHint({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
    </div>
  )
}

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
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8 lg:p-12">
      <StudentGreeting
        name={data.student.name}
        classLabel={data.student.classLabel}
        weeklyGrowth={data.weeklyGrowth}
      />

      <section className={`rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300 lg:p-8 dark:border-slate-700 dark:bg-slate-900 ${FOCUS_DIM}`}>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <StatTile
            icon={<Gauge className="h-5 w-5" />}
            label="Overall Score"
            value={`${metrics.overallScore}%`}
          />
          <StatTile
            icon={<Flame className="h-5 w-5" />}
            label="Day Streak"
            value={`${metrics.dayStreak}`}
            sub={metrics.dayStreak === 1 ? 'day' : 'days'}
          />
          <StatTile
            icon={<Trophy className="h-5 w-5" />}
            label="Class Rank"
            value={metrics.rank ? `#${metrics.rank}` : '—'}
            sub={metrics.rank ? `of ${metrics.classSize}` : undefined}
          />
          <StatTile
            icon={<FileCheck2 className="h-5 w-5" />}
            label="Papers Done"
            value={`${metrics.papersDone}`}
          />
        </div>
      </section>

      <div className={FOCUS_DIM}>
        <MotivationBanner />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <section className={GLASS_CARD}>
            <CardHeader
              icon={<Brain className="h-5 w-5" />}
              title="Neural Brain Meter"
              subtitle="Live mastery across your subjects"
            />
            {data.brainScores.length > 0 ? (
              <BrainMeter scores={data.brainScores} />
            ) : (
              <EmptyHint
                title="No mastery data yet"
                hint="Attempt quizzes and tests to power up your Brain Meter"
              />
            )}
          </section>

          <section className={GLASS_CARD}>
            <CardHeader
              icon={<Target className="h-5 w-5" />}
              title="Weak Topic Radar"
              subtitle="AI-detected gaps to close first"
            />
            <WeakTopicRadar />
          </section>

          <section className={`${GLASS_CARD} ${FOCUS_DIM}`}>
            <CardHeader icon={<BookOpen className="h-5 w-5" />} title="Quick Subject Access" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {subjects.map(subject => (
                <Link
                  key={subject}
                  href={`/student/subject/${toSlug(subject)}`}
                  className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950 dark:hover:text-indigo-400"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                  <span className="flex-1 truncate">{subject}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-400" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className={`${GLASS_CARD} ${FOCUS_DIM}`}>
            <CardHeader icon={<Flame className="h-5 w-5" />} title="Streak Tracker" />
            <StreakCounter />
          </section>

          <section className={GLASS_CARD}>
            <CardHeader icon={<Award className="h-5 w-5" />} title="Upcoming Exams" />
            {data.upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingExams.map(exam => (
                  <div
                    key={`${exam.subject}-${exam.date}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{exam.subject}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{exam.type}</p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      {exam.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyHint
                title="No exams scheduled"
                hint="Upcoming exams for your class will appear here"
              />
            )}
          </section>

          <section
            className={`relative overflow-hidden rounded-[2.5rem] border border-indigo-400/20 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-8 shadow-[0_8px_30px_rgb(99,102,241,0.15)] ${FOCUS_DIM}`}
          >
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-200" />
              <h2 className="text-sm font-semibold text-white/90">
                {data.boardCountdown ? 'Board Exam Countdown' : 'Exam Countdown'}
              </h2>
            </div>
            {data.boardCountdown ? (
              <>
                <p className="text-4xl font-bold tracking-tight text-white">
                  {data.boardCountdown.days} days
                </p>
                <p className="mt-1.5 text-xs text-indigo-200">{data.boardCountdown.label}</p>
              </>
            ) : (
              <>
                <p className="text-4xl font-bold tracking-tight text-white">—</p>
                <p className="mt-1.5 text-xs text-indigo-200">No exams scheduled yet</p>
              </>
            )}
            <Link
              href="/student/exams"
              className="mt-6 block w-full rounded-2xl border border-white/10 bg-white/15 py-3 text-center text-xs font-semibold text-white transition-all hover:bg-white/25"
            >
              View Full Schedule
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
