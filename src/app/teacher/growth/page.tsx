"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp, BookOpen, CheckCircle, Plus, Trash2, Sparkles,
  Target, Clock, PenLine, X,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface PDData {
  _id: string
  teacherId: string
  pdHoursCompleted: number
  pdHoursTarget: number
  termGoals: { goalText: string; isCompleted: boolean }[]
  academicYear: string
}

interface JournalEntry {
  _id: string
  teacherId: string
  entryDate: string
  reflectionText: string
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

function ProgressRing({ completed, target, size = 120 }: { completed: number; target: number; size?: number }) {
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(completed / Math.max(target, 1), 1)
  const offset = circumference - pct * circumference
  const color = pct >= 0.8 ? C.emerald : pct >= 0.5 ? C.blue : C.amber

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.elevated} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill={C.text} fontSize={18} fontWeight={700} transform="rotate(90, 30, 30)" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}

export default function GrowthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [pd, setPd] = useState<PDData | null>(null)
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Edit state
  const [editHours, setEditHours] = useState(false)
  const [pdHoursInput, setPdHoursInput] = useState(0)
  const [pdTargetInput, setPdTargetInput] = useState(40)
  const [newGoal, setNewGoal] = useState("")

  // Journal state
  const [reflectionText, setReflectionText] = useState("")
  const [savingJournal, setSavingJournal] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/growth")
      if (res.ok) {
        const data = await res.json()
        if (data.pd) {
          setPd(data.pd)
          setPdHoursInput(data.pd.pdHoursCompleted)
          setPdTargetInput(data.pd.pdHoursTarget || 40)
        }
        setJournal(data.journal || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadData()
  }, [status])

  const savePDHours = async () => {
    await fetch("/api/teacher/growth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-pd", pdHoursCompleted: pdHoursInput, pdHoursTarget: pdTargetInput }),
    })
    setEditHours(false)
    loadData()
  }

  const addGoal = async () => {
    if (!newGoal.trim() || !pd) return
    const updatedGoals = [...pd.termGoals, { goalText: newGoal, isCompleted: false }]
    await fetch("/api/teacher/growth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-pd", termGoals: updatedGoals }),
    })
    setNewGoal("")
    loadData()
  }

  const toggleGoal = async (index: number) => {
    await fetch("/api/teacher/growth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-goal", goalIndex: index }),
    })
    loadData()
  }

  const addJournalEntry = async () => {
    if (!reflectionText.trim()) return
    setSavingJournal(true)
    await fetch("/api/teacher/growth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-journal", reflectionText }),
    })
    setReflectionText("")
    setSavingJournal(false)
    loadData()
  }

  const deleteJournal = async (entryId: string) => {
    await fetch("/api/teacher/growth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-journal", entryId }),
    })
    loadData()
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TrendingUp size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Professional Growth Tracker</h1>
          <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>Your private space for growth, goals & reflection</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>Loading...</div>
      ) : (
        <div style={{ display: "flex", gap: 24 }}>
          {/* Left: PD Progress + Goals */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* PD Hours Ring */}
            <div style={{ ...CARD_STYLES, padding: 24, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ flexShrink: 0 }}>
                <ProgressRing completed={pd?.pdHoursCompleted ?? 0} target={pd?.pdHoursTarget ?? 40} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                  PD Hours — {pd?.academicYear ?? '2025-2026'}
                </div>
                {editHours ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="number" value={pdHoursInput} onChange={(e) => setPdHoursInput(parseInt(e.target.value) || 0)}
                      style={{ width: 60, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                    <span style={{ fontSize: 12, color: C.steel }}>/</span>
                    <input type="number" value={pdTargetInput} onChange={(e) => setPdTargetInput(parseInt(e.target.value) || 1)}
                      style={{ width: 60, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                    <button onClick={savePDHours} style={{ padding: "6px 12px", background: C.emerald, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>Save</button>
                    <button onClick={() => setEditHours(false)} style={{ padding: "6px", background: "none", border: "none", color: C.steel, cursor: "pointer" }}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{pd?.pdHoursCompleted ?? 0}</span>
                    <span style={{ fontSize: 16, color: C.textDim }}>/ {pd?.pdHoursTarget ?? 40} hrs</span>
                    <button onClick={() => setEditHours(true)} style={{ marginLeft: 8, padding: "4px 10px", background: C.elevated, border: "none", borderRadius: 6, fontSize: 10, color: C.blue, cursor: "pointer" }}>Edit</button>
                  </div>
                )}
              </div>
            </div>

            {/* Term Goals */}
            <div style={{ ...CARD_STYLES, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Target size={16} color={C.emerald} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Term Goals</h3>
                <span style={{ marginLeft: "auto", fontSize: 11, color: C.steel }}>
                  {pd?.termGoals?.filter((g) => g.isCompleted).length ?? 0}/{pd?.termGoals?.length ?? 0} completed
                </span>
              </div>

              <AnimatePresence mode="popLayout">
                {pd?.termGoals?.map((goal, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => toggleGoal(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                      cursor: "pointer", borderRadius: 8, marginBottom: 4,
                      background: goal.isCompleted ? `${C.emerald}08` : C.elevated,
                      textDecoration: goal.isCompleted ? "line-through" : "none",
                      opacity: goal.isCompleted ? 0.6 : 1,
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${goal.isCompleted ? C.emerald : C.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {goal.isCompleted && <CheckCircle size={14} color={C.emerald} />}
                    </div>
                    <span style={{ fontSize: 13, color: C.text }}>{goal.goalText}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a new goal..."
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none" }}
                  onKeyDown={(e) => e.key === "Enter" && addGoal()} />
                <button onClick={addGoal} disabled={!newGoal.trim()}
                  style={{ padding: "8px 12px", background: C.emerald, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer", opacity: !newGoal.trim() ? 0.5 : 1 }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Private Journal */}
          <div style={{ flex: 1, minWidth: 320, maxWidth: 480, ...CARD_STYLES, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <PenLine size={16} color={C.purple} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Private Self-Reflection Journal</h3>
              <span style={{ marginLeft: "auto", fontSize: 10, color: `${C.purple}`, background: `${C.purple}10`, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                🔒 Private
              </span>
            </div>

            {/* New entry */}
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Write your private reflection here..."
              rows={4}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", resize: "vertical", marginBottom: 8, lineHeight: 1.6 }}
            />
            <button onClick={addJournalEntry} disabled={savingJournal || !reflectionText.trim()}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.gradient, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: savingJournal || !reflectionText.trim() ? 0.6 : 1, marginBottom: 16 }}>
              <Plus size={12} /> Save Entry
            </button>

            {/* Journal entries */}
            <AnimatePresence mode="popLayout">
              {journal.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: C.steel, fontSize: 12 }}>
                  <PenLine size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>No journal entries yet. Start reflecting!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflow: "auto" }}>
                  {journal.map((entry, i) => (
                    <motion.div
                      key={entry._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ padding: "12px 14px", background: C.elevated, borderRadius: 10, borderLeft: `2px solid ${C.purple}40` }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: C.steel }}>
                          {new Date(entry.entryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button onClick={() => deleteJournal(entry._id)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 0 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{entry.reflectionText}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
