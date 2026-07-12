"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ThumbsUp, ThumbsDown, BarChart3, Shield, Send,
  X, Lock, CheckCircle, Sparkles, MessageSquare,
  Loader2, HeartHandshake, ChevronRight,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface SurveyData {
  _id: string
  topicTitle: string
  isActive: boolean
  createdAt: string
}

export default function StudentFeedback() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeSurvey, setActiveSurvey] = useState<SurveyData | null>(null)
  const [hasResponded, setHasResponded] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [understood, setUnderstood] = useState<boolean | null>(null)
  const [difficulty, setDifficulty] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showConfidential, setShowConfidential] = useState(false)
  const [confMsg, setConfMsg] = useState("")
  const [confSent, setConfSent] = useState(false)
  const [confLoading, setConfLoading] = useState(false)
  const [loadingSurvey, setLoadingSurvey] = useState(true)

  const classId = (session?.user as any)?.classId || (session?.user as any)?.classId

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!classId) { setLoadingSurvey(false); return }
      try {
        const res = await fetch(`/api/student/pulse?classId=${classId}`)
        const data = await res.json()
        if (data.survey) {
          setActiveSurvey(data.survey)
          setShowSurvey(true)
        }
      } catch (e) {
        // no active survey
      } finally {
        setLoadingSurvey(false)
      }
    }
    fetchSurvey()
  }, [classId])

  const handleSubmitSurvey = async () => {
    if (understood === null || difficulty === null) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/student/pulse/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: activeSurvey!._id,
          understood,
          difficultyRating: difficulty,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setSubmitted(true)
      setTimeout(() => {
        setShowSurvey(false)
        setHasResponded(true)
      }, 2000)
    } catch (e) {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendConfidential = async () => {
    if (!confMsg.trim()) return
    setConfLoading(true)
    try {
      const res = await fetch("/api/student/confidential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText: confMsg }),
      })
      if (!res.ok) throw new Error("Failed")
      setConfSent(true)
      setTimeout(() => {
        setShowConfidential(false)
        setConfSent(false)
        setConfMsg("")
      }, 2500)
    } catch (e) {
      // silent
    } finally {
      setConfLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", gap: "32px",
    }}>
      {/* Pulse Survey Modal */}
      <AnimatePresence>
        {showSurvey && !hasResponded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 50, padding: "20px",
            }}
            onClick={() => { if (!submitting && !submitted) setShowSurvey(false) }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: C.panel, borderRadius: "24px", padding: "40px",
                maxWidth: "480px", width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {!submitted ? (
                <>
                  <button
                    onClick={() => setShowSurvey(false)}
                    style={{
                      position: "absolute", top: 16, right: 16, border: "none",
                      background: C.elevated, borderRadius: "50%", width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: C.steel,
                    }}
                  >
                    <X size={18} />
                  </button>

                  <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: C.gradient, display: "flex", alignItems: "center",
                      justifyContent: "center", margin: "0 auto 16px",
                    }}>
                      <BarChart3 color="white" size={26} />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
                      Quick Pulse Check
                    </h2>
                    <p style={{ color: C.textDim, fontSize: 14, marginTop: 6 }}>
                      {activeSurvey?.topicTitle || "Today's Lesson"}
                    </p>
                  </div>

                  {/* Question 1: Did you understand? */}
                  <div style={{ marginBottom: 28 }}>
                    <p style={{ fontWeight: 600, color: C.text, fontSize: 15, marginBottom: 14 }}>
                      Did you understand today&apos;s lesson?
                    </p>
                    <div style={{ display: "flex", gap: 12 }}>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setUnderstood(true)}
                        style={{
                          flex: 1, padding: "14px 0", borderRadius: 14, border: "2px solid",
                          borderColor: understood === true ? C.emerald : C.border,
                          background: understood === true ? "rgba(16,185,129,0.08)" : C.panel,
                          cursor: "pointer", display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600,
                          color: understood === true ? C.emerald : C.text,
                          transition: "all 0.2s",
                        }}
                      >
                        <ThumbsUp size={20} /> Yes, I got it!
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setUnderstood(false)}
                        style={{
                          flex: 1, padding: "14px 0", borderRadius: 14, border: "2px solid",
                          borderColor: understood === false ? C.rose : C.border,
                          background: understood === false ? "rgba(239,68,68,0.08)" : C.panel,
                          cursor: "pointer", display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600,
                          color: understood === false ? C.rose : C.text,
                          transition: "all 0.2s",
                        }}
                      >
                        <ThumbsDown size={20} /> Not really
                      </motion.button>
                    </div>
                  </div>

                  {/* Question 2: Difficulty Rating */}
                  <div style={{ marginBottom: 28 }}>
                    <p style={{ fontWeight: 600, color: C.text, fontSize: 15, marginBottom: 14 }}>
                      How difficult was today&apos;s lesson?
                    </p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <motion.button
                          key={n}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDifficulty(n)}
                          style={{
                            width: 48, height: 48, borderRadius: 12, border: "2px solid",
                            borderColor: difficulty === n ? C.blue : C.border,
                            background: difficulty === n ? "rgba(37,99,235,0.1)" : C.panel,
                            cursor: "pointer", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 16, fontWeight: 700,
                            color: difficulty === n ? C.blue : C.text,
                            transition: "all 0.2s",
                          }}
                        >
                          {n}
                        </motion.button>
                      ))}
                    </div>
                    <p style={{ textAlign: "center", color: C.textDim, fontSize: 12, marginTop: 8 }}>
                      1 = Very Easy &nbsp;·&nbsp; 5 = Very Hard
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitSurvey}
                    disabled={understood === null || difficulty === null || submitting}
                    style={{
                      width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                      background: understood !== null && difficulty !== null
                        ? C.gradient : C.elevated,
                      color: understood !== null && difficulty !== null ? "white" : C.textDim,
                      fontSize: 16, fontWeight: 600, cursor: understood !== null && difficulty !== null
                        ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s",
                    }}
                  >
                    {submitting ? (
                      <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <>
                        <CheckCircle size={20} /> Submit Feedback
                      </>
                    )}
                  </motion.button>

                  <p style={{
                    textAlign: "center", color: C.textDim, fontSize: 12, marginTop: 12,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <Lock size={12} /> Your response is completely anonymous
                  </p>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: "center", padding: "20px 0" }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    <CheckCircle size={36} color={C.emerald} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
                    Thank You!
                  </h3>
                  <p style={{ color: C.textDim, fontSize: 14, marginTop: 6 }}>
                    Your anonymous feedback helps your teacher improve.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confidential Message Modal */}
      <AnimatePresence>
        {showConfidential && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 50, padding: "20px",
            }}
            onClick={() => { if (!confLoading) setShowConfidential(false) }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: C.panel, borderRadius: "24px", padding: "40px",
                maxWidth: "520px", width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {!confSent ? (
                <>
                  <button
                    onClick={() => setShowConfidential(false)}
                    style={{
                      position: "absolute", top: 16, right: 16, border: "none",
                      background: C.elevated, borderRadius: "50%", width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: C.steel,
                    }}
                  >
                    <X size={18} />
                  </button>

                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 20,
                      background: "linear-gradient(135deg,#7c3aed,#db2777)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 16px",
                    }}>
                      <Shield color="white" size={30} />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
                      Safe Space
                    </h2>
                    <p style={{ color: C.textDim, fontSize: 14, marginTop: 6, maxWidth: 360, margin: "6px auto 0" }}>
                      This message goes directly to the Principal. Your teacher will never see it.
                    </p>
                  </div>

                  <div style={{
                    background: "rgba(124,58,237,0.06)", borderRadius: 14,
                    padding: "16px 20px", marginBottom: 20, display: "flex",
                    alignItems: "center", gap: 12,
                  }}>
                    <Lock size={20} color={C.purple} />
                    <p style={{ margin: 0, fontSize: 13, color: C.steel }}>
                      <strong style={{ color: C.purple }}>100% Confidential.</strong>{" "}
                      Bypasses teacher view. Only the Principal can read this.
                    </p>
                  </div>

                  <textarea
                    value={confMsg}
                    onChange={(e) => setConfMsg(e.target.value)}
                    placeholder="Type your message to the Principal..."
                    rows={5}
                    maxLength={5000}
                    style={{
                      width: "100%", padding: "14px 16px", borderRadius: 14, border: "2px solid",
                      borderColor: confMsg.length > 0 ? C.purple : C.border,
                      background: C.elevated, fontSize: 14, color: C.text,
                      resize: "vertical", outline: "none", fontFamily: "inherit",
                      transition: "border-color 0.2s", boxSizing: "border-box",
                    }}
                  />
                  <p style={{ textAlign: "right", color: C.textDim, fontSize: 12, marginTop: 4 }}>
                    {confMsg.length}/5000
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendConfidential}
                    disabled={!confMsg.trim() || confLoading}
                    style={{
                      width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                      background: confMsg.trim()
                        ? "linear-gradient(135deg,#7c3aed,#db2777)" : C.elevated,
                      color: confMsg.trim() ? "white" : C.textDim,
                      fontSize: 16, fontWeight: 600,
                      cursor: confMsg.trim() ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s",
                    }}
                  >
                    {confLoading ? (
                      <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <>
                        <Send size={18} /> Send Securely
                      </>
                    )}
                  </motion.button>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: "center", padding: "20px 0" }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "rgba(124,58,237,0.12)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    <HeartHandshake size={36} color={C.purple} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
                    Message Delivered
                  </h3>
                  <p style={{ color: C.textDim, fontSize: 14, marginTop: 6 }}>
                    Your confidential message has reached the Principal securely.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard Content */}
      <div style={{ maxWidth: 800, width: "100%", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: C.gradient, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
          }}>
            <BarChart3 color="white" size={30} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0 }}>
            Feedback & Safety
          </h1>
          <p style={{ color: C.textDim, fontSize: 15, marginTop: 8 }}>
            Your voice matters. Share anonymously or speak privately to the Principal.
          </p>
        </motion.div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 40,
        }}>
          {/* Pulse Survey Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{
              background: C.panel, borderRadius: 24, padding: 32,
              border: `1px solid ${C.border}`, textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              if (activeSurvey && !hasResponded) setShowSurvey(true)
            }}
            whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(37,99,235,0.1)", display: "flex",
              alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>
              {hasResponded || !activeSurvey ? (
                <CheckCircle size={26} color={C.emerald} />
              ) : (
                <Sparkles size={26} color={C.blue} />
              )}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>
              Pulse Survey
            </h3>
            <p style={{ color: C.textDim, fontSize: 13, marginTop: 8 }}>
              {loadingSurvey
                ? "Checking..."
                : hasResponded
                  ? "You've completed today's survey"
                  : activeSurvey
                    ? "Tap to share your thoughts on today's lesson"
                    : "No active survey right now"}
            </p>
            {activeSurvey && !hasResponded && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: 12, color: C.blue, fontSize: 13, fontWeight: 600,
              }}>
                Complete now <ChevronRight size={16} />
              </div>
            )}
          </motion.div>

          {/* Safe Space Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              background: "linear-gradient(135deg,rgba(124,58,237,0.06),rgba(219,39,119,0.06))",
              borderRadius: 24, padding: 32,
              border: "2px solid rgba(124,58,237,0.15)", textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => setShowConfidential(true)}
            whileHover={{
              y: -4, boxShadow: "0 12px 40px rgba(124,58,237,0.12)",
              borderColor: "rgba(124,58,237,0.3)",
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(219,39,119,0.12))",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Shield size={26} color={C.purple} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.purple, margin: 0 }}>
              Safe Space
            </h3>
            <p style={{ color: C.steel, fontSize: 13, marginTop: 8 }}>
              Message the Principal confidentially.
              <br />Your teacher won&apos;t know.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 12, background: "linear-gradient(135deg,#7c3aed,#db2777)",
              color: "white", padding: "8px 20px", borderRadius: 100,
              fontSize: 13, fontWeight: 600, border: "none",
            }}>
              <Lock size={14} /> Open Secure Channel
            </div>
          </motion.div>
        </div>
      </div>

      {loadingSurvey && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, color: C.textDim, fontSize: 14,
        }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
          Checking for active surveys...
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
