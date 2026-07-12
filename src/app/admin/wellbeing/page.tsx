"use client"

import { useState, useEffect } from "react"

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
type RiskLevel = "critical" | "high" | "medium" | "low"
type ActionType = "message" | "alert" | "call" | "refer"

interface Student {
  id: string
  name: string
  class: string
  crisisScore: number
  riskLevel: RiskLevel
  daysOffline: number
  stressStreak: number
  engagementDrop: boolean
  isolationSignal: boolean
  lastSeen: string
  trend: "up" | "down" | "stable"
}

// --------- Mock data (replace with real MongoDB fetch) ------------------------------------------------------------------------------------------
const MOCK_STUDENTS: Student[] = [
  { id: "1", name: "Sara Ahmed",      class: "10-A", crisisScore: 82, riskLevel: "critical", daysOffline: 3,  stressStreak: 9,  engagementDrop: true,  isolationSignal: true,  lastSeen: "3 days ago", trend: "up"     },
  { id: "2", name: "Ali Hassan",      class: "9-B",  crisisScore: 67, riskLevel: "high",     daysOffline: 1,  stressStreak: 5,  engagementDrop: true,  isolationSignal: false, lastSeen: "1 day ago",  trend: "up"     },
  { id: "3", name: "Fatima Malik",    class: "11-C", crisisScore: 44, riskLevel: "medium",   daysOffline: 0,  stressStreak: 3,  engagementDrop: false, isolationSignal: false, lastSeen: "Today",      trend: "stable" },
  { id: "4", name: "Usman Khan",      class: "10-B", crisisScore: 71, riskLevel: "high",     daysOffline: 2,  stressStreak: 6,  engagementDrop: true,  isolationSignal: true,  lastSeen: "2 days ago", trend: "up"     },
  { id: "5", name: "Zara Siddiqui",   class: "12-A", crisisScore: 18, riskLevel: "low",      daysOffline: 0,  stressStreak: 0,  engagementDrop: false, isolationSignal: false, lastSeen: "Today",      trend: "down"   },
  { id: "6", name: "Hamza Qureshi",   class: "9-A",  crisisScore: 55, riskLevel: "medium",   daysOffline: 0,  stressStreak: 2,  engagementDrop: true,  isolationSignal: false, lastSeen: "Today",      trend: "stable" },
  { id: "7", name: "Ayesha Nawaz",    class: "11-B", crisisScore: 88, riskLevel: "critical", daysOffline: 4,  stressStreak: 11, engagementDrop: true,  isolationSignal: true,  lastSeen: "4 days ago", trend: "up"     },
  { id: "8", name: "Bilal Tariq",     class: "10-C", crisisScore: 31, riskLevel: "low",      daysOffline: 0,  stressStreak: 1,  engagementDrop: false, isolationSignal: false, lastSeen: "Today",      trend: "down"   },
]

// --------- Risk Config ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; label: string; dot: string }> = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",  label: "CRITICAL", dot: "bg-red-500"    },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)", label: "HIGH",     dot: "bg-orange-500" },
  medium:   { color: "#eab308", bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.25)",  label: "MEDIUM",   dot: "bg-yellow-500" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",  label: "LOW",      dot: "bg-green-500"  },
}

// --------- Crisis Score Ring ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function CrisisRing({ score, level }: { score: number; level: RiskLevel }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = RISK_CONFIG[level].color

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="14" fontWeight="700">{score}</text>
    </svg>
  )
}

// --------- Action Button ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ActionBtn({
  type, label, icon, onClick
}: { type: ActionType; label: string; icon: string; onClick: () => void }) {
  const colors: Record<ActionType, string> = {
    message: "hover:border-cyan-500/40 hover:text-cyan-400",
    alert:   "hover:border-orange-500/40 hover:text-orange-400",
    call:    "hover:border-green-500/40 hover:text-green-400",
    refer:   "hover:border-violet-500/40 hover:text-violet-400",
  }
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 rounded-lg border border-white/8
        bg-white/4 px-3 py-1.5 text-xs font-semibold text-slate-400
        transition-all duration-200 ${colors[type]}
      `}
    >
      <span>{icon}</span>{label}
    </button>
  )
}

// --------- Student Card ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function StudentCard({ student, onAction }: { student: Student; onAction: (s: Student, a: ActionType) => void }) {
  const cfg = RISK_CONFIG[student.riskLevel]
  const isCritical = student.riskLevel === "critical"

  return (
    <div
      className="relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]"
      style={{ background: cfg.bg, borderColor: cfg.border, boxShadow: isCritical ? `0 0 20px ${cfg.color}18` : "none" }}
    >
      {/* Pulse for critical */}
      {isCritical && (
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Score Ring */}
          <CrisisRing score={student.crisisScore} level={student.riskLevel} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-white truncate">{student.name}</p>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                {cfg.label}
              </span>
              {isCritical && (
                <span className="animate-pulse text-[10px] font-bold text-red-400">⚠ URGENT</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Class {student.class} · Last seen {student.lastSeen}</p>

            {/* Signal Pills */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {student.stressStreak > 0 && (
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 border border-white/8">
                  😓 Stressed {student.stressStreak} days
                </span>
              )}
              {student.daysOffline > 0 && (
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 border border-white/8">
                  📴 Offline {student.daysOffline}d
                </span>
              )}
              {student.engagementDrop && (
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 border border-white/8">
                  📉 Engagement drop
                </span>
              )}
              {student.isolationSignal && (
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-red-400/70 border border-red-500/20">
                  🔇 Isolation signal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
          <ActionBtn type="message" label="Message"  icon="💬" onClick={() => onAction(student, "message")} />
          <ActionBtn type="alert"   label="Alert Teacher" icon="🔔" onClick={() => onAction(student, "alert")} />
          <ActionBtn type="call"    label="Call Parent"   icon="📞" onClick={() => onAction(student, "call")}  />
          <ActionBtn type="refer"   label="Refer Counselor" icon="🧠" onClick={() => onAction(student, "refer")} />
        </div>
      </div>
    </div>
  )
}

// --------- Stat Cards ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function OverviewCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm hover:border-white/15 transition-all duration-300">
      <div className={`absolute inset-x-0 top-0 h-px ${accent}`} />
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{sub}</p>
    </div>
  )
}

// --------- Toast Notification ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#020817] px-5 py-3 shadow-2xl animate-in slide-in-from-bottom-4">
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      <p className="text-sm font-medium text-slate-200">{msg}</p>
      <button onClick={onClose} className="text-slate-600 hover:text-white ml-2">✕</button>
    </div>
  )
}

// --------- Filter Tabs ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const FILTERS: { key: RiskLevel | "all"; label: string }[] = [
  { key: "all",      label: "All Students" },
  { key: "critical", label: "Critical"     },
  { key: "high",     label: "High Risk"    },
  { key: "medium",   label: "Medium"       },
  { key: "low",      label: "Low Risk"     },
]

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function WellbeingMonitorPage() {
  const [filter, setFilter]   = useState<RiskLevel | "all">("all")
  const [search, setSearch]   = useState("")
  const [toast, setToast]     = useState<string | null>(null)
  const [pulse, setPulse]     = useState(true)

  // Simulate live pulse every 30s
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 30000)
    return () => clearInterval(id)
  }, [])

  const filtered = MOCK_STUDENTS
    .filter(s => filter === "all" || s.riskLevel === filter)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.class.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.crisisScore - a.crisisScore)

  const critical = MOCK_STUDENTS.filter(s => s.riskLevel === "critical").length
  const high     = MOCK_STUDENTS.filter(s => s.riskLevel === "high").length
  const avgScore = Math.round(MOCK_STUDENTS.reduce((a, s) => a + s.crisisScore, 0) / MOCK_STUDENTS.length)

  const handleAction = (student: Student, action: ActionType) => {
    const msgs: Record<ActionType, string> = {
      message: `Message sent to ${student.name}`,
      alert:   `Teacher alerted about ${student.name}`,
      call:    `Parent call initiated for ${student.name}`,
      refer:   `${student.name} referred to counselor`,
    }
    setToast(msgs[action])
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817]">

      {/* ------ Ambient Orbs --------------------------------------------------------------------------------------------------------------------------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-500/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-violet-600/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />

      {/* ------ Grid Texture --------------------------------------------------------------------------------------------------------------------------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ------ Header --------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                ← Dashboard
              </a>
              <span className="text-slate-700">/</span>
              <span className="text-xs text-slate-500">Wellbeing Monitor</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Student Wellbeing Monitor
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              AI-powered mental health & crisis detection — real time
            </p>
          </div>

          {/* Live Badge */}
          <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/8 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Live Monitoring</span>
          </div>
        </div>

        {/* ------ Divider ------------------------------------------------------------------------------------------------------------------------------------------------------------------ */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ------ Overview Stats ------------------------------------------------------------------------------------------------------------------------------------------------ */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <OverviewCard
            label="Crisis Alerts"
            value={critical}
            sub="Require immediate action"
            accent="bg-gradient-to-r from-red-500 to-rose-500"
          />
          <OverviewCard
            label="High Risk"
            value={high}
            sub="Needs attention today"
            accent="bg-gradient-to-r from-orange-500 to-amber-500"
          />
          <OverviewCard
            label="Avg Crisis Score"
            value={`${avgScore}/100`}
            sub="School-wide index"
            accent="bg-gradient-to-r from-violet-500 to-purple-500"
          />
          <OverviewCard
            label="Total Monitored"
            value={MOCK_STUDENTS.length}
            sub="Active students"
            accent="bg-gradient-to-r from-cyan-500 to-blue-500"
          />
        </div>

        {/* ------ WORLD FIRST Banner ------------------------------------------------------------------------------------------------------------------------------------ */}
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-lg">★★</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">World First Feature</p>
              <p className="mt-0.5 text-sm text-slate-400">
                No school software in the world monitors student mental health signals at this level.
                Crisis scores are calculated automatically — never shown to students or classmates.
              </p>
            </div>
          </div>
        </div>

        {/* ------ Search + Filter --------------------------------------------------------------------------------------------------------------------------------------------- */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-white/4 pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  filter === f.key
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                    : "border border-white/8 bg-white/4 text-slate-500 hover:text-slate-300 hover:border-white/15"
                }`}
              >
                {f.label}
                {f.key !== "all" && (
                  <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                    {MOCK_STUDENTS.filter(s => s.riskLevel === f.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ------ Student Grid --------------------------------------------------------------------------------------------------------------------------------------------------------- */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-white/8 bg-white/4 p-10 text-center">
              <p className="text-slate-600">No students match this filter.</p>
            </div>
          ) : (
            filtered.map(student => (
              <StudentCard key={student.id} student={student} onAction={handleAction} />
            ))
          )}
        </div>

        {/* ------ Footer Note ------------------------------------------------------------------------------------------------------------------------------------------------------------ */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span className="text-xs text-slate-600">
              Crisis scores are <span className="text-slate-400 font-medium">confidential</span> — never shown to students
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-600">
              Data refreshes every 30 seconds automatically
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-600">
              Score above 70 triggers an <span className="text-amber-400 font-medium">urgent admin alert</span>
            </span>
          </div>
        </div>

      </main>

      {/* ------ Toast ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
