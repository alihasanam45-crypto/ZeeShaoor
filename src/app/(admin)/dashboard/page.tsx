import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/options'
import type { AdminTokenPayload } from '@/types/auth'

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/6">
      <div className={`absolute inset-x-0 top-0 h-px ${accent}`} />
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{hint}</p>
    </div>
  )
}

function GodBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-widest text-amber-400 uppercase">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
      </span>
      God Mode · superAccess
    </span>
  )
}

function ActionCard({ href, title, description, icon, badge }: {
  href: string; title: string; description: string; icon: React.ReactNode; badge?: string
}) {
  return (
    <a href={href} className="group relative flex items-start gap-4 rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/6 hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-slate-400 transition-colors group-hover:border-cyan-500/30 group-hover:text-cyan-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 transition-colors group-hover:text-white">{title}</p>
        <p className="mt-0.5 text-xs text-slate-600">{description}</p>
      </div>
      {badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 flex-shrink-0 self-start mt-0.5">{badge}</span>
      )}
      <svg className="h-4 w-4 shrink-0 text-slate-700 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-500 self-start mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
      </svg>
    </a>
  )
}

const Icons = {
  // ------ Originals ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  dataBank:       (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/></svg>),
  upload:         (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>),
  users:          (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>),
  founder:        (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1l2.39 4.843 5.341.777-3.865 3.766.912 5.314L10 13.347l-4.778 2.513.912-5.314L2.269 6.62l5.341-.777L10 1z" clipRule="evenodd"/></svg>),

  // ------ C1 Wellbeing ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  wellbeing:      (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>),

  // ------ C2 Live Pulse ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  livePulse:      (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>),

  // ------ C3 Predictions ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  predictions:    (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>),

  // ------ C4 School DNA ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  schoolDna:      (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>),

  // ------ C5 Connectivity ------------------------------------------------------------------------------------------------------------------------------------------------------------------
  connectivity:   (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>),

  // ------ C6 Fees ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  fees:           (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>),

  // ------ C7 Books ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  books:          (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>),

  // ------ C8 Past Papers ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  pastPapers:     (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>),

  // ------ C9 AI Control ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  aiControl:      (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>),

  // ------ C10 Auto Delete ------------------------------------------------------------------------------------------------------------------------------------------------------------------
  autoDelete:     (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>),

  // ------ C11 Broadcast ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  broadcast:      (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>),

  // ------ C12 Complaints ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  complaints:     (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>),

  // ------ C13 Board Readiness ------------------------------------------------------------------------------------------------------------------------------------------------------
  boardReadiness: (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>),

  // ------ C14 Awards ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  awards:         (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>),

  // ------ C15 Timetable ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  timetable:      (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>),

  // ------ C16 Exports ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  exports:        (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>),

  // ------ C17 Health ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  health:         (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>),

  // ------ C18 Calendar ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  calendar:       (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>),

  // ------ C19 Archive ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  archive:        (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>),
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'admin') {
    const portals = { teacher: '/teacher/dashboard', student: '/student/dashboard' } as const
    redirect(portals[session.user.role as 'teacher' | 'student'] ?? '/login')
  }
  const user = session.user as AdminTokenPayload
  const hour = new Date().getUTCHours() + 5
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817]">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Top bar */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{greeting},</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white">{(user as any).name ?? user.email}</h1>
          </div>
          <GodBadge />
        </div>

        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Stat cards */}
        <section aria-label="Overview stats">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">Platform Overview</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Access Level" value="Super"    hint="All portals unlocked"    accent="bg-gradient-to-r from-amber-500 to-orange-500" />
            <StatCard label="Role"         value="Admin"    hint="System administrator"    accent="bg-gradient-to-r from-cyan-500 to-blue-500" />
            <StatCard label="Portal"       value="God Mode" hint="superAccess: true"       accent="bg-gradient-to-r from-violet-500 to-purple-500" />
            <StatCard label="Status"       value="Active"   hint="Session authenticated"   accent="bg-gradient-to-r from-emerald-500 to-teal-500" />
          </div>
        </section>

        {/* Quick Actions — C1 to C19 */}
        <section aria-label="Quick actions" className="mt-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">
            Admin Control Center — C1 to C19
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* ------ Originals ------ */}
            <ActionCard href="/admin/dashboard/data-bank" title="Data Bank"          description="Manage questions, papers, and learning resources" icon={Icons.dataBank} />
            <ActionCard href="/admin/dashboard/upload"    title="Upload Content"      description="Add new papers, videos, or documents"            icon={Icons.upload} />
            <ActionCard href="/admin/dashboard/users"     title="User Management"     description="View, edit, and control all platform users"      icon={Icons.users} />
            <ActionCard href="/admin/dashboard/founder"   title="Founder Panel"       description="Platform analytics, revenue, and system health"  icon={Icons.founder} />

            {/* ------ C1–C8 ------ */}
            <ActionCard href="/admin/wellbeing"      title="Student Wellbeing Monitor"  description="AI-powered mental health & crisis detection"        icon={Icons.wellbeing}      badge="C1" />
            <ActionCard href="/admin/live-pulse"     title="Live School Pulse"           description="Real-time school activity monitoring"               icon={Icons.livePulse}      badge="C2" />
            <ActionCard href="/admin/predictions"    title="Predictive AI"               description="Forecast dropout risk & academic trajectories"      icon={Icons.predictions}    badge="C3" />
            <ActionCard href="/admin/school-dna"     title="School DNA Analytics"        description="Deep school performance & identity analytics"        icon={Icons.schoolDna}      badge="C4" />
            <ActionCard href="/admin/connectivity"   title="Teacher-Student Map"         description="Connectivity & engagement visualization"             icon={Icons.connectivity}   badge="C5" />
            <ActionCard href="/admin/fees"           title="Fee Automation Engine"       description="Smart fee reminders, waivers & tracking"            icon={Icons.fees}           badge="C6" />
            <ActionCard href="/admin/books"          title="CSV Book Manager"            description="Manage books via CSV upload & editing"              icon={Icons.books}          badge="C7" />
            <ActionCard href="/admin/past-papers"    title="Past Paper Vault"            description="Manage and organize past exam papers"               icon={Icons.pastPapers}     badge="C8" />

            {/* ------ C9–C16 ------ */}
            <ActionCard href="/admin/ai-control"     title="AI Usage Controller"         description="Monitor, throttle & govern every AI module"         icon={Icons.aiControl}      badge="C9" />
            <ActionCard href="/admin/auto-delete"    title="Auto-Delete Orchestrator"    description="Schedule & govern data retention"                   icon={Icons.autoDelete}     badge="C10" />
            <ActionCard href="/admin/broadcast"      title="Emergency Broadcast"         description="Send instant alerts to students, parents & staff"   icon={Icons.broadcast}      badge="C11" />
            <ActionCard href="/admin/complaints"     title="Anonymous Complaint Box"     description="Review, respond & resolve complaints"               icon={Icons.complaints}     badge="C12" />
            <ActionCard href="/admin/board-readiness" title="Board Readiness AI Score"  description="AI-powered exam readiness for every student"        icon={Icons.boardReadiness} badge="C13" />
            <ActionCard href="/admin/awards"         title="Scholarship & Award Engine"  description="AI-powered student award matching"                  icon={Icons.awards}         badge="C14" />
            <ActionCard href="/admin/timetable"      title="Staff Timetable AI"          description="AI-powered schedule optimizer & conflict resolver"  icon={Icons.timetable}      badge="C15" />
            <ActionCard href="/admin/exports"        title="Data Export Center"          description="Export any data as CSV, Excel, PDF or JSON"         icon={Icons.exports}        badge="C16" />

            {/* ------ C17–C19 ------ */}
            <ActionCard href="/admin/health"         title="Portal Health Monitor"       description="Real-time system status & incident tracking"        icon={Icons.health}         badge="C17" />
            <ActionCard href="/admin/calendar"       title="Academic Calendar Manager"   description="Manage exams, holidays & events"                    icon={Icons.calendar}       badge="C18" />
            <ActionCard href="/admin/archive"        title="Legacy Data Archiver"        description="Archive old data & restore when needed"             icon={Icons.archive}        badge="C19" />

          </div>
        </section>

        {/* Session strip */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-600">Signed in as <span className="font-medium text-slate-400">{user.email}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-600">JWT · RBAC enforced · 256-bit encrypted</span>
          </div>
          <div className="ml-auto">
            <a href="/api/auth/signout" className="text-xs text-slate-700 transition-colors hover:text-red-400">Sign out</a>
          </div>
        </div>

      </main>
    </div>
  )
}
