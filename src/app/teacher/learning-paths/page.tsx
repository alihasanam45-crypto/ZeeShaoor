"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid,
} from "recharts"
import {
  GraduationCap, Users, RefreshCw, GripVertical, ArrowRight,
  Brain, TrendingUp, AlertTriangle, Sparkles, ChevronDown, Zap,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
  strong: "#10b981", average: "#f59e0b", weak: "#ef4444",
}

interface StudentCard {
  studentId: string
  studentName: string
  averageScore: number
  assignedGroup: string
  isManuallyOverridden: boolean
}

interface HistoryPoint {
  weekStart: string
  strongAvg: number
  averageAvg: number
  weakAvg: number
}

const GROUP_COLORS = { Strong: C.strong, Average: C.average, Weak: C.weak }
const GROUP_BG = { Strong: `${C.strong}08`, Average: `${C.average}08`, Weak: `${C.weak}08` }
const GROUP_BORDER = { Strong: `${C.strong}20`, Average: `${C.average}20`, Weak: `${C.weak}20` }

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

function StudentDraggableCard({
  student,
  group,
  onMove,
}: {
  student: StudentCard
  group: string
  onMove: (studentId: string, direction: -1 | 1) => void
}) {
  const targets = ['Weak', 'Average', 'Strong']
  const idx = targets.indexOf(group)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        ...CARD_STYLES,
        padding: "12px 14px",
        cursor: "grab",
        borderLeft: `3px solid ${GROUP_COLORS[group as keyof typeof GROUP_COLORS]}`,
        background: student.isManuallyOverridden ? `${C.purple}06` : C.panel,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <GripVertical size={12} color={C.textDim} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{student.studentName}</span>
            {student.isManuallyOverridden && (
              <span style={{ fontSize: 9, background: `${C.purple}12`, color: C.purple, padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                Manual
              </span>
            )}
          </div>
          {student.averageScore > 0 && (
            <span style={{ fontSize: 11, color: C.textDim, marginLeft: 18 }}>
              Avg: {student.averageScore}%
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {idx > 0 && (
            <button
              onClick={() => onMove(student.studentId, -1)}
              title={`Move to ${targets[idx - 1]}`}
              style={{ padding: "4px 6px", background: `${GROUP_COLORS[targets[idx - 1] as keyof typeof GROUP_COLORS]}12`, color: GROUP_COLORS[targets[idx - 1] as keyof typeof GROUP_COLORS], border: "none", borderRadius: 6, fontSize: 10, cursor: "pointer" }}
            >
              ← {targets[idx - 1]}
            </button>
          )}
          {idx < targets.length - 1 && (
            <button
              onClick={() => onMove(student.studentId, 1)}
              title={`Move to ${targets[idx + 1]}`}
              style={{ padding: "4px 6px", background: `${GROUP_COLORS[targets[idx + 1] as keyof typeof GROUP_COLORS]}12`, color: GROUP_COLORS[targets[idx + 1] as keyof typeof GROUP_COLORS], border: "none", borderRadius: 6, fontSize: 10, cursor: "pointer" }}
            >
              {targets[idx + 1]} →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function LearningPathsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [classId, setClassId] = useState("9")
  const [subjectId, setSubjectId] = useState("Physics")
  const [students, setStudents] = useState<Record<string, StudentCard[]>>({
    Strong: [], Average: [], Weak: [],
  })
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/learning-paths?classId=${classId}&subjectId=${subjectId}`)
      if (res.ok) {
        const data = await res.json()
        const grouped: Record<string, StudentCard[]> = { Strong: [], Average: [], Weak: [] }
        for (const p of data.paths) {
          if (grouped[p.assignedGroup]) grouped[p.assignedGroup].push(p)
        }
        setStudents(grouped)
        if (data.history) setHistory(data.history)
      }
    } finally {
      setLoading(false)
    }
  }, [classId, subjectId])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadData()
  }, [status])

  const reEvaluate = async () => {
    setEvaluating(true)
    try {
      const res = await fetch("/api/teacher/learning-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "re-evaluate", classId, subjectId }),
      })
      if (res.ok) await loadData()
    } finally {
      setEvaluating(false)
    }
  }

  const moveStudent = async (studentId: string, direction: -1 | 1) => {
    const targets = ['Weak', 'Average', 'Strong']
    let currentGroup = ''
    for (const [g, list] of Object.entries(students)) {
      if (list.some((s) => s.studentId === studentId)) { currentGroup = g; break }
    }
    if (!currentGroup) return
    const idx = targets.indexOf(currentGroup)
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= targets.length) return
    const newGroup = targets[newIdx]

    setMovingId(studentId)
    // Optimistic update
    setStudents((prev) => {
      const updated = { ...prev }
      const student = updated[currentGroup].find((s) => s.studentId === studentId)
      if (!student) return prev
      updated[currentGroup] = updated[currentGroup].filter((s) => s.studentId !== studentId)
      student.assignedGroup = newGroup
      student.isManuallyOverridden = true
      updated[newGroup] = [...updated[newGroup], student]
      updated[newGroup].sort((a, b) => a.studentName.localeCompare(b.studentName))
      return updated
    })

    try {
      await fetch("/api/teacher/learning-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "override", studentId, classId, subjectId, newGroup }),
      })
    } finally {
      setMovingId(null)
    }
  }

  const totalStudents = Object.values(students).reduce((s, arr) => s + arr.length, 0)
  const groups = ['Strong', 'Average', 'Weak']

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Differentiated Learning Paths</h1>
            <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>AI-powered student grouping & adaptive learning</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={classId} onChange={(e) => setClassId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", background: C.panel }}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
            ))}
          </select>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", background: C.panel }}>
            {["Physics", "Chemistry", "Mathematics", "Biology", "English", "Urdu"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={reEvaluate} disabled={evaluating}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.gradient, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: evaluating ? 0.6 : 1 }}>
            <RefreshCw size={14} className={evaluating ? "spin" : ""} /> {evaluating ? "Evaluating..." : "Re-evaluate"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {groups.map((g) => {
          const count = students[g]?.length || 0
          const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
          const color = GROUP_COLORS[g as keyof typeof GROUP_COLORS]
          return (
            <div key={g} style={{ ...CARD_STYLES, flex: 1, padding: "14px 18px", borderLeft: `3px solid ${color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{g}</span>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginTop: 2 }}>{count}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 300, color: `${color}40` }}>{pct}%</div>
              </div>
              <div style={{ height: 3, background: C.elevated, borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ height: "100%", background: color, borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Kanban columns */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {groups.map((g) => {
              const color = GROUP_COLORS[g as keyof typeof GROUP_COLORS]
              const list = students[g] || []
              return (
                <div key={g} style={{ ...CARD_STYLES, background: `${color}04`, padding: 12, minHeight: 300 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "0 4px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{g}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: C.steel, background: C.elevated, padding: "1px 8px", borderRadius: 6 }}>{list.length}</span>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <div style={{ textAlign: "center", padding: 40, color: C.steel, fontSize: 12 }}>Loading...</div>
                    ) : list.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 30, color: C.textDim, fontSize: 11 }}>No students</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {list.map((s) => (
                          <StudentDraggableCard
                            key={s.studentId}
                            student={s}
                            group={g}
                            onMove={moveStudent}
                          />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance Chart */}
        <div style={{ flex: 1, minWidth: 280, ...CARD_STYLES, padding: 20, alignSelf: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} color={C.blue} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>Group Performance Trend</h3>
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: C.steel, fontSize: 11 }}>
              Re-evaluate to see trends
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={history} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="weekStart" tick={{ fontSize: 9, fill: C.steel }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: C.steel }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="strongAvg" stroke={C.strong} strokeWidth={2} dot={false} name="Strong" />
                <Line type="monotone" dataKey="averageAvg" stroke={C.average} strokeWidth={2} dot={false} name="Average" />
                <Line type="monotone" dataKey="weakAvg" stroke={C.weak} strokeWidth={2} dot={false} name="Weak" />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div style={{ marginTop: 12, display: "flex", gap: 12, justifyContent: "center" }}>
            {groups.map((g) => (
              <div key={g} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.steel }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: GROUP_COLORS[g as keyof typeof GROUP_COLORS] }} />
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        .spin { animation: spin 1s linear infinite }
      `}</style>
    </div>
  )
}
