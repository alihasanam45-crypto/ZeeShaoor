"use client"

import { useState } from "react"

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Teacher {
  id: string
  name: string
  subject: string
  engagement: number
  satisfaction: number
  classes: string[]
  status: "excellent" | "good" | "needs-support"
  insight: string
  students: number
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const TEACHERS: Teacher[] = [
  {
    id: "1",
    name: "Miss Fatima",
    subject: "Science",
    engagement: 94,
    satisfaction: 96,
    classes: ["10-A", "10-B", "9-A"],
    status: "excellent",
    insight: "Miss Fatima has a 94% student satisfaction score — highest in the school.",
    students: 87,
  },
  {
    id: "2",
    name: "Mr. Raza",
    subject: "Mathematics",
    engagement: 61,
    satisfaction: 63,
    classes: ["9-B", "11-A"],
    status: "needs-support",
    insight: "Mr. Raza has a 61% engagement score — a conversation and support may help.",
    students: 54,
  },
  {
    id: "3",
    name: "Miss Ayesha",
    subject: "English",
    engagement: 78,
    satisfaction: 80,
    classes: ["12-A", "12-B"],
    status: "good",
    insight: "Miss Ayesha maintains consistent engagement — students respond well.",
    students: 61,
  },
  {
    id: "4",
    name: "Mr. Ahmed",
    subject: "Physics",
    engagement: 55,
    satisfaction: 58,
    classes: ["11-A", "11-B", "12-A"],
    status: "needs-support",
    insight: "Mr. Ahmed is showing early burnout signals — workload review recommended.",
    students: 79,
  },
  {
    id: "5",
    name: "Miss Zainab",
    subject: "Biology",
    engagement: 88,
    satisfaction: 91,
    classes: ["9-A", "10-C"],
    status: "excellent",
    insight: "Miss Zainab's interactive teaching style drives high student participation.",
    students: 58,
  },
  {
    id: "6",
    name: "Mr. Hassan",
    subject: "Chemistry",
    engagement: 72,
    satisfaction: 74,
    classes: ["10-B", "11-C"],
    status: "good",
    insight: "Mr. Hassan shows steady performance — slight improvement in last month.",
    students: 63,
  },
]

// --------- Status Config ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const STATUS_CFG = {
  excellent:      { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",  label: "Excellent",      glow: "0 0 20px rgba(34,197,94,0.15)"    },
  good:           { color: "#00f0ff", bg: "rgba(0,240,255,0.06)",   border: "rgba(0,240,255,0.2)",   label: "Good",           glow: "none"                              },
  "needs-support":{ color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)", label: "Needs Support",  glow: "0 0 20px rgba(249,115,22,0.12)"   },
}

// --------- Network Node SVG ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function NetworkMap({ teachers, selected, onSelect }: {
  teachers: Teacher[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  const cx = 300, cy = 200, r = 140
  const positions = teachers.map((_, i) => {
    const angle = (i / teachers.length) * 2 * Math.PI - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  return (
    <svg viewBox="0 0 600 400" className="w-full h-full" style={{ maxHeight: 360 }}>
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Center glow */}
      <circle cx={cx} cy={cy} r="60" fill="url(#centerGlow)" />

      {/* Connection lines */}
      {teachers.map((t, i) => {
        const pos = positions[i]
        const cfg = STATUS_CFG[t.status]
        const isSelected = selected === t.id
        const thickness = (t.engagement / 100) * 4 + 0.5
        return (
          <line key={t.id}
            x1={cx} y1={cy} x2={pos.x} y2={pos.y}
            stroke={cfg.color}
            strokeWidth={isSelected ? thickness + 1.5 : thickness}
            strokeOpacity={isSelected ? 1 : selected ? 0.2 : 0.5}
            style={{ transition: "all 0.3s ease" }}
          />
        )
      })}

      {/* Center node — School */}
      <circle cx={cx} cy={cy} r="28" fill="#020817" stroke="#00f0ff" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="22" fill="rgba(0,240,255,0.1)" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#00f0ff" fontSize="9" fontWeight="700">ZeeShaoor</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#00f0ff" fontSize="8">.Pk</text>

      {/* Teacher nodes */}
      {teachers.map((t, i) => {
        const pos = positions[i]
        const cfg = STATUS_CFG[t.status]
        const isSelected = selected === t.id
        const nodeR = 22 + (t.engagement / 100) * 8

        return (
          <g key={t.id} onClick={() => onSelect(t.id)} style={{ cursor: "pointer" }}>
            {isSelected && (
              <circle cx={pos.x} cy={pos.y} r={nodeR + 8}
                fill="none" stroke={cfg.color} strokeWidth="1.5" strokeOpacity="0.4"
                className="animate-ping" style={{ animationDuration: "2s" }} />
            )}
            <circle cx={pos.x} cy={pos.y} r={nodeR}
              fill="#020817" stroke={cfg.color}
              strokeWidth={isSelected ? 2.5 : 1.5}
              strokeOpacity={selected && !isSelected ? 0.3 : 1}
              style={{ transition: "all 0.3s", filter: isSelected ? `drop-shadow(0 0 8px ${cfg.color})` : "none" }}
            />
            <circle cx={pos.x} cy={pos.y} r={nodeR - 6}
              fill={cfg.color} fillOpacity={isSelected ? 0.2 : 0.08}
              style={{ transition: "all 0.3s" }}
            />
            <text x={pos.x} y={pos.y - 3} textAnchor="middle" fill="white"
              fontSize="8" fontWeight="700" fillOpacity={selected && !isSelected ? 0.3 : 1}>
              {t.name.split(" ")[1] || t.name.split(" ")[0]}
            </text>
            <text x={pos.x} y={pos.y + 7} textAnchor="middle"
              fill={cfg.color} fontSize="8" fontWeight="700"
              fillOpacity={selected && !isSelected ? 0.3 : 1}>
              {t.engagement}%
            </text>
            {/* Label below */}
            <text x={pos.x} y={pos.y + nodeR + 12} textAnchor="middle"
              fill="#64748b" fontSize="8"
              fillOpacity={selected && !isSelected ? 0.3 : 1}>
              {t.subject}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// --------- Teacher Detail Panel ---------------------------------------------------------------------------------------------------------------------------------------------------------------
function TeacherDetail({ t }: { t: Teacher }) {
  const cfg = STATUS_CFG[t.status]
  return (
    <div className="rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300"
      style={{ background: cfg.bg, borderColor: cfg.border, boxShadow: cfg.glow }}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold"
          style={{ background: `${cfg.color}20`, border: `2px solid ${cfg.border}`, color: cfg.color }}>
          {t.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white">{t.name}</p>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.subject} · {t.students} students</p>
        </div>
      </div>

      {/* Scores */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Engagement</p>
          <p className="mt-1 text-xl font-bold" style={{ color: cfg.color }}>{t.engagement}%</p>
          <div className="mt-1 h-1.5 rounded-full bg-white/5">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${t.engagement}%`, background: cfg.color }} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Satisfaction</p>
          <p className="mt-1 text-xl font-bold" style={{ color: cfg.color }}>{t.satisfaction}%</p>
          <div className="mt-1 h-1.5 rounded-full bg-white/5">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${t.satisfaction}%`, background: cfg.color }} />
          </div>
        </div>
      </div>

      {/* Classes */}
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">Classes</p>
        <div className="flex flex-wrap gap-1.5">
          {t.classes.map(c => (
            <span key={c} className="rounded-lg px-2 py-0.5 text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
              Class {c}
            </span>
          ))}
        </div>
      </div>

      {/* AI Insight */}
      <div className="mt-3 rounded-xl border border-white/5 bg-white/3 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">AI Insight</p>
        <p className="text-xs text-slate-300 leading-relaxed">"{t.insight}"</p>
      </div>
    </div>
  )
}

// --------- Teacher List Row ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function TeacherRow({ t, selected, onSelect }: { t: Teacher; selected: boolean; onSelect: () => void }) {
  const cfg = STATUS_CFG[t.status]
  return (
    <button onClick={onSelect}
      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200"
      style={{
        background: selected ? cfg.bg : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? cfg.border : "rgba(255,255,255,0.05)"}`,
      }}>
      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: cfg.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-200 truncate">{t.name}</p>
        <p className="text-[10px] text-slate-500">{t.subject}</p>
      </div>
      <span className="text-xs font-bold shrink-0" style={{ color: cfg.color }}>{t.engagement}%</span>
    </button>
  )
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function ConnectivityPage() {
  const [selected, setSelected] = useState<string | null>(null)

  const selectedTeacher = TEACHERS.find(t => t.id === selected) ?? null

  const excellent     = TEACHERS.filter(t => t.status === "excellent").length
  const needsSupport  = TEACHERS.filter(t => t.status === "needs-support").length
  const avgEngagement = Math.round(TEACHERS.reduce((a, t) => a + t.engagement, 0) / TEACHERS.length)

  const toggle = (id: string) => setSelected(prev => prev === id ? null : id)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817]">

      {/* Orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-cyan-500/8 blur-3xl" />

      {/* Grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin/wellbeing" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Dashboard</a>
              <span className="text-slate-700">/</span>
              <span className="text-xs text-slate-500">Teacher-Student Connectivity</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Teacher-Student Connectivity Map</h1>
            <p className="mt-1 text-sm text-slate-500">Visual network — who is most connected to their students</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/8 px-4 py-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">★★ World First</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: "Total Teachers",    value: TEACHERS.length, sub: "Active this month",         accent: "from-cyan-500 to-blue-500"     },
            { label: "Excellent",         value: excellent,        sub: "High engagement scores",    accent: "from-emerald-500 to-teal-500"  },
            { label: "Needs Support",     value: needsSupport,     sub: "Require attention",         accent: "from-orange-500 to-amber-500"  },
            { label: "Avg Engagement",    value: `${avgEngagement}%`, sub: "School-wide average",   accent: "from-violet-500 to-purple-500" },
          ].map(s => (
            <div key={s.label} className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm hover:border-white/15 transition-all">
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.accent}`} />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs text-slate-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left — Teacher List */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
              Teachers — Click to highlight
            </h2>
            {TEACHERS.map(t => (
              <TeacherRow key={t.id} t={t} selected={selected === t.id} onSelect={() => toggle(t.id)} />
            ))}

            {/* Legend */}
            <div className="mt-4 rounded-xl border border-white/5 bg-white/3 p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Legend</p>
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-xs text-slate-500">{cfg.label}</span>
                  <div className="ml-auto h-0.5 w-8 rounded" style={{ background: cfg.color, opacity: 0.5 }} />
                  <span className="text-[10px] text-slate-600">Line thickness = engagement</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center — Network Map */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm">
            <NetworkMap teachers={TEACHERS} selected={selected} onSelect={toggle} />
            <p className="text-center text-[10px] text-slate-600 mt-2">
              Click any node to see details · Line thickness = engagement level
            </p>
          </div>

          {/* Right — Detail Panel */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
              {selectedTeacher ? "Teacher Details" : "Select a Teacher"}
            </h2>
            {selectedTeacher ? (
              <TeacherDetail t={selectedTeacher} />
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/4 p-8 text-center backdrop-blur-sm">
                <p className="text-4xl mb-3">👆</p>
                <p className="text-sm text-slate-500">Click any teacher node on the map or from the list to see their connectivity details</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-600">Line thickness represents <span className="text-slate-400 font-medium">engagement level</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-600">Node size represents <span className="text-slate-400">student count</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-600">Updated <span className="text-amber-400 font-medium">daily</span> from quiz & session data</span>
          </div>
        </div>

      </main>
    </div>
  )
}
