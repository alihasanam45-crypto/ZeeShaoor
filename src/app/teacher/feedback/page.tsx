"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3, Activity, AlertTriangle, CheckCircle, X,
  Plus, Loader2, Zap, Brain, Users, Clock, Target,
  TrendingUp, ArrowUp, ArrowDown, BookOpen,
} from "lucide-react"
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
  red: "#ef4444", green: "#10b981", orange: "#f59e0b",
}

const GAUGE_COLORS = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#10b981"]

interface SurveyResult {
  surveyId: string
  topicTitle: string
  isActive: boolean
  total: number
  understoodYes: number
  understoodNo: number
  pctYes: number
  pctNo: number
  avgDifficulty: number
  difficultyDistribution: { rating: number; count: number }[]
  needsIntervention: boolean
}

interface SurveyListItem {
  _id: string
  topicTitle: string
  isActive: boolean
  createdAt: string
  responseCount: number
  yesCount: number
  noCount: number
  pctYes: number
}

export default function TeacherFeedback() {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([])
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null)
  const [result, setResult] = useState<SurveyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [resultLoading, setResultLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createClassId, setCreateClassId] = useState("")
  const [createTopic, setCreateTopic] = useState("")
  const [creating, setCreating] = useState(false)
  const [blinkAlert, setBlinkAlert] = useState(false)
  const [prevPctNo, setPrevPctNo] = useState(0)

  const fetchSurveys = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/pulse")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSurveys(data.surveys)
      if (data.surveys.length > 0 && !selectedSurveyId) {
        setSelectedSurveyId(data.surveys[0]._id)
      }
    } catch (e) {
      // silent
    } finally {
      setLoading(false)
    }
  }, [selectedSurveyId])

  const fetchResults = useCallback(async () => {
    if (!selectedSurveyId) return
    setResultLoading(true)
    try {
      const res = await fetch(`/api/teacher/pulse/results?surveyId=${selectedSurveyId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data)
      // Trigger intervention flash if needed
      if (data.pctNo > 60) {
        setBlinkAlert(true)
        setTimeout(() => setBlinkAlert(false), 5000)
      }
    } catch (e) {
      // silent
    } finally {
      setResultLoading(false)
    }
  }, [selectedSurveyId])

  // Initial fetch
  useEffect(() => { fetchSurveys() }, [])
  // Fetch results when survey changes
  useEffect(() => { fetchResults() }, [selectedSurveyId])

  // Real-time polling every 30 seconds
  useEffect(() => {
    if (!selectedSurveyId) return
    const interval = setInterval(fetchResults, 30000)
    return () => clearInterval(interval)
  }, [selectedSurveyId, fetchResults])

  const handleCreateSurvey = async () => {
    if (!createClassId.trim() || !createTopic.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/teacher/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: createClassId, topicTitle: createTopic }),
      })
      if (!res.ok) throw new Error()
      setShowCreateModal(false)
      setCreateClassId("")
      setCreateTopic("")
      await fetchSurveys()
    } catch (e) {
      // silent
    } finally {
      setCreating(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await fetch(`/api/teacher/pulse/${id}`, { method: "PATCH" })
      await fetchSurveys()
    } catch (e) { /* silent */ }
  }

  const gaugeValue = result?.pctYes ?? 0
  const gaugeAngle = (gaugeValue / 100) * 180

  const difficultyData = result?.difficultyDistribution ?? []

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif",
      padding: "24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: C.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BarChart3 color="white" size={20} />
            </div>
            Rapid Feedback Engine
          </h1>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 4, marginLeft: 50 }}>
            Real-time pulse check — results update every 30s
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: "12px 24px", borderRadius: 12, border: "none",
            background: C.gradient, color: "white", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          }}
        >
          <Plus size={18} /> New Pulse Survey
        </motion.button>
      </div>

      {/* CRITICAL INTERVENTION BLINKER */}
      <AnimatePresence>
        {blinkAlert && result && result.pctNo > 60 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{
              opacity: [0, 1, 0.8, 1],
              scale: 1,
              transition: { opacity: { repeat: Infinity, duration: 0.8, repeatType: "reverse" } },
            }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: "linear-gradient(135deg,#ef4444,#dc2626)", borderRadius: 16,
              padding: "20px 28px", marginBottom: 24, display: "flex",
              alignItems: "center", justifyContent: "space-between",
              boxShadow: "0 8px 32px rgba(239,68,68,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <AlertTriangle size={28} color="white" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))" }} />
              <div>
                <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Critical Learning Gap Detected
                </h3>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, margin: "4px 0 0" }}>
                  {result.pctNo}% of students did not understand "{result.topicTitle}" — Immediate re-teaching recommended.
                </p>
              </div>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.2)", borderRadius: 100, padding: "8px 20px",
              fontSize: 14, fontWeight: 700, color: "white", whiteSpace: "nowrap",
            }}>
              {result.total} responses
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        {/* LEFT: Survey List */}
        <div style={{
          background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
          padding: 20, height: "fit-content", maxHeight: "calc(100vh - 160px)", overflowY: "auto",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={16} /> Active Surveys
          </h3>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: C.steel }} />
            </div>
          ) : surveys.length === 0 ? (
            <p style={{ color: C.textDim, fontSize: 13, textAlign: "center", padding: 20 }}>
              No surveys yet. Create one to get started.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {surveys.map((s) => (
                <motion.div
                  key={s._id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedSurveyId(s._id)}
                  style={{
                    padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                    border: "2px solid",
                    borderColor: selectedSurveyId === s._id ? C.blue : "transparent",
                    background: selectedSurveyId === s._id ? "rgba(37,99,235,0.06)" : C.elevated,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>
                        {s.topicTitle}
                      </p>
                      <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0" }}>
                        {s.responseCount} responses · {s.pctYes}% yes
                      </p>
                    </div>
                    {s.isActive && (
                      <span style={{
                        background: "rgba(16,185,129,0.12)", color: C.emerald,
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 100,
                      }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  {s.isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeactivate(s._id) }}
                      style={{
                        marginTop: 10, border: "none", background: "rgba(239,68,68,0.08)",
                        color: C.rose, fontSize: 11, fontWeight: 600, padding: "4px 12px",
                        borderRadius: 100, cursor: "pointer",
                      }}
                    >
                      End Survey
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Live Results */}
        <div>
          {resultLoading && !result ? (
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              height: 400, background: C.panel, borderRadius: 20,
            }}>
              <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: C.steel }} />
            </div>
          ) : result ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { label: "Total Responses", value: result.total, icon: <Users size={18} />, color: C.blue },
                  { label: "Understood", value: `${result.pctYes}%`, icon: <CheckCircle size={18} />, color: C.emerald },
                  { label: "Did Not Understand", value: `${result.pctNo}%`, icon: <X size={18} />, color: result.pctNo > 60 ? C.rose : C.amber },
                  { label: "Avg Difficulty", value: result.avgDifficulty.toFixed(1), icon: <Brain size={18} />, color: C.purple },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: C.panel, borderRadius: 16, border: `1px solid ${C.border}`,
                      padding: "18px 20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                      <span style={{ color: C.textDim, fontSize: 13 }}>{stat.label}</span>
                    </div>
                    <p style={{
                      fontSize: 28, fontWeight: 800, color: C.text, margin: 0,
                      display: "flex", alignItems: "baseline", gap: 4,
                    }}>
                      {stat.value}
                      {stat.label === "Total Responses" && (
                        <span style={{ fontSize: 14, fontWeight: 400, color: C.textDim }}>students</span>
                      )}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Understanding Gauge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
                    padding: 24,
                  }}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Target size={16} /> Understanding Gauge
                  </h3>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: 220, height: 140, overflow: "hidden" }}>
                      {/* Gauge background */}
                      <div style={{
                        width: 220, height: 110, borderRadius: "110px 110px 0 0",
                        border: "12px solid #e5e7eb", borderBottom: "none",
                        boxSizing: "border-box", position: "absolute", bottom: 0,
                      }} />
                      {/* Gauge fill */}
                      <div style={{
                        width: 220, height: 110, borderRadius: "110px 110px 0 0",
                        border: "12px solid", borderBottom: "none",
                        borderColor: gaugeValue >= 80 ? C.emerald : gaugeValue >= 60 ? C.blue : gaugeValue >= 40 ? C.amber : C.rose,
                        boxSizing: "border-box", position: "absolute", bottom: 0,
                        clipPath: `polygon(0 0, ${gaugeValue}% 0, ${gaugeValue}% 100%, 0 100%)`,
                        transition: "clip-path 0.8s ease, border-color 0.8s ease",
                      }} />
                      {/* Needle */}
                      <div style={{
                        position: "absolute", bottom: 0, left: "50%", width: 2, height: 90,
                        background: C.text, borderRadius: 2, transformOrigin: "bottom center",
                        transform: `translateX(-50%) rotate(${gaugeAngle - 90}deg)`,
                        transition: "transform 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", background: C.text,
                          position: "absolute", bottom: -4, left: -3,
                        }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <p style={{
                      fontSize: 36, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1,
                    }}>
                      {gaugeValue}%
                    </p>
                    <p style={{ color: C.textDim, fontSize: 13, margin: "4px 0 0" }}>
                      of students understood
                    </p>
                  </div>
                </motion.div>

                {/* Difficulty Distribution */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
                    padding: 24,
                  }}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                    <BarChart3 size={16} /> Difficulty Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={difficultyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                      <XAxis
                        dataKey="rating"
                        tick={{ fontSize: 12, fill: C.steel }}
                        axisLine={{ stroke: C.border }}
                        tickLine={false}
                        label={{ value: 'Rating (1=Easy → 5=Hard)', position: 'bottom', fontSize: 11, fill: C.textDim, offset: -2 }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: C.steel }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: C.panel, border: `1px solid ${C.borderStrong}`,
                          borderRadius: 12, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        }}
                        formatter={(value) => [Number(value), 'Responses']}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {difficultyData.map((entry, index) => (
                          <Cell key={entry.rating} fill={GAUGE_COLORS[index] || C.blue} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Topic Title */}
              <div style={{
                background: C.panel, borderRadius: 16, border: `1px solid ${C.border}`,
                padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <BookOpen size={18} color={C.steel} />
                  <span style={{ color: C.text, fontSize: 14 }}>
                    Topic: <strong>{result.topicTitle}</strong>
                  </span>
                </div>
                {result.isActive ? (
                  <span style={{
                    background: "rgba(16,185,129,0.12)", color: C.emerald,
                    padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.emerald }} />
                    Collecting responses...
                  </span>
                ) : (
                  <span style={{
                    background: C.elevated, color: C.steel,
                    padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                  }}>
                    Closed
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              background: C.panel, borderRadius: 20, padding: 60,
              textAlign: "center", border: `1px solid ${C.border}`,
            }}>
              <BarChart3 size={40} color={C.textDim} style={{ marginBottom: 16 }} />
              <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>
                Select a Survey
              </h3>
              <p style={{ color: C.textDim, fontSize: 14, marginTop: 8 }}>
                Choose a survey from the left panel to view live results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Survey Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 50, padding: "20px",
            }}
            onClick={() => { if (!creating) setShowCreateModal(false) }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: C.panel, borderRadius: 24, padding: 40,
                maxWidth: 440, width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  position: "absolute", top: 16, right: 16, border: "none",
                  background: C.elevated, borderRadius: "50%", width: 36,
                  height: 36, display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", color: C.steel,
                }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: C.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <Plus color="white" size={26} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
                  Launch Pulse Survey
                </h2>
                <p style={{ color: C.textDim, fontSize: 14, marginTop: 6 }}>
                  Students will see this as a 2-question modal.
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: "block" }}>
                  Class ID
                </label>
                <input
                  value={createClassId}
                  onChange={(e) => setCreateClassId(e.target.value)}
                  placeholder="e.g. 9A"
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid",
                    borderColor: createClassId ? C.blue : C.border,
                    background: C.elevated, fontSize: 14, color: C.text, outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: "block" }}>
                  Topic / Lesson Title
                </label>
                <input
                  value={createTopic}
                  onChange={(e) => setCreateTopic(e.target.value)}
                  placeholder="e.g. Chapter 5: Quadratic Equations"
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid",
                    borderColor: createTopic ? C.blue : C.border,
                    background: C.elevated, fontSize: 14, color: C.text, outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateSurvey}
                disabled={!createClassId.trim() || !createTopic.trim() || creating}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                  background: createClassId.trim() && createTopic.trim()
                    ? C.gradient : C.elevated,
                  color: createClassId.trim() && createTopic.trim() ? "white" : C.textDim,
                  fontSize: 16, fontWeight: 600,
                  cursor: createClassId.trim() && createTopic.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {creating ? (
                  <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <>
                    <Zap size={18} /> Launch Survey
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px }
      `}</style>
    </div>
  )
}


