"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, BookOpen, CheckCircle, XCircle, Sparkles,
  Plus, Trash2, ChevronRight, Loader2,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface RubricItem {
  _id: string
  title: string
  criteria: { criterion: string; maxPoints: number; description?: string }[]
  totalPoints: number
}

interface GradeResult {
  score: number
  totalPoints: number
  percentage: number
  metCriteria: { criterion: string; points: number }[]
  unmetCriteria: { criterion: string; points: number; reason: string }[]
  feedback: string
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

export default function RubricPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [rubrics, setRubrics] = useState<RubricItem[]>([])
  const [selectedRubric, setSelectedRubric] = useState<RubricItem | null>(null)
  const [loading, setLoading] = useState(true)

  // Create rubric modal
  const [showCreate, setShowCreate] = useState(false)
  const [rubricTitle, setRubricTitle] = useState("")
  const [rubricCriteria, setRubricCriteria] = useState([{ criterion: "", maxPoints: 10, description: "" }])

  // Grading
  const [essayText, setEssayText] = useState("")
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)
  const [studentId, setStudentId] = useState("")

  const loadRubrics = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/rubric")
      if (res.ok) setRubrics(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadRubrics()
  }, [status])

  const createRubric = async () => {
    if (!rubricTitle || rubricCriteria.some((c) => !c.criterion)) return
    const res = await fetch("/api/teacher/rubric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: rubricTitle, criteria: rubricCriteria }),
    })
    if (res.ok) {
      setShowCreate(false)
      setRubricTitle("")
      setRubricCriteria([{ criterion: "", maxPoints: 10, description: "" }])
      loadRubrics()
    }
  }

  const deleteRubric = async (id: string) => {
    await fetch("/api/teacher/rubric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", rubricId: id }),
    })
    setRubrics((prev) => prev.filter((r) => r._id !== id))
    if (selectedRubric?._id === id) setSelectedRubric(null)
  }

  const gradeEssay = async () => {
    if (!selectedRubric || !essayText.trim()) return
    setGrading(true)
    setResult(null)
    try {
      const res = await fetch("/api/teacher/rubric/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rubricId: selectedRubric._id,
          studentId: studentId || undefined,
          essayText,
        }),
      })
      if (res.ok) setResult(await res.json())
    } finally {
      setGrading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>AI Writing Rubric Scorer</h1>
            <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>Grade essays against custom rubrics with AI</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
          <Plus size={16} /> New Rubric
        </button>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Left: Rubric Selection */}
        <div style={{ flex: "0 0 280px", ...CARD_STYLES, padding: 12 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: C.text, padding: "0 8px" }}>Your Rubrics</h3>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: C.steel, fontSize: 12 }}>Loading...</div>
          ) : rubrics.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: C.steel, fontSize: 12 }}>No rubrics yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {rubrics.map((r) => (
                <div key={r._id}
                  onClick={() => setSelectedRubric(r)}
                  style={{
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    background: selectedRubric?._id === r._id ? C.blue + "10" : "transparent",
                    borderLeft: selectedRubric?._id === r._id ? `3px solid ${C.blue}` : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{r.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteRubric(r._id) }} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 0 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <span style={{ fontSize: 10, color: C.steel }}>{r.criteria.length} criteria · {r.totalPoints} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center: Essay Input + Grade Button */}
        <div style={{ flex: 1, ...CARD_STYLES, padding: 20, display: "flex", flexDirection: "column" }}>
          {!selectedRubric ? (
            <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>
              <FileText size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ margin: 0 }}>Select a rubric from the left to start grading</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{selectedRubric.title}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: C.steel }}>
                      {selectedRubric.criteria.length} criteria · {selectedRubric.totalPoints} total points
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {selectedRubric.criteria.map((c, i) => (
                    <span key={i} style={{ fontSize: 10, background: C.elevated, color: C.steel, padding: "2px 8px", borderRadius: 4 }}>
                      {c.criterion} ({c.maxPoints}pts)
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 6 }}>Student Essay</label>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Paste the student's essay here..."
                  rows={10}
                  style={{ flex: 1, width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6 }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student ID (optional)"
                    style={{ width: 200, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none" }} />
                  <button onClick={gradeEssay} disabled={grading || !essayText.trim()}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", background: C.gradient, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: grading || !essayText.trim() ? 0.6 : 1, marginLeft: "auto" }}>
                    {grading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                    {grading ? "Grading..." : "Grade with AI"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Results */}
        <div style={{ flex: "0 0 360px", ...CARD_STYLES, padding: 20, alignSelf: "flex-start" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>AI Feedback</h3>

          {!result ? (
            <div style={{ textAlign: "center", padding: 40, color: C.steel, fontSize: 12 }}>
              <Sparkles size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
              <p style={{ margin: 0 }}>Submit an essay to see AI grading results here</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Score */}
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: result.percentage >= 70 ? C.emerald : result.percentage >= 40 ? C.amber : C.rose }}>
                    {result.percentage}%
                  </div>
                  <div style={{ fontSize: 12, color: C.steel }}>{result.score}/{result.totalPoints} points</div>
                </div>

                {/* Criteria checklist */}
                {result.metCriteria.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.emerald, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle size={12} /> Met Criteria
                    </div>
                    {result.metCriteria.map((m, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: `${C.emerald}08`, borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: C.text }}>{m.criterion}</span>
                        <span style={{ fontWeight: 600, color: C.emerald }}>+{m.points}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result.unmetCriteria.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.rose, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <XCircle size={12} /> Unmet Criteria
                    </div>
                    {result.unmetCriteria.map((u, i) => (
                      <div key={i} style={{ padding: "8px 10px", background: `${C.rose}08`, borderRadius: 6, marginBottom: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: C.text }}>{u.criterion}</span>
                          <span style={{ fontWeight: 600, color: C.rose }}>-{u.points}</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.steel, marginTop: 2 }}>{u.reason}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feedback */}
                <div style={{ padding: "10px 14px", background: C.elevated, borderRadius: 10, fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 11, color: C.purple }}>Detailed Feedback</div>
                  {result.feedback}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Create Rubric Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: C.panel, borderRadius: 20, padding: 28, width: 520, maxHeight: "80vh", overflow: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16 }}>New Rubric</h2>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Rubric Title</label>
                <input value={rubricTitle} onChange={(e) => setRubricTitle(e.target.value)} placeholder="e.g. Essay Grading Rubric"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
              </div>

              <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Criteria</label>
              {rubricCriteria.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={c.criterion} onChange={(e) => setRubricCriteria((prev) => prev.map((x, j) => j === i ? { ...x, criterion: e.target.value } : x))} placeholder="Criterion name"
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none" }} />
                  <input type="number" value={c.maxPoints} onChange={(e) => setRubricCriteria((prev) => prev.map((x, j) => j === i ? { ...x, maxPoints: parseInt(e.target.value) || 1 } : x))} min={1} placeholder="Pts"
                    style={{ width: 60, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none" }} />
                  {rubricCriteria.length > 1 && (
                    <button onClick={() => setRubricCriteria((prev) => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.rose, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => setRubricCriteria((prev) => [...prev, { criterion: "", maxPoints: 10, description: "" }])} style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2 }}>
                + Add Criterion
              </button>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "10px", background: C.elevated, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.steel, cursor: "pointer" }}>Cancel</button>
                <button onClick={createRubric} style={{ flex: 1, padding: "10px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } } .spin { animation: spin 1s linear infinite }`}</style>
    </div>
  )
}
