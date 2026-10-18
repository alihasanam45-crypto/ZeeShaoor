"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Clock, Zap, AlertTriangle, CheckCircle,
  ChevronRight, Plus, Sparkles, BarChart3, Calendar,
  Target, TrendingUp, X, Lightbulb,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
  red: "#ef4444", green: "#10b981", blueGantt: "#3b82f6",
}

interface Chapter {
  chapterName: string
  priorityLevel: 'High' | 'Medium' | 'Low'
  estimatedDays: number
  isCompleted: boolean
  completedOnDate?: string
}

interface TimelineData {
  _id: string
  classId: string
  subjectId: string
  chapters: Chapter[]
  examStartDate: string
}

interface PacingData {
  totalChapters: number
  completedChapters: number
  daysElapsed: number
  daysRemaining: number
  velocity: number
  finishRelativeToExam: number
  finishString: string
  onTrack: boolean
  condensationSuggestions: Chapter[]
}

interface CondenseSuggestion {
  chapterName: string
  priorityLevel: string
  estimatedDays: number
  reason: string
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

function GanttBar({
  chapter,
  index,
  total,
  examStartDate,
}: {
  chapter: Chapter
  index: number
  total: number
  examStartDate: string
}) {
  const pct = chapter.estimatedDays
  const color = chapter.isCompleted
    ? C.green
    : chapter.priorityLevel === 'High'
      ? C.blueGantt
      : chapter.priorityLevel === 'Medium'
        ? C.amber
        : C.steel

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 160, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {chapter.isCompleted && <CheckCircle size={12} color={C.green} />}
          <span style={{ fontSize: 12, fontWeight: chapter.isCompleted ? 400 : 500, color: C.text, textDecoration: chapter.isCompleted ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {chapter.chapterName}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, height: 22, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: C.elevated, borderRadius: 4 }} />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct * 6, 100)}%` }}
          transition={{ duration: 0.6, delay: index * 0.03 }}
          style={{
            height: "100%", borderRadius: 4, position: "relative",
            background: chapter.isCompleted ? C.green
              : chapter.priorityLevel === 'High' ? C.blueGantt
              : chapter.priorityLevel === 'Medium' ? C.amber
              : C.steel,
            opacity: chapter.isCompleted ? 0.5 : 0.85,
            minWidth: 12,
          }}
        >
          <div style={{
            position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
            fontSize: 9, color: "#fff", fontWeight: 600, whiteSpace: "nowrap",
          }}>
            {chapter.estimatedDays}d
          </div>
        </motion.div>
      </div>
      <div style={{ width: 70, textAlign: "right", flexShrink: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
          background: chapter.isCompleted ? `${C.green}14` : chapter.priorityLevel === 'High' ? `${C.blueGantt}14` : chapter.priorityLevel === 'Medium' ? `${C.amber}14` : `${C.steel}14`,
          color: chapter.isCompleted ? C.green : chapter.priorityLevel === 'High' ? C.blueGantt : chapter.priorityLevel === 'Medium' ? C.amber : C.steel,
        }}>
          {chapter.priorityLevel}
        </span>
      </div>
    </div>
  )
}

export default function PacingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [classId, setClassId] = useState("9")
  const [subjectId, setSubjectId] = useState("Physics")
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [pacing, setPacing] = useState<PacingData | null>(null)
  const [condenseSuggestions, setCondenseSuggestions] = useState<CondenseSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [setupChapterCount, setSetupChapterCount] = useState(8)
  const [setupLoading, setSetupLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [paceRes, sugRes] = await Promise.all([
        fetch(`/api/teacher/pacing?classId=${classId}&subjectId=${subjectId}`),
        fetch(`/api/teacher/pacing/condense-suggestions?classId=${classId}&subjectId=${subjectId}`),
      ])
      if (paceRes.ok) {
        const paceData = await paceRes.json()
        setTimeline(paceData.timeline)
        setPacing(paceData.pacing)
      }
      if (sugRes.ok) {
        const sugData = await sugRes.json()
        setCondenseSuggestions(sugData.suggestions)
      }
    } finally {
      setLoading(false)
    }
  }, [classId, subjectId])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadData()
  }, [status])

  const markComplete = async (chapterName: string) => {
    const res = await fetch("/api/teacher/pacing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-complete", classId, subjectId, chapterName }),
    })
    if (res.ok) loadData()
  }

  const setupTimeline = async () => {
    setSetupLoading(true)
    const chapters = Array.from({ length: setupChapterCount }, (_, i) => ({
      chapterName: `Chapter ${i + 1}`,
      priorityLevel: (['High', 'Medium', 'Low'] as const)[i % 3],
      estimatedDays: Math.floor(Math.random() * 5) + 2,
    }))

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 90)
    const examStartDate = futureDate.toISOString().split('T')[0]

    // Give some chapters completed status for realistic demo
    const withCompletion = chapters.map((c, i) => ({
      ...c,
      isCompleted: i < Math.floor(chapters.length * 0.3),
    }))

    try {
      const res = await fetch("/api/teacher/pacing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          classId,
          subjectId,
          examStartDate,
          chapters: chapters.map((c) => ({ chapterName: c.chapterName, priorityLevel: c.priorityLevel, estimatedDays: c.estimatedDays })),
        }),
      })
      if (res.ok) {
        setShowSetup(false)
        loadData()
      }
    } finally {
      setSetupLoading(false)
    }
  }

  const velocityColor = pacing?.onTrack ? C.green : C.rose
  const velocityBg = pacing?.onTrack ? `${C.green}10` : `${C.rose}10`

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart3 size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Curriculum Pacing Tracker</h1>
            <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>Velocity math, Gantt timeline & AI condensation</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
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
          <button onClick={() => setShowSetup(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.gradient, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> Setup
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: C.steel, fontSize: 13 }}>Loading pacing data...</div>
      ) : !timeline ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <p style={{ color: C.steel, fontSize: 14, marginBottom: 16 }}>No syllabus timeline configured for this class/subject.</p>
          <button onClick={() => setShowSetup(true)} style={{ padding: "10px 20px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={16} style={{ marginRight: 6 }} /> Create Timeline
          </button>
        </div>
      ) : (
        <>
          {/* Velocity Metrics */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <div style={{ ...CARD_STYLES, flex: 1, padding: "16px 20px", borderLeft: `3px solid ${velocityColor}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.5px" }}>Velocity</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: velocityColor, margin: "4px 0" }}>{pacing?.velocity ?? 0}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>chapters/day</div>
            </div>
            <div style={{ ...CARD_STYLES, flex: 1, padding: "16px 20px", borderLeft: `3px solid ${C.blue}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.5px" }}>Completed</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: "4px 0" }}>{pacing?.completedChapters ?? 0}<span style={{ fontSize: 16, color: C.textDim }}>/{pacing?.totalChapters ?? 0}</span></div>
              <div style={{ fontSize: 11, color: C.textDim }}>chapters</div>
            </div>
            <div style={{ ...CARD_STYLES, flex: 1, padding: "16px 20px", borderLeft: `3px solid ${C.amber}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.5px" }}>Days Elapsed</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: "4px 0" }}>{pacing?.daysElapsed ?? 0}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>{pacing?.daysRemaining ?? 0} days until exams</div>
            </div>
            <div style={{ ...CARD_STYLES, flex: 1.5, padding: "16px 20px", background: velocityBg, borderLeft: `3px solid ${velocityColor}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: velocityColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {pacing?.onTrack ? '✅ ON TRACK' : '⚠️ BEHIND SCHEDULE'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: "6px 0", lineHeight: 1.4 }}>
                {pacing?.finishString ?? 'Calculating...'}
              </div>
              {!pacing?.onTrack && pacing && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.rose, marginTop: 4 }}>
                  <AlertTriangle size={12} />
                  <span>{pacing.condensationSuggestions.length} low-priority chapters can be condensed</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {/* Gantt Timeline */}
            <div style={{ flex: 2, minWidth: 0, ...CARD_STYLES, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Calendar size={16} color={C.blue} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Syllabus Timeline</h3>
                <span style={{ marginLeft: "auto", fontSize: 11, color: C.steel }}>
                  Exam: {new Date(timeline.examStartDate).toLocaleDateString()}
                </span>
              </div>

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 8px", borderBottom: `2px solid ${C.border}`, marginBottom: 4 }}>
                <div style={{ width: 160, fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase" }}>Chapter</div>
                <div style={{ flex: 1, fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase" }}>Timeline (days)</div>
                <div style={{ width: 70, textAlign: "right", fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase" }}>Priority</div>
              </div>

              <div style={{ maxHeight: 400, overflow: "auto" }}>
                {timeline.chapters.map((ch, i) => (
                  <div key={ch.chapterName} style={{ cursor: "pointer" }} onClick={() => !ch.isCompleted && markComplete(ch.chapterName)} title={ch.isCompleted ? "" : "Mark as complete"}>
                    <GanttBar chapter={ch} index={i} total={timeline.chapters.length} examStartDate={timeline.examStartDate} />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center", fontSize: 10, color: C.steel }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.green }} /> Completed</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.blueGantt }} /> High Priority</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.amber }} /> Medium</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.steel }} /> Low</span>
              </div>
            </div>

            {/* Condensation Suggestions */}
            <div style={{ flex: 1, minWidth: 260, ...CARD_STYLES, padding: 20, alignSelf: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Lightbulb size={16} color={C.amber} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                  {pacing?.onTrack ? 'All Good!' : 'Condensation Suggestions'}
                </h3>
              </div>
              {pacing?.onTrack ? (
                <div style={{ textAlign: "center", padding: 30, color: C.emerald, fontSize: 13 }}>
                  <CheckCircle size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>You're on track! No need to condense.</p>
                </div>
              ) : condenseSuggestions.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: C.steel, fontSize: 12 }}>
                  No low-priority chapters available to condense.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 11, color: C.textDim, margin: 0 }}>
                    These low-priority chapters can be condensed to save time:
                  </p>
                  {condenseSuggestions.map((s, i) => (
                    <motion.div
                      key={s.chapterName}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ padding: "10px 14px", background: C.elevated, borderRadius: 10, borderLeft: `3px solid ${C.amber}` }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{s.chapterName}</div>
                      <div style={{ fontSize: 10, color: C.steel, marginBottom: 2 }}>{s.reason}</div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.amber, background: `${C.amber}12`, padding: "1px 6px", borderRadius: 4 }}>
                        Saves ~{s.estimatedDays} days
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={() => setShowSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: C.panel, borderRadius: 20, padding: 28, width: 420 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Setup Syllabus Timeline</h2>
              <p style={{ fontSize: 12, color: C.textDim, margin: "0 0 16px" }}>
                Create a timeline for {classId}th {subjectId}. Chapters will be auto-generated with alternating priorities.
              </p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Number of Chapters</label>
                <input type="number" min={2} max={30} value={setupChapterCount} onChange={(e) => setSetupChapterCount(parseInt(e.target.value) || 8)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowSetup(false)} style={{ flex: 1, padding: "10px", background: C.elevated, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.steel, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={setupTimeline} disabled={setupLoading} style={{ flex: 1, padding: "10px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: setupLoading ? 0.6 : 1 }}>
                  {setupLoading ? "Creating..." : "Create Timeline"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
