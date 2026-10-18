"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts"
import {
  Monitor, Play, Square, Users, MessageSquare, BarChart3,
  Plus, Send, Sparkles, Radio, X, Clock, CheckCircle,
  Loader2, ChevronRight, AlertTriangle,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface LiveSessionData {
  _id: string
  teacherId: string
  classId: string
  title: string
  status: "Scheduled" | "Live" | "Ended"
  attendance: { studentId: string; joinTime: string }[]
  aiSummary?: string
  startedAt?: string
  endedAt?: string
}

interface PollData {
  _id: string
  sessionId: string
  question: string
  options: { text: string; votes: number; voterIds?: string[] }[]
  isActive: boolean
  totalVotes: number
}

interface QAMessage {
  id: string
  studentId: string
  question: string
  timestamp: Date
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }
const GLASS = { borderRadius: 16, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }

function StatusPulse({ status }: { status: string }) {
  const isLive = status === "Live"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: 10, height: 10, borderRadius: "50%",
        background: isLive ? C.rose : status === "Ended" ? C.steel : C.amber,
        boxShadow: isLive ? `0 0 8px ${C.rose}66` : "none",
        animation: isLive ? "pulse 1.5s infinite" : "none",
      }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: isLive ? C.rose : C.steel }}>{status}</span>
    </div>
  )
}

function BarChartPoll({ options, totalVotes }: { options: PollData["options"]; totalVotes: number }) {
  const data = options.map((o, i) => ({
    name: o.text.length > 12 ? o.text.slice(0, 12) + "…" : o.text,
    votes: o.votes,
    pct: totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0,
    index: i,
  }))
  const colors = [C.blue, C.purple, C.emerald, C.amber, C.rose, C.steel]

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: C.steel }} width={80} />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
            formatter={(_: any, __: any, props: any) => [`${props.payload.votes} votes (${props.payload.pct}%)`, props.payload.name]}
          />
          <Bar dataKey="votes" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 10, fill: C.steel }}>
            {data.map((_, idx) => (
              <rect key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function LiveClassPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeSession, setActiveSession] = useState<LiveSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [starting, setStarting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [summary, setSummary] = useState("")
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Polls
  const [polls, setPolls] = useState<PollData[]>([])
  const [showPollModal, setShowPollModal] = useState(false)
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [creatingPoll, setCreatingPoll] = useState(false)

  // Q&A
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([])
  const [qaInput, setQaInput] = useState("")
  const qaEndRef = useRef<HTMLDivElement>(null)

  const loadActiveSession = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/live-session")
      if (res.ok) {
        const sessions: LiveSessionData[] = await res.json()
        const live = sessions.find((s) => s.status === "Live")
        const recent = live ?? sessions[0] ?? null
        setActiveSession(recent)
        if (recent) loadPolls(recent._id)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPolls = async (sessionId: string) => {
    const res = await fetch(`/api/teacher/poll?sessionId=${sessionId}`)
    if (res.ok) {
      const data = await res.json()
      setPolls(data)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadActiveSession()
  }, [status])

  // Auto-poll active polls
  useEffect(() => {
    if (!activeSession || activeSession.status !== "Live") return
    const interval = setInterval(() => {
      loadPolls(activeSession._id)
    }, 5000)
    return () => clearInterval(interval)
  }, [activeSession])

  // Auto-scroll Q&A
  useEffect(() => { qaEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [qaMessages])

  const createSession = async () => {
    if (!newSessionTitle) return
    setCreating(true)
    try {
      const res = await fetch("/api/teacher/live-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", classId: "9", title: newSessionTitle }),
      })
      if (res.ok) {
        const s = await res.json()
        setActiveSession(s)
        setShowNewSession(false)
        setNewSessionTitle("")
      }
    } finally {
      setCreating(false)
    }
  }

  const startSession = async () => {
    if (!activeSession) return
    setStarting(true)
    try {
      const res = await fetch("/api/teacher/live-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", sessionId: activeSession._id }),
      })
      if (res.ok) {
        const s = await res.json()
        setActiveSession(s)
      }
    } finally {
      setStarting(false)
    }
  }

  const endSession = async () => {
    if (!activeSession) return
    setEnding(true)
    try {
      const res = await fetch("/api/teacher/live-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", sessionId: activeSession._id }),
      })
      if (res.ok) {
        const s = await res.json()
        setActiveSession(s)
      }
      // Generate summary
      setSummaryLoading(true)
      try {
        const summaryRes = await fetch("/api/teacher/live-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate-summary", sessionId: activeSession._id }),
        })
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json()
          setSummary(summaryData.summary)
          setActiveSession((prev) => prev ? { ...prev, aiSummary: summaryData.summary, status: "Ended" } : prev)
        }
      } finally {
        setSummaryLoading(false)
      }
    } finally {
      setEnding(false)
    }
  }

  const createPoll = async () => {
    if (!pollQuestion || pollOptions.filter((o) => o.trim()).length < 2 || !activeSession) return
    setCreatingPoll(true)
    try {
      const res = await fetch("/api/teacher/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          sessionId: activeSession._id,
          question: pollQuestion,
          options: pollOptions.filter((o) => o.trim()).map((text) => ({ text })),
        }),
      })
      if (res.ok) {
        await loadPolls(activeSession._id)
        setShowPollModal(false)
        setPollQuestion("")
        setPollOptions(["", ""])
      }
    } finally {
      setCreatingPoll(false)
    }
  }

  const endPollAction = async (pollId: string) => {
    const res = await fetch("/api/teacher/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end", pollId }),
    })
    if (res.ok && activeSession) loadPolls(activeSession._id)
  }

  const addQAMessage = () => {
    if (!qaInput.trim() || !activeSession) return
    setQaMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), studentId: session?.user?.id || "teacher", question: qaInput, timestamp: new Date() },
    ])
    setQaInput("")
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Radio size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Live Class Mode</h1>
            {activeSession && <StatusPulse status={activeSession.status} />}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!activeSession && (
            <button onClick={() => setShowNewSession(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
              <Plus size={16} /> New Session
            </button>
          )}
          {activeSession?.status === "Scheduled" && (
            <button onClick={startSession} disabled={starting} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.emerald, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: starting ? 0.6 : 1 }}>
              <Play size={16} /> {starting ? "Starting..." : "Go Live"}
            </button>
          )}
          {activeSession?.status === "Live" && (
            <>
              <button onClick={() => setShowPollModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.purple, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <BarChart3 size={16} /> Launch Poll
              </button>
              <button onClick={endSession} disabled={ending} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.rose, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: ending ? 0.6 : 1 }}>
                <Square size={16} /> {ending ? "Ending..." : "End Class"}
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: C.steel }}>Loading...</div>
      ) : !activeSession ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Monitor size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <p style={{ color: C.steel, fontSize: 14 }}>No sessions yet. Create your first live class!</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 24 }}>
          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Session Info */}
            <div style={{ ...CARD_STYLES, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>{activeSession.title}</h2>
                  {activeSession.startedAt && (
                    <p style={{ fontSize: 11, color: C.steel, margin: "4px 0 0" }}>
                      Started: {new Date(activeSession.startedAt).toLocaleTimeString()}
                      {activeSession.endedAt && ` | Ended: ${new Date(activeSession.endedAt).toLocaleTimeString()}`}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Users size={14} color={C.steel} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{activeSession.attendance.length}</span>
                </div>
              </div>
            </div>

            {/* Polls Section */}
            {polls.length > 0 && (
              <div style={{ ...CARD_STYLES, padding: 20 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12 }}>Live Polls</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {polls.map((poll) => (
                    <motion.div key={poll._id} layout style={{ ...CARD_STYLES, background: C.elevated, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{poll.question}</span>
                          <span style={{ marginLeft: 8, fontSize: 11, color: C.steel }}>{poll.totalVotes} votes</span>
                        </div>
                        {poll.isActive && (
                          <button onClick={() => endPollAction(poll._id)} style={{ padding: "4px 10px", background: `${C.rose}12`, color: C.rose, border: "none", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                            End Poll
                          </button>
                        )}
                      </div>
                      <BarChartPoll options={poll.options} totalVotes={poll.totalVotes} />
                      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8, fontSize: 11, color: C.steel }}>
                        {poll.options.map((opt, i) => (
                          <span key={i}>{opt.text}: {poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0}% ({opt.votes})</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {(summary || activeSession.aiSummary) && (
              <div style={{ ...CARD_STYLES, padding: 20, borderLeft: `3px solid ${C.purple}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Sparkles size={16} color={C.purple} />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>AI Post-Session Summary</h3>
                </div>
                <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                  {summary || activeSession.aiSummary}
                </p>
              </div>
            )}

            {summaryLoading && (
              <div style={{ textAlign: "center", padding: 20, color: C.steel, fontSize: 13 }}>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
                Generating AI summary...
              </div>
            )}
          </div>

          {/* Right Panel - Q&A */}
          <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Q&A Stream */}
            <div style={{ ...GLASS, flex: 1, display: "flex", flexDirection: "column", maxHeight: "60vh" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={14} color={C.blue} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Live Q&A</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: C.steel }}>{qaMessages.length} questions</span>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {qaMessages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: C.textDim, fontSize: 12 }}>
                    No questions yet. Students' questions will appear here.
                  </div>
                ) : (
                  qaMessages.map((qa) => (
                    <div key={qa.id} style={{ padding: "8px 12px", background: C.elevated, borderRadius: 10, fontSize: 12, color: C.text }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 10, color: C.blue }}>{qa.studentId}</span>
                        <span style={{ fontSize: 9, color: C.textDim }}>{qa.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p style={{ margin: 0 }}>{qa.question}</p>
                    </div>
                  ))
                )}
                <div ref={qaEndRef} />
              </div>
              {activeSession?.status === "Live" && (
                <div style={{ padding: "8px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
                  <input
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addQAMessage()}
                    placeholder="Type a reply or simulate student question..."
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none" }}
                  />
                  <button onClick={addQAMessage} style={{ padding: "8px 10px", background: C.gradient, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                    <Send size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Attendance */}
            <div style={{ ...GLASS, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Users size={14} color={C.emerald} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Attendance Log</span>
              </div>
              {activeSession.attendance.length === 0 ? (
                <p style={{ fontSize: 11, color: C.textDim, margin: 0 }}>No attendance records yet.</p>
              ) : (
                <div style={{ maxHeight: 150, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                  {activeSession.attendance.map((a, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.steel, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span>{a.studentId}</span>
                      <span>{new Date(a.joinTime).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      <AnimatePresence>
        {showNewSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={() => setShowNewSession(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: C.panel, borderRadius: 20, padding: 28, width: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16 }}>New Live Session</h2>
              <input value={newSessionTitle} onChange={(e) => setNewSessionTitle(e.target.value)} placeholder="Session title (e.g. Physics Ch 9)"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none", marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowNewSession(false)} style={{ flex: 1, padding: "10px", background: C.elevated, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.steel, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={createSession} disabled={creating || !newSessionTitle} style={{ flex: 1, padding: "10px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: creating ? 0.6 : 1 }}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Poll Modal */}
      <AnimatePresence>
        {showPollModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={() => setShowPollModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: C.panel, borderRadius: 20, padding: 28, width: 480 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16 }}>Launch Poll</h2>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Question</label>
                <input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="e.g. What is the capital of France?"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Options</label>
                {pollOptions.map((opt, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input value={opt} onChange={(e) => setPollOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
                      placeholder={`Option ${i + 1}`}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none" }} />
                    {pollOptions.length > 2 && (
                      <button onClick={() => setPollOptions((prev) => prev.filter((_, j) => j !== i))}
                        style={{ background: "none", border: "none", color: C.rose, cursor: "pointer", padding: 4 }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPollOptions((prev) => [...prev, ""])} style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4 }}>
                  + Add Option
                </button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowPollModal(false)} style={{ flex: 1, padding: "10px", background: C.elevated, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.steel, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={createPoll} disabled={creatingPoll || !pollQuestion || pollOptions.filter((o) => o.trim()).length < 2}
                  style={{ flex: 1, padding: "10px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: creatingPoll ? 0.6 : 1 }}>
                  {creatingPoll ? "Launching..." : "Launch Poll"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      `}</style>
    </div>
  )
}
