"use client"

import { useState } from "react"

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
type RiskType = "exam" | "dropout" | "fee" | "burnout"
type Severity = "critical" | "high" | "medium"

interface Prediction {
  id: string
  type: RiskType
  severity: Severity
  title: string
  detail: string
  confidence: number
  dataPoints: string[]
  action: string
  student?: string
  class?: string
  teacher?: string
}

// --------- Mock Predictions ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const PREDICTIONS: Prediction[] = [
  {
    id: "1",
    type: "exam",
    severity: "critical",
    title: "Exam Failure Risk",
    detail: "12 students likely to fail Math board exam based on current trajectory",
    confidence: 87,
    student: "Class 10-A & 10-B",
    dataPoints: [
      "Average quiz score dropped from 72% to 51% in 3 weeks",
      "Attendance below 70% for 8 students",
      "AI checker usage dropped 60% this month",
      "Last 3 mock tests — avg score 44%",
    ],
    action: "Schedule emergency revision sessions for Class 10-A Math",
  },
  {
    id: "2",
    type: "dropout",
    severity: "critical",
    title: "Dropout Risk Detected",
    detail: "Kamran Iqbal shows 78% dropout risk based on engagement decline",
    confidence: 78,
    student: "Kamran Iqbal — Class 9-B",
    dataPoints: [
      "Not logged in for 6 consecutive days",
      "Quiz completion rate: 12% (was 89%)",
      "Parent email bouncing — contact issue",
      "Fee overdue for 2 months",
    ],
    action: "Immediately contact parent via phone — assign counselor",
  },
  {
    id: "3",
    type: "fee",
    severity: "high",
    title: "Fee Default Probability",
    detail: "Class 9-B has elevated probability of fee defaults next month",
    confidence: 71,
    class: "Class 9-B (14 students)",
    dataPoints: [
      "3 students already overdue this month",
      "Payment delay pattern — last 2 months",
      "Reminder open rate dropped to 23%",
      "2 scholarship applications pending",
    ],
    action: "Send personalized fee reminders — offer installment plan",
  },
  {
    id: "4",
    type: "burnout",
    severity: "high",
    title: "Teacher Burnout Signal",
    detail: "Mr. Ahmed showing early burnout signals — workload review recommended",
    confidence: 69,
    teacher: "Mr. Ahmed — Physics",
    dataPoints: [
      "Teaching 6 classes simultaneously — max is 4",
      "Response time to student messages: 18hrs avg",
      "Lesson upload frequency dropped 40%",
      "3 session cancellations this week",
    ],
    action: "Reassign 2 classes — schedule wellbeing check-in",
  },
  {
    id: "5",
    type: "exam",
    severity: "medium",
    title: "Board Readiness Gap",
    detail: "Class 11-A Chemistry needs 6 more weeks of revision for 80% readiness",
    confidence: 82,
    class: "Class 11-A",
    dataPoints: [
      "Current board readiness: 61%",
      "Weak chapters: Organic, Electrochemistry",
      "Practice paper completion: 34% only",
      "Previous year same class was at 74% at this stage",
    ],
    action: "Add 2 extra Chemistry sessions per week for 6 weeks",
  },
  {
    id: "6",
    type: "dropout",
    severity: "medium",
    title: "Isolation Pattern",
    detail: "Sara Malik showing social isolation signals — needs counselor attention",
    confidence: 64,
    student: "Sara Malik — Class 10-C",
    dataPoints: [
      "Zero chat messages sent in 2 weeks",
      "Quiz scores stable but engagement dropped",
      "Wellbeing check-in score: 28/100",
      "Offline during all group activities",
    ],
    action: "Refer to counselor — notify class teacher confidentially",
  },
]

// --------- Config ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const SEVERITY_CFG = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  label: "CRITICAL" },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)", label: "HIGH"     },
  medium:   { color: "#eab308", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.25)",  label: "MEDIUM"   },
}

const TYPE_CFG = {
  exam:    { icon: "📊", label: "Exam Risk",      color: "#ef4444" },
  dropout: { icon: "🚨", label: "Dropout Risk",   color: "#f97316" },
  fee:     { icon: "💰", label: "Fee Default",    color: "#eab308" },
  burnout: { icon: "🔥", label: "Teacher Burnout",color: "#a855f7" },
}

// --------- Confidence Ring ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ConfidenceRing({ pct, color }: { pct: number; color: string }) {
  const r = 24, circ = 2 * Math.PI * r
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
      <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round" transform="rotate(-90 30 30)" />
      <text x="30" y="30" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="11" fontWeight="700">{pct}%</text>
    </svg>
  )
}

// --------- Prediction Card ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function PredictionCard({ p, onAct }: { p: Prediction; onAct: (p: Prediction) => void }) {
  const [open, setOpen] = useState(false)
  const sev = SEVERITY_CFG[p.severity]
  const typ = TYPE_CFG[p.type]

  return (
    <div
      className="relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300"
      style={{ background: sev.bg, borderColor: sev.border, boxShadow: p.severity === "critical" ? `0 0 24px ${sev.color}15` : "none" }}
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${sev.color}, transparent)` }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Confidence Ring */}
          <ConfidenceRing pct={p.confidence} color={sev.color} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">{typ.icon}</span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: typ.color }}>{typ.label}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                {sev.label}
              </span>
              {p.severity === "critical" && (
                <span className="animate-pulse text-[10px] font-bold text-red-400">⚠ ACT NOW</span>
              )}
            </div>

            <p className="mt-1.5 text-sm font-bold text-white">{p.title}</p>
            <p className="mt-0.5 text-xs text-slate-400">{p.detail}</p>

            {/* Who */}
            {(p.student || p.class || p.teacher) && (
              <p className="mt-2 text-xs text-slate-500">
                🎯 {p.student || p.class || p.teacher}
              </p>
            )}
          </div>
        </div>

        {/* Data Points Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span>{open ? "▲" : "▼"}</span>
          <span>{open ? "Hide" : "Show"} data points ({p.dataPoints.length})</span>
        </button>

        {open && (
          <div className="mt-3 rounded-xl border border-white/5 bg-white/3 p-3 space-y-1.5">
            {p.dataPoints.map((dp, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-600 mt-0.5 text-xs">•</span>
                <p className="text-xs text-slate-400">{dp}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action Row */}
        <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-3">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Recommended Action</p>
            <p className="mt-0.5 text-xs text-slate-400">{p.action}</p>
          </div>
          <button
            onClick={() => onAct(p)}
            className="shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{ borderColor: sev.border, color: sev.color, background: sev.bg }}
          >
            Take Action
          </button>
        </div>
      </div>
    </div>
  )
}

// --------- Toast ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#020817] px-5 py-3 shadow-2xl">
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      <p className="text-sm font-medium text-slate-200">{msg}</p>
      <button onClick={onClose} className="text-slate-600 hover:text-white ml-2">✕</button>
    </div>
  )
}

// --------- Filter Tabs ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const FILTERS = [
  { key: "all",     label: "All Predictions" },
  { key: "exam",    label: "Exam Risk"        },
  { key: "dropout", label: "Dropout Risk"     },
  { key: "fee",     label: "Fee Default"      },
  { key: "burnout", label: "Teacher Burnout"  },
] as const

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function PredictiveAIPage() {
  const [filter, setFilter] = useState<"all" | RiskType>("all")
  const [toast, setToast]   = useState<string | null>(null)

  const filtered = PREDICTIONS.filter(p => filter === "all" || p.type === filter)
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2 }
      return order[a.severity] - order[b.severity]
    })

  const critical = PREDICTIONS.filter(p => p.severity === "critical").length
  const high     = PREDICTIONS.filter(p => p.severity === "high").length

  const handleAction = (p: Prediction) => {
    setToast(`Action logged for: ${p.title}`)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817]">

      {/* Orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-500/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-red-600/8 blur-3xl" />

      {/* Grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Dashboard</a>
              <span className="text-slate-700">/</span>
              <span className="text-xs text-slate-500">Predictive AI</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Predictive AI</h1>
            <p className="mt-1 text-sm text-slate-500">Problems predicted before they happen — act early</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/8 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
            </span>
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">AI Active</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Critical Risks",   value: critical,              sub: "Require immediate action", accent: "from-red-500 to-rose-500"      },
            { label: "High Risks",        value: high,                  sub: "Act within 48 hours",      accent: "from-orange-500 to-amber-500"  },
            { label: "Total Predictions", value: PREDICTIONS.length,    sub: "Active AI predictions",    accent: "from-violet-500 to-purple-500" },
            { label: "Avg Confidence",    value: Math.round(PREDICTIONS.reduce((a, p) => a + p.confidence, 0) / PREDICTIONS.length), sub: "Prediction accuracy", accent: "from-cyan-500 to-blue-500" },
          ].map(s => (
            <div key={s.label} className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm hover:border-white/15 transition-all">
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.accent}`} />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{s.value}{s.label === "Avg Confidence" ? "%" : ""}</p>
              <p className="mt-1 text-xs text-slate-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* World First Banner */}
        <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="text-violet-400 text-lg">★★</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-400">World First — Predictive AI</p>
              <p className="mt-0.5 text-sm text-slate-400">
                Each prediction includes a confidence percentage and the specific data points used.
                The admin can act on these predictions before they become real problems.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filter === f.key
                  ? "bg-violet-500/15 border border-violet-500/30 text-violet-400"
                  : "border border-white/8 bg-white/4 text-slate-500 hover:text-slate-300"
              }`}>
              {f.label}
              <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {f.key === "all" ? PREDICTIONS.length : PREDICTIONS.filter(p => p.type === f.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map(p => <PredictionCard key={p.id} p={p} onAct={handleAction} />)}
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="text-xs text-slate-600">AI analyzes <span className="text-slate-400 font-medium">historical patterns</span> + current signals</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-600">Predictions updated <span className="text-slate-400">every 6 hours</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-600">Confidence above <span className="text-amber-400 font-medium">60%</span> triggers alert</span>
          </div>
        </div>

      </main>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
