"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText, BookOpen, AlertTriangle, MessageSquare,
  ChevronRight, RefreshCw, Sparkles, Users, Clock,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

interface BriefingData {
  briefing: string
  syllabus: {
    currentChapter: string
    currentPriority: string
    estimatedDaysRemaining: number
    progressPct: number
    completedCount: number
    totalChapters: number
  }
  atRisk: { studentName: string; riskSignals: string; recommendation: string }[]
  leaveNotes: { pinnedNotes: string; todayPlan: string }
}

export default function SubstitutePage() {
  const [classId, setClassId] = useState("9")
  const [subjectId, setSubjectId] = useState("Physics")
  const [data, setData] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadBriefing = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/teacher/substitute/briefing?classId=${classId}&subjectId=${subjectId}`)
      if (!res.ok) { setError('Failed to load briefing'); return }
      const result = await res.json()
      setData(result)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Substitute Teacher Briefing</h1>
            <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>AI-powered 1-page tactical briefing for substitute teachers</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={classId} onChange={(e) => setClassId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", background: C.panel }}>
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>)}
          </select>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", background: C.panel }}>
            {["Physics", "Chemistry", "Mathematics", "Biology", "English", "Urdu"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={loadBriefing} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)", opacity: loading ? 0.6 : 1 }}>
            <Sparkles size={16} /> {loading ? "Loading..." : "Generate Briefing"}
          </button>
        </div>
      </div>

      {error && <div style={{ ...CARD_STYLES, padding: 12, marginBottom: 16, color: C.rose, fontSize: 13, borderLeft: `3px solid ${C.rose}` }}>{error}</div>}

      {!data && !loading && (
        <div style={{ textAlign: "center", padding: 80, color: C.steel, fontSize: 14 }}>
          <FileText size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
          <p style={{ margin: 0 }}>Select class & subject, then click "Generate Briefing"</p>
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: 40, color: C.steel, fontSize: 13 }}>Generating briefing...</div>}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 24 }}>
          {/* Main briefing */}
          <div style={{ flex: 2, ...CARD_STYLES, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} color={C.purple} />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>Tactical Briefing</h2>
              <span style={{ marginLeft: "auto", fontSize: 11, color: C.steel }}>
                {classId}th {subjectId}
              </span>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>
              {data.briefing}
            </div>
          </div>

          {/* Sidebar: raw data */}
          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Syllabus summary */}
            <div style={{ ...CARD_STYLES, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <BookOpen size={14} color={C.blue} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Syllabus Progress</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.steel, marginBottom: 6 }}>
                <span>Current: <strong>{data.syllabus.currentChapter}</strong></span>
                <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: data.syllabus.currentPriority === 'High' ? `${C.blue}12` : data.syllabus.currentPriority === 'Medium' ? `${C.amber}12` : `${C.steel}12`, color: data.syllabus.currentPriority === 'High' ? C.blue : data.syllabus.currentPriority === 'Medium' ? C.amber : C.steel }}>
                  {data.syllabus.currentPriority}
                </span>
              </div>
              <div style={{ height: 4, background: C.elevated, borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${data.syllabus.progressPct}%` }} style={{ height: "100%", borderRadius: 2, background: C.blue }} />
              </div>
              <div style={{ fontSize: 10, color: C.textDim }}>{data.syllabus.completedCount}/{data.syllabus.totalChapters} chapters · ~{data.syllabus.estimatedDaysRemaining} days remaining</div>
            </div>

            {/* At-risk students */}
            {data.atRisk.length > 0 && (
              <div style={{ ...CARD_STYLES, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <AlertTriangle size={14} color={C.rose} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Students Requiring Attention</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {data.atRisk.map((s, i) => (
                    <div key={i} style={{ padding: "8px 10px", background: `${C.rose}06`, borderRadius: 8, borderLeft: `2px solid ${C.rose}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.studentName}</div>
                      <div style={{ fontSize: 10, color: C.steel }}>{s.riskSignals}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher's notes */}
            <div style={{ ...CARD_STYLES, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <MessageSquare size={14} color={C.amber} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Absent Teacher's Notes</span>
              </div>
              <div style={{ fontSize: 12, color: C.text, marginBottom: 8, lineHeight: 1.5 }}>
                <strong>Pinned:</strong> {data.leaveNotes.pinnedNotes}
              </div>
              {data.leaveNotes.todayPlan && (
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, padding: "8px 10px", background: C.elevated, borderRadius: 6 }}>
                  <strong>Today's Plan:</strong> {data.leaveNotes.todayPlan}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
