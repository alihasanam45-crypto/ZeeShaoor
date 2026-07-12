"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts"
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, RefreshCw,
  Zap, Activity, ChevronRight, BarChart3, Sparkles,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface PredictionRow {
  _id: string
  studentId: string
  classLevel: string
  subject: string
  predictedMin: number
  predictedMax: number
  confidenceScore: number
  factors: {
    quizTrend: number
    homeworkRate: number
    streak: number
    quizScores: number[]
    variance: number
  }
  interventionNeeded: boolean
  createdAt: string
}

function SparklineChart({ data }: { data: number[] }) {
  const chartData = data.map((v, i) => ({ week: `W${i + 1}`, score: v }))
  if (data.length === 0) return <div style={{ height: 40, color: C.steel, fontSize: 11, display: "flex", alignItems: "center" }}>No data</div>
  return (
    <ResponsiveContainer width={120} height={40}>
      <LineChart data={chartData}>
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "none", borderRadius: 6, fontSize: 11, color: "#fff" }}
          formatter={(value) => [`${value}%`, "Score"]}
        />
        <Line type="monotone" dataKey="score" stroke={C.blue} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 70 ? C.emerald : score >= 40 ? C.amber : C.rose
  const label = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low"
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}12`, padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>
      {label} ({score}%)
    </span>
  )
}

export default function MarkPredictorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [classLevel, setClassLevel] = useState("9")
  const [subject, setSubject] = useState("Physics")
  const [predictions, setPredictions] = useState<PredictionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [sortField, setSortField] = useState<string>("predictedMax")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const loadPredictions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/predictions?classLevel=${classLevel}&subject=${subject}`)
      const json = await res.json()
      setPredictions(json.data || [])
    } catch { /* silent */ }
    setLoading(false)
  }, [classLevel, subject])

  useEffect(() => { loadPredictions() }, [loadPredictions])
  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])

  // Dummy student list — in production fetch from Student model
  const dummyStudents = Array.from({ length: 12 }, (_, i) => `STU-${String(i + 1).padStart(3, "0")}`)

  const runPredictions = useCallback(async () => {
    setPredicting(true)
    try {
      const res = await fetch("/api/teacher/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classLevel, subject, studentIds: dummyStudents }),
      })
      const json = await res.json()
      if (json.data) {
        setPredictions(json.data)
      }
    } catch { /* silent */ }
    setPredicting(false)
  }, [classLevel, subject, dummyStudents])

  const sorted = useMemo(() => {
    return [...predictions].sort((a, b) => {
      const aVal = (a as any)[sortField] ?? 0
      const bVal = (b as any)[sortField] ?? 0
      return sortDir === "asc" ? aVal - bVal : bVal - aVal
    })
  }, [predictions, sortField, sortDir])

  const interventionCount = predictions.filter((p) => p.interventionNeeded).length

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.blue }}
        />
      </div>
    )
  }

  return (
    <div style={{ height: "100vh", background: C.bg, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: C.text, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes pulse-slow { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
        * { box-sizing:border-box }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: C.panel, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>AI Mark Predictor</div>
            <div style={{ fontSize: 12, color: C.steel }}>Data-driven performance forecasting engine</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)}
            style={{ padding: "7px 12px", fontSize: 13, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: "pointer" }}>
            {["5","6","7","8","9","10","11","12"].map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}
            style={{ padding: "7px 12px", fontSize: 13, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: "pointer" }}>
            {["Physics","Chemistry","Biology","Mathematics","English","Urdu","Computer","Pakistan Studies","Islamiyat"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={loadPredictions}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, cursor: "pointer" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={runPredictions} disabled={predicting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 20px", borderRadius: 8, border: "none", background: C.gradient, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: predicting ? 0.6 : 1 }}>
            <Zap size={14} /> {predicting ? "Predicting..." : "Run Predictions"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 16, padding: "14px 24px", borderBottom: `1px solid ${C.border}`, background: C.panel, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <BarChart3 size={16} color={C.steel} /> {predictions.length} students analyzed
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <Activity size={16} color={C.blue} /> Avg confidence: {predictions.length > 0 ? Math.round(predictions.reduce((s, p) => s + p.confidenceScore, 0) / predictions.length) : "—"}%
        </div>
        {interventionCount > 0 && (
          <motion.div animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.rose }}>
            <AlertTriangle size={16} /> {interventionCount} intervention{interventionCount > 1 ? "s" : ""} needed
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>Loading predictions...</div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>
            No predictions yet. Click "Run Predictions" to generate AI forecasts.
          </div>
        ) : (
          <div style={{ background: C.panel, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 100px 100px 1fr", gap: 0, borderBottom: `1px solid ${C.border}`, background: C.elevated }}>
              {[
                { key: "studentId", label: "Student" },
                { key: "predictedMax", label: "Range" },
                { key: "confidenceScore", label: "Confidence" },
                { key: "factors.quizTrend", label: "Quiz Trend" },
                { key: "factors.homeworkRate", label: "Homework" },
                { key: "", label: "6-Week Trend" },
              ].map((col) => (
                <div
                  key={col.label}
                  onClick={() => {
                    if (col.key) {
                      if (sortField === col.key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                      else { setSortField(col.key); setSortDir("asc") }
                    }
                  }}
                  style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: C.steel, cursor: col.key ? "pointer" : "default", display: "flex", alignItems: "center", gap: 4, userSelect: "none" }}
                >
                  {col.label}
                  {sortField === col.key && <span style={{ fontSize: 9 }}>{sortDir === "asc" ? "▲" : "▼"}</span>}
                </div>
              ))}
            </div>

            {/* Table rows */}
            <AnimatePresence>
              {sorted.map((row, i) => (
                <motion.div
                  key={row._id || i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 120px 100px 100px 1fr", gap: 0,
                    borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : "none",
                    background: row.interventionNeeded ? `${C.rose}05` : "transparent",
                    position: "relative",
                    transition: "background 0.15s",
                  }}
                  onMouseOver={(e) => {
                    if (!row.interventionNeeded) e.currentTarget.style.background = C.elevated
                  }}
                  onMouseOut={(e) => {
                    if (!row.interventionNeeded) e.currentTarget.style.background = "transparent"
                  }}
                >
                  {/* Red glow border for intervention */}
                  {row.interventionNeeded && (
                    <div style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      border: "1.5px solid rgba(239,68,68,0.3)",
                      borderRadius: 0, animation: "pulse-slow 2s infinite",
                    }} />
                  )}

                  <div style={{ padding: "12px 14px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    {row.studentId}
                    {row.interventionNeeded && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.rose, background: `${C.rose}12`, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                        ⚠️ High Intervention
                      </span>
                    )}
                  </div>

                  <div style={{ padding: "12px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: row.predictedMin < 40 ? C.rose : C.text }}>{row.predictedMin}</span>
                    <span style={{ color: C.steel }}>–</span>
                    <span style={{ color: row.predictedMax < 50 ? C.rose : row.predictedMax >= 75 ? C.emerald : C.text, fontWeight: 600 }}>{row.predictedMax}</span>
                  </div>

                  <div style={{ padding: "12px 14px", display: "flex", alignItems: "center" }}>
                    <ConfidenceBadge score={row.confidenceScore} />
                  </div>

                  <div style={{ padding: "12px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={14} color={row.factors.quizTrend >= 50 ? C.emerald : C.rose} />
                    <span style={{ color: row.factors.quizTrend >= 50 ? C.emerald : C.rose }}>{row.factors.quizTrend}%</span>
                  </div>

                  <div style={{ padding: "12px 14px", fontSize: 13, display: "flex", alignItems: "center" }}>
                    <span style={{ color: row.factors.homeworkRate >= 50 ? C.emerald : C.amber }}>{row.factors.homeworkRate}%</span>
                  </div>

                  <div style={{ padding: "12px 14px", display: "flex", alignItems: "center" }}>
                    <SparklineChart data={row.factors.quizScores} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
