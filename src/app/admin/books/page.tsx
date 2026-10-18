"use client"

import { useState } from "react"

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
type BoardType = "Punjab" | "Sindh" | "KPK" | "Federal"
type UploadStatus = "uploaded" | "missing" | "outdated"

interface Book {
  id: string
  class: number
  subject: string
  chapter: number
  totalChapters: number
  board: BoardType
  status: UploadStatus
  version: string
  lastUpdated: string
  downloads: number
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const BOOKS: Book[] = [
  { id:"1",  class:10, subject:"Physics",          chapter:9,  totalChapters:9,  board:"Punjab",  status:"uploaded", version:"v2.1", lastUpdated:"May 2025", downloads:1240 },
  { id:"2",  class:10, subject:"Chemistry",        chapter:8,  totalChapters:9,  board:"Punjab",  status:"missing",  version:"—",    lastUpdated:"—",        downloads:0    },
  { id:"3",  class:10, subject:"Mathematics",      chapter:9,  totalChapters:9,  board:"Punjab",  status:"uploaded", version:"v1.8", lastUpdated:"Apr 2025", downloads:2100 },
  { id:"4",  class:10, subject:"Biology",          chapter:7,  totalChapters:9,  board:"Punjab",  status:"outdated", version:"v1.2", lastUpdated:"Jan 2024", downloads:890  },
  { id:"5",  class:10, subject:"English",          chapter:9,  totalChapters:9,  board:"Punjab",  status:"uploaded", version:"v2.0", lastUpdated:"May 2025", downloads:1560 },
  { id:"6",  class:9,  subject:"Physics",          chapter:8,  totalChapters:8,  board:"Punjab",  status:"uploaded", version:"v1.9", lastUpdated:"Apr 2025", downloads:980  },
  { id:"7",  class:9,  subject:"Computer Science", chapter:8,  totalChapters:8,  board:"Punjab",  status:"uploaded", version:"v3.0", lastUpdated:"May 2025", downloads:3200 },
  { id:"8",  class:11, subject:"Physics",          chapter:3,  totalChapters:11, board:"Punjab",  status:"missing",  version:"—",    lastUpdated:"—",        downloads:0    },
  { id:"9",  class:11, subject:"Chemistry",        chapter:11, totalChapters:11, board:"Punjab",  status:"uploaded", version:"v1.5", lastUpdated:"Mar 2025", downloads:760  },
  { id:"10", class:12, subject:"Mathematics",      chapter:6,  totalChapters:9,  board:"Punjab",  status:"outdated", version:"v1.0", lastUpdated:"Dec 2023", downloads:430  },
]

const STATUS_CFG = {
  uploaded: { color:"#22c55e", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.25)",  label:"Uploaded", icon:"✅" },
  missing:  { color:"#ef4444", bg:"rgba(239,68,68,0.08)",  border:"rgba(239,68,68,0.25)",  label:"Missing",  icon:"❌" },
  outdated: { color:"#eab308", bg:"rgba(234,179,8,0.08)",  border:"rgba(234,179,8,0.25)",  label:"Outdated", icon:"⚠️" },
}

const BOARDS: BoardType[] = ["Punjab", "Sindh", "KPK", "Federal"]

// --------- Progress Ring ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ProgressRing({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = (done / total) * 100
  const r = 16, circ = 2 * Math.PI * r
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round" transform="rotate(-90 20 20)" />
      <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="8" fontWeight="700">{done}/{total}</text>
    </svg>
  )
}

// --------- Book Row ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function BookRow({ b, onUpload, onPreview }: {
  b: Book
  onUpload: (b: Book) => void
  onPreview: (b: Book) => void
}) {
  const cfg = STATUS_CFG[b.status]
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 hover:border-white/10 transition-all">
      <ProgressRing done={b.chapter} total={b.totalChapters} color={cfg.color} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-200">Class {b.class} — {b.subject}</p>
          <span className="text-[10px] rounded-full px-2 py-0.5 font-bold uppercase"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.icon} {cfg.label}
          </span>
          {b.status === "missing" && (
            <span className="text-[10px] text-red-400 font-bold animate-pulse">⚠ No CSV uploaded</span>
          )}
          {b.status === "outdated" && (
            <span className="text-[10px] text-amber-400 font-bold">Last updated {b.lastUpdated}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {b.board} Board · {b.chapter}/{b.totalChapters} chapters
          {b.version !== "—" && ` · ${b.version}`}
          {b.downloads > 0 && ` · ${b.downloads.toLocaleString()} downloads`}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        {b.status !== "missing" && (
          <button onClick={() => onPreview(b)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white hover:border-white/20 transition-all">
            👁 Preview
          </button>
        )}
        <button onClick={() => onUpload(b)}
          className="rounded-lg border px-3 py-1.5 text-[10px] font-bold transition-all"
          style={{
            borderColor: cfg.border,
            background: cfg.bg,
            color: cfg.color,
          }}>
          {b.status === "missing" ? "📤 Upload" : "🔄 Replace"}
        </button>
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

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function BooksPage() {
  const [board, setBoard]       = useState<BoardType>("Punjab")
  const [classFilter, setClass] = useState<number | "all">("all")
  const [toast, setToast]       = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const filtered = BOOKS
    .filter(b => b.board === board)
    .filter(b => classFilter === "all" || b.class === classFilter)

  const uploaded = BOOKS.filter(b => b.status === "uploaded").length
  const missing  = BOOKS.filter(b => b.status === "missing").length
  const outdated = BOOKS.filter(b => b.status === "outdated").length
  const classes  = [...new Set(BOOKS.map(b => b.class))].sort((a, b) => a - b)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817]">

      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin/wellbeing" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Dashboard</a>
              <span className="text-slate-700">/</span>
              <span className="text-xs text-slate-500">CSV Book Manager</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">CSV Book Manager</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all 60 CSV files — Class 5 through Class 12</p>
          </div>

          {/* Board Switch */}
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 p-1">
            {BOARDS.map(b => (
              <button key={b} onClick={() => setBoard(b)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  board === b
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label:"Uploaded",    value:uploaded, accent:"from-emerald-500 to-teal-500",   color:"#22c55e" },
            { label:"Missing",     value:missing,  accent:"from-red-500 to-rose-500",        color:"#ef4444" },
            { label:"Outdated",    value:outdated, accent:"from-amber-500 to-orange-500",    color:"#eab308" },
            { label:"Total Files", value:BOOKS.length, accent:"from-cyan-500 to-blue-500",  color:"#00f0ff" },
          ].map(s => (
            <div key={s.label} className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm hover:border-white/15 transition-all">
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.accent}`} />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Missing Alert */}
        {missing > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/8 px-5 py-4">
            <span className="text-red-400 text-lg">❌</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">Missing Files Detected</p>
              <p className="mt-0.5 text-sm text-slate-400">
                {missing} CSV files are missing — students cannot access these chapters until uploaded.
              </p>
            </div>
          </div>
        )}

        {/* Board Switch Info */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 px-5 py-4">
          <span className="text-cyan-400 text-lg">🔄</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">One-Click Board Switch</p>
            <p className="mt-0.5 text-sm text-slate-400">
              Switch between Punjab, Sindh, KPK, and Federal Board above —
              all content changes automatically for students.
            </p>
          </div>
        </div>

        {/* Class Filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={() => setClass("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              classFilter === "all"
                ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                : "border border-white/8 bg-white/4 text-slate-500 hover:text-slate-300"
            }`}>
            All Classes
          </button>
          {classes.map(c => (
            <button key={c} onClick={() => setClass(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                classFilter === c
                  ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                  : "border border-white/8 bg-white/4 text-slate-500 hover:text-slate-300"
              }`}>
              Class {c}
            </button>
          ))}
        </div>

        {/* Book List */}
        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-10 text-center">
              <p className="text-slate-600">No files found for this filter.</p>
            </div>
          ) : (
            filtered.map(b => (
              <BookRow key={b.id} b={b}
                onUpload={b => showToast(`Upload dialog opened for Class ${b.class} ${b.subject}`)}
                onPreview={b => showToast(`Preview opened for Class ${b.class} ${b.subject} — ${b.chapter} chapters`)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-600">Version control — <span className="text-slate-400 font-medium">previous version kept as backup</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-600">Batch upload <span className="text-slate-400">60 files at once</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-600">Missing chapter detector <span className="text-amber-400 font-medium">auto-alerts</span></span>
          </div>
        </div>

      </main>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
