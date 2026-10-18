"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Zap, Clock, TrendingUp, Sun, Moon, RefreshCw,
  Send, BarChart3, CheckCircle, Loader2,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface EnergyBucket {
  timeBlock: string
  startHour: number
  endHour: number
  avgScore: number
  totalAttempts: number
  color: string
}

interface EnergyMapData {
  classId: string
  subject: string
  buckets: EnergyBucket[]
  peakBlock: string
  peakScore: number
  lowBlock: string
  lowScore: number
  performanceDiff: number
  diffPercent: number
  morningBetter: boolean
  insight: string
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

export default function EnergyMapPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [classId, setClassId] = useState("9")
  const [subjectId, setSubjectId] = useState("Physics")
  const [data, setData] = useState<EnergyMapData | null>(null)
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requestResult, setRequestResult] = useState("")

  const loadEnergyMap = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/energy-map?classId=${classId}&subject=${subjectId}`)
      if (res.ok) setData(await res.json())
    } finally { setLoading(false) }
  }, [classId, subjectId])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadEnergyMap()
  }, [status])

  const requestTimetableChange = async () => {
    if (!data) return
    setRequesting(true)
    try {
      const res = await fetch("/api/teacher/energy-map/request-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId, subject: subjectId,
          peakBlock: data.peakBlock,
          diffPercent: data.diffPercent,
          morningBetter: data.morningBetter,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        setRequestResult(result.message)
      }
    } finally { setRequesting(false) }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Student Energy Map</h1>
            <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>Chronobiology analysis & timetable optimization</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={classId} onChange={(e) => setClassId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", background: C.panel }}>
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>)}
          </select>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", background: C.panel }}>
            {["Physics", "Chemistry", "Mathematics", "Biology", "English", "Urdu"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={loadEnergyMap} disabled={loading}
            style={{ padding: "8px 14px", background: C.gradient, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Analyze
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>Analyzing chronobiology patterns...</div>}

      {data && !loading && (
        <>
          {/* Insight banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ ...CARD_STYLES, padding: "14px 20px", marginBottom: 20, borderLeft: `3px solid ${data.morningBetter ? C.emerald : C.amber}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: data.morningBetter ? `${C.emerald}14` : `${C.amber}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {data.morningBetter ? <Sun size={16} color={C.emerald} /> : <Moon size={16} color={C.amber} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{data.insight}</div>
              <div style={{ fontSize: 11, color: C.steel, marginTop: 2 }}>
                Peak: {data.peakBlock} ({data.peakScore}% avg) · Low: {data.lowBlock} ({data.lowScore}% avg) · Diff: {data.diffPercent}%
              </div>
            </div>
            {!data.morningBetter && (
              <button onClick={requestTimetableChange} disabled={requesting || !!requestResult}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", opacity: requestResult ? 0.6 : 1 }}>
                {requesting ? <Loader2 size={12} className="spin" /> : <Send size={12} />}
                {requestResult ? "Request Sent" : "Request Timetable Adjustment"}
              </button>
            )}
          </motion.div>

          {requestResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ ...CARD_STYLES, padding: "10px 16px", marginBottom: 16, borderLeft: `3px solid ${C.emerald}`, fontSize: 12, color: C.text, lineHeight: 1.5 }}>
              <CheckCircle size={14} color={C.emerald} style={{ marginRight: 6 }} />
              {requestResult}
            </motion.div>
          )}

          {/* Heatmap Grid */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ ...CARD_STYLES, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <BarChart3 size={16} color={C.blue} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Energy Heatmap — {subjectId}</h3>
              <span style={{ marginLeft: "auto", fontSize: 11, color: C.steel }}>Class {classId}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.buckets.map((bucket, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                    borderRadius: 10, background: bucket.color + "15",
                    borderLeft: `4px solid ${bucket.color}`,
                    opacity: bucket.totalAttempts === 0 ? 0.4 : 1,
                  }}
                >
                  <div style={{ width: 130, fontSize: 12, fontWeight: 500, color: C.text, flexShrink: 0 }}>{bucket.timeBlock}</div>
                  <div style={{ flex: 1, height: 28, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: C.elevated, borderRadius: 6 }} />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bucket.avgScore}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      style={{
                        height: "100%", borderRadius: 6,
                        background: bucket.color,
                        display: "flex", alignItems: "center", justifyContent: "flex-end",
                        paddingRight: 8, minWidth: 30,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                        {bucket.avgScore}%
                      </span>
                    </motion.div>
                  </div>
                  <div style={{ width: 60, textAlign: "right", fontSize: 10, color: C.steel, flexShrink: 0 }}>
                    {bucket.totalAttempts} attempts
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Color gradient legend */}
            <div style={{ marginTop: 16, padding: "10px 14px", background: C.elevated, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: C.steel, marginBottom: 6 }}>Energy Level:</div>
              <div style={{ height: 8, borderRadius: 4, background: "linear-gradient(90deg, rgb(30,50,200), rgb(100,100,100), rgb(220,100,50), rgb(255,180,30))" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.steel, marginTop: 4 }}>
                <span>Low Energy</span>
                <span>Medium</span>
                <span>High Energy</span>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {!data && !loading && (
        <div style={{ textAlign: "center", padding: 80, color: C.steel, fontSize: 14 }}>
          <Zap size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
          <p style={{ margin: 0 }}>Select class & subject, then click "Analyze"</p>
        </div>
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } } .spin { animation: spin 1s linear infinite }`}</style>
    </div>
  )
}
