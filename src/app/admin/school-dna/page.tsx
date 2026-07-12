"use client"

import { useState } from "react"

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface SubjectStat {
  subject: string
  score: number
  national: number
  trend: "up" | "down" | "stable"
}

interface ClassStat {
  class: string
  avg: number
  teacher: string
  rank: number
}

interface YearData {
  year: string
  score: number
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const SUBJECT_STATS: SubjectStat[] = [
  { subject: "Science",     score: 84, national: 71, trend: "up"     },
  { subject: "Mathematics", score: 78, national: 69, trend: "up"     },
  { subject: "English",     score: 61, national: 73, trend: "down"   },
  { subject: "Physics",     score: 81, national: 68, trend: "up"     },
  { subject: "Chemistry",   score: 72, national: 70, trend: "stable" },
  { subject: "Biology",     score: 88, national: 74, trend: "up"     },
  { subject: "Urdu",        score: 79, national: 76, trend: "stable" },
  { subject: "Computer",    score: 91, national: 65, trend: "up"     },
]

const CLASS_STATS: ClassStat[] = [
  { class: "Class 10-A", avg: 84, teacher: "Miss Fatima",  rank: 1 },
  { class: "Class 9-B",  avg: 81, teacher: "Mr. Raza",     rank: 2 },
  { class: "Class 12-A", avg: 79, teacher: "Miss Ayesha",  rank: 3 },
  { class: "Class 11-A", avg: 76, teacher: "Mr. Ahmed",    rank: 4 },
  { class: "Class 10-B", avg: 73, teacher: "Mr. Hassan",   rank: 5 },
  { class: "Class 9-A",  avg: 71, teacher: "Miss Zainab",  rank: 6 },
]

const YEAR_TREND: YearData[] = [
  { year: "2022", score: 71 },
  { year: "2023", score: 74 },
  { year: "2024", score: 78 },
  { year: "2025", score: 82 },
]

// --------- Bar Chart ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function SubjectBar({ s }: { s: SubjectStat }) {
  const isAbove = s.score > s.national
  const trendColor = s.trend === "up" ? "#22c55e" : s.trend === "down" ? "#ef4444" : "#eab308"
  const trendIcon  = s.trend === "up" ? "▲" : s.trend === "down" ? "▼" : "●"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-300">{s.subject}</span>
          <span className="text-[10px] font-bold" style={{ color: trendColor }}>{trendIcon}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">National: {s.national}%</span>
          <span className="text-sm font-bold" style={{ color: isAbove ? "#22c55e" : "#ef4444" }}>{s.score}%</span>
        </div>
      </div>
      {/* School bar */}
      <div className="relative h-2 rounded-full bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${s.score}%`, background: isAbove ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#ef4444,#dc2626)" }}
        />
        {/* National marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 rounded-full bg-slate-500"
          style={{ left: `${s.national}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-600">
        {isAbove
          ? `${s.score - s.national}% above national average`
          : `${s.national - s.score}% below national average`}
      </p>
    </div>
  )
}

// --------- Trend Line ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function TrendLine({ data }: { data: YearData[] }) {
  const w = 320, h = 80
  const min = Math.min(...data.map(d => d.score)) - 5
  const max = Math.max(...data.map(d => d.score)) + 5
  const range = max - min
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 40) + 20
    const y = h - ((d.score - min) / range) * (h - 20) - 10
    return { x, y, ...d }
  })
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#020817" stroke="#00f0ff" strokeWidth="2" />
          <text x={p.x} y={h - 2} textAnchor="middle" fill="#64748b" fontSize="10">{p.year}</text>
          <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">{p.score}%</text>
        </g>
      ))}
    </svg>
  )
}

// --------- Class Rank Card ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ClassRankCard({ c }: { c: ClassStat }) {
  const rankColor = c.rank === 1 ? "#eab308" : c.rank === 2 ? "#94a3b8" : c.rank === 3 ? "#f97316" : "#475569"
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 hover:border-white/10 transition-all">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: `${rankColor}20`, color: rankColor, border: `1px solid ${rankColor}40` }}
      >
        #{c.rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200">{c.class}</p>
        <p className="text-xs text-slate-500">{c.teacher}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">{c.avg}%</p>
        <div className="mt-1 h-1 w-16 rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{ width: `${c.avg}%` }} />
        </div>
      </div>
    </div>
  )
}

// --------- DNA Insight Card ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function InsightCard({ icon, title, value, sub, accent }: {
  icon: string; title: string; value: string; sub: string; accent: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm hover:border-white/15 transition-all">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent}`} />
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</p>
          <p className="mt-1 text-lg font-bold text-white">{value}</p>
          <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
        </div>
      </div>
    </div>
  )
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function SchoolDNAPage() {
  const [activeTab, setActiveTab] = useState<"subjects" | "classes" | "trend">("subjects")

  const best = SUBJECT_STATS.reduce((a, b) => a.score > b.score ? a : b)
  const worst = SUBJECT_STATS.reduce((a, b) => a.score < b.score ? a : b)
  const aboveNational = SUBJECT_STATS.filter(s => s.score > s.national).length
  const schoolAvg = Math.round(SUBJECT_STATS.reduce((a, s) => a + s.score, 0) / SUBJECT_STATS.length)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817]">

      {/* Orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-emerald-500/8 blur-3xl" />

      {/* Grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Dashboard</a>
              <span className="text-slate-700">/</span>
              <span className="text-xs text-slate-500">School DNA Analytics</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">School DNA Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">What makes your school unique — deep performance intelligence</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/8 px-4 py-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">★★ World First</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Insight Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <InsightCard icon="🏆" title="Best Subject"     value={best.subject}    sub={`${best.score}% avg score`}                          accent="from-amber-500 to-orange-500"  />
          <InsightCard icon="📉" title="Needs Attention"  value={worst.subject}   sub={`${worst.score}% — below target`}                    accent="from-red-500 to-rose-500"      />
          <InsightCard icon="📊" title="School Average"   value={`${schoolAvg}%`} sub="Across all subjects"                                 accent="from-cyan-500 to-blue-500"     />
          <InsightCard icon="🌍" title="Above National"   value={`${aboveNational}/${SUBJECT_STATS.length}`} sub="Subjects beating national avg" accent="from-emerald-500 to-teal-500" />
        </div>

        {/* Key Insight Banner */}
        <div className="mt-6 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">School DNA Insight</p>
          <p className="text-sm text-slate-300">
            Your school performs <span className="text-emerald-400 font-semibold">23% above</span> the national average in Science
            but <span className="text-red-400 font-semibold">12% below</span> in English.
            <span className="text-cyan-400 font-semibold"> Miss Fatima's Class 10-A</span> produces the best student outcomes school-wide.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2">
          {[
            { key: "subjects", label: "📚 Subject Performance" },
            { key: "classes",  label: "🎓 Class Rankings"      },
            { key: "trend",    label: "📈 3-Year Trend"        },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === t.key
                  ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                  : "border border-white/8 bg-white/4 text-slate-500 hover:text-slate-300"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">

          {/* Subjects */}
          {activeTab === "subjects" && (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">Subject vs National Average</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="h-1 w-6 rounded bg-emerald-500" /><span>School</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-0.5 rounded bg-slate-500" /><span>National</span></div>
                </div>
              </div>
              {SUBJECT_STATS.map(s => <SubjectBar key={s.subject} s={s} />)}
            </div>
          )}

          {/* Classes */}
          {activeTab === "classes" && (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold text-slate-300 mb-4">Class Rankings by Average Score</p>
              <div className="space-y-3">
                {CLASS_STATS.map(c => <ClassRankCard key={c.class} c={c} />)}
              </div>
              <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-xs text-amber-400 font-semibold">🏆 Top Performer</p>
                <p className="mt-0.5 text-sm text-slate-300">
                  Miss Fatima's Class 10-A leads with 84% average — highest in the school.
                </p>
              </div>
            </div>
          )}

          {/* Trend */}
          {activeTab === "trend" && (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold text-slate-300 mb-6">School Performance Over 3 Academic Years</p>
              <TrendLine data={YEAR_TREND} />
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {YEAR_TREND.map((y, i) => (
                  <div key={y.year} className="rounded-xl border border-white/5 bg-white/3 p-3 text-center">
                    <p className="text-xs text-slate-500">{y.year}</p>
                    <p className="mt-1 text-xl font-bold text-white">{y.score}%</p>
                    {i > 0 && (
                      <p className="mt-0.5 text-xs text-emerald-400">
                        +{y.score - YEAR_TREND[i-1].score}% growth
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3">
                <p className="text-xs text-cyan-400 font-semibold">📈 3-Year Growth</p>
                <p className="mt-0.5 text-sm text-slate-300">
                  School improved by <span className="text-cyan-400 font-bold">+11%</span> over 3 years —
                  consistently above national benchmark.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-600">Data from <span className="text-slate-400 font-medium">all quizzes, exams & assignments</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-600">National benchmark from <span className="text-slate-400">Punjab Board 2025</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-600">Updated <span className="text-amber-400 font-medium">daily at midnight</span></span>
          </div>
        </div>

      </main>
    </div>
  )
}
