"use client"

import { useState } from "react"

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
type FeeStatus = "paid" | "overdue" | "pending" | "scholarship"

interface Student {
  id: string
  name: string
  class: string
  amount: number
  dueDate: string
  status: FeeStatus
  daysOverdue?: number
  parentPhone: string
  remindersSent: number
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const STUDENTS: Student[] = [
  { id:"1",  name:"Sara Ahmed",    class:"10-A", amount:5000, dueDate:"Jun 01", status:"overdue",     daysOverdue:20, parentPhone:"0300-1234567", remindersSent:3 },
  { id:"2",  name:"Ali Hassan",    class:"9-B",  amount:5000, dueDate:"Jun 01", status:"overdue",     daysOverdue:15, parentPhone:"0301-2345678", remindersSent:2 },
  { id:"3",  name:"Fatima Malik",  class:"11-C", amount:5000, dueDate:"Jun 15", status:"pending",     parentPhone:"0302-3456789", remindersSent:1 },
  { id:"4",  name:"Usman Khan",    class:"10-B", amount:5000, dueDate:"Jun 01", status:"paid",        parentPhone:"0303-4567890", remindersSent:0 },
  { id:"5",  name:"Zara Siddiqui", class:"12-A", amount:0,    dueDate:"—",      status:"scholarship", parentPhone:"0304-5678901", remindersSent:0 },
  { id:"6",  name:"Hamza Qureshi", class:"9-A",  amount:5000, dueDate:"Jun 15", status:"paid",        parentPhone:"0305-6789012", remindersSent:0 },
  { id:"7",  name:"Ayesha Nawaz",  class:"11-B", amount:5000, dueDate:"Jun 01", status:"overdue",     daysOverdue:8,  parentPhone:"0306-7890123", remindersSent:1 },
  { id:"8",  name:"Bilal Tariq",   class:"10-C", amount:5000, dueDate:"Jun 15", status:"pending",     parentPhone:"0307-8901234", remindersSent:1 },
]

const STATUS_CFG = {
  paid:        { color:"#22c55e", bg:"rgba(34,197,94,0.08)",   border:"rgba(34,197,94,0.25)",  label:"Paid"        },
  overdue:     { color:"#ef4444", bg:"rgba(239,68,68,0.08)",   border:"rgba(239,68,68,0.25)",  label:"Overdue"     },
  pending:     { color:"#eab308", bg:"rgba(234,179,8,0.08)",   border:"rgba(234,179,8,0.25)",  label:"Pending"     },
  scholarship: { color:"#a855f7", bg:"rgba(168,85,247,0.08)",  border:"rgba(168,85,247,0.25)", label:"Scholarship" },
}

// --------- Fee Row ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function FeeRow({ s, onRemind, onReceipt }: {
  s: Student
  onRemind: (s: Student) => void
  onReceipt: (s: Student) => void
}) {
  const cfg = STATUS_CFG[s.status]
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 hover:border-white/10 transition-all">
      {/* Status dot */}
      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: cfg.color }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-200">{s.name}</p>
          <span className="text-[10px] rounded-full px-2 py-0.5 font-bold uppercase"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
          {s.status === "overdue" && (
            <span className="text-[10px] text-red-400 font-bold animate-pulse">
              ⚠ {s.daysOverdue}d overdue
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Class {s.class} · Due: {s.dueDate} · {s.remindersSent} reminders sent</p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold" style={{ color: s.status === "scholarship" ? "#a855f7" : "white" }}>
          {s.status === "scholarship" ? "FREE" : `Rs. ${s.amount.toLocaleString()}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {(s.status === "overdue" || s.status === "pending") && (
          <button onClick={() => onRemind(s)}
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all">
            📨 Remind
          </button>
        )}
        {s.status === "paid" && (
          <button onClick={() => onReceipt(s)}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all">
            🧾 Receipt
          </button>
        )}
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
export default function FeesPage() {
  const [filter, setFilter] = useState<FeeStatus | "all">("all")
  const [toast, setToast]   = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const filtered = STUDENTS.filter(s => filter === "all" || s.status === filter)
  const paid        = STUDENTS.filter(s => s.status === "paid").length
  const overdue     = STUDENTS.filter(s => s.status === "overdue").length
  const pending     = STUDENTS.filter(s => s.status === "pending").length
  const scholarship = STUDENTS.filter(s => s.status === "scholarship").length
  const totalDue    = STUDENTS.filter(s => s.status === "overdue").reduce((a, s) => a + s.amount, 0)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817]">

      {/* Orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-amber-500/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin/wellbeing" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Dashboard</a>
              <span className="text-slate-700">/</span>
              <span className="text-xs text-slate-500">Fee Automation Engine</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Fee Automation Engine</h1>
            <p className="mt-1 text-sm text-slate-500">Automated reminders, receipts, and scholarship tracking</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Auto Mode ON</span>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label:"Paid",        value:paid,        accent:"from-emerald-500 to-teal-500",   color:"#22c55e" },
            { label:"Overdue",     value:overdue,     accent:"from-red-500 to-rose-500",        color:"#ef4444" },
            { label:"Pending",     value:pending,     accent:"from-amber-500 to-orange-500",    color:"#eab308" },
            { label:"Scholarship", value:scholarship, accent:"from-violet-500 to-purple-500",   color:"#a855f7" },
            { label:"Total Overdue", value:`Rs. ${totalDue.toLocaleString()}`, accent:"from-red-500 to-rose-500", color:"#ef4444" },
          ].map(s => (
            <div key={s.label} className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm hover:border-white/15 transition-all">
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.accent}`} />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className="mt-2 text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Overdue Alert */}
        {overdue > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/8 px-5 py-4">
            <span className="text-red-400 text-lg mt-0.5">⚠</span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">Overdue Alert</p>
              <p className="mt-0.5 text-sm text-slate-400">
                {overdue} students have overdue fees — total Rs. {totalDue.toLocaleString()} pending.
                Escalation reminders will be sent automatically today.
              </p>
            </div>
            <button
              onClick={() => {
                STUDENTS.filter(s => s.status === "overdue").forEach(s => showToast(`Escalation reminder sent to ${s.name}'s parent`))
              }}
              className="shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">
              Send All
            </button>
          </div>
        )}

        {/* Automation Info */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon:"🔔", title:"Auto Reminders",  desc:"Sent 3 days before due date automatically to all parents" },
            { icon:"🧾", title:"Auto Receipts",   desc:"PDF receipt generated and emailed on payment confirmation" },
            { icon:"📈", title:"Escalation",      desc:"Urgency increases every 7 days for overdue — 3 levels" },
          ].map(i => (
            <div key={i.title} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
              <span className="text-xl">{i.icon}</span>
              <div>
                <p className="text-xs font-semibold text-slate-300">{i.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { key:"all",         label:"All Students" },
            { key:"overdue",     label:"Overdue"      },
            { key:"pending",     label:"Pending"      },
            { key:"paid",        label:"Paid"         },
            { key:"scholarship", label:"Scholarship"  },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filter === f.key
                  ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                  : "border border-white/8 bg-white/4 text-slate-500 hover:text-slate-300"
              }`}>
              {f.label}
              <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {f.key === "all" ? STUDENTS.length : STUDENTS.filter(s => s.status === f.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Fee List */}
        <div className="mt-4 space-y-2">
          {filtered.map(s => (
            <FeeRow key={s.id} s={s}
              onRemind={s => showToast(`Reminder sent to ${s.name}'s parent (${s.parentPhone})`)}
              onReceipt={s => showToast(`Receipt PDF generated for ${s.name} — sent to parent`)}
            />
          ))}
        </div>

        {/* 5 Year History Note */}
        <div className="mt-8 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">📁 Fee History</p>
          <p className="text-xs text-slate-500">
            Complete 5-year fee history for every student is stored and searchable.
            Scholarship recipients are tracked separately with eligibility criteria.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-600">Receipts auto-sent on <span className="text-slate-400 font-medium">payment confirmation</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-600">Reminders sent <span className="text-amber-400 font-medium">3 days before</span> due date</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="text-xs text-slate-600">Scholarship managed <span className="text-slate-400">separately</span></span>
          </div>
        </div>

      </main>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
