"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle, Shield, CheckCircle, XCircle, Loader2,
  Brain, TrendingDown, Users, Clock, Sparkles, Search,
  ChevronRight, RefreshCw, BookOpen,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface InterventionCard {
  _id: string
  studentId: string
  studentName?: string
  classId?: string
  riskSignals: { type: string; detail: string; severity: string }[]
  aiRecommendation: string
  status: 'Active' | 'In-Progress' | 'Resolved'
  createdAt: string
  resolvedAt?: string
}

const SIGNAL_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  low_marks: { label: 'Low Marks', icon: <TrendingDown size={12} />, color: C.rose },
  absenteeism: { label: 'Absenteeism', icon: <Users size={12} />, color: C.amber },
  missed_homework: { label: 'Missed HW', icon: <BookOpen size={12} />, color: C.amber },
  behavioral: { label: 'Behavioral', icon: <AlertTriangle size={12} />, color: C.rose },
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

export default function AtRiskPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [interventions, setInterventions] = useState<InterventionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [filter, setFilter] = useState<string>("")
  const [scanResult, setScanResult] = useState<{ found: number; saved: number } | null>(null)

  const loadInterventions = useCallback(async (statusFilter?: string) => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/teacher/intervention?${params}`)
      if (res.ok) setInterventions(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadInterventions(filter)
  }, [status, filter])

  const scanAndSave = async () => {
    setScanning(true)
    setScanResult(null)
    try {
      const res = await fetch("/api/teacher/intervention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan-and-save" }),
      })
      if (res.ok) {
        const data = await res.json()
        setScanResult({ found: data.count, saved: data.interventions.length })
        loadInterventions(filter)
      }
    } finally {
      setScanning(false)
    }
  }

  const updateStatus = async (interventionId: string, newStatus: string) => {
    const res = await fetch("/api/teacher/intervention", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-status", interventionId, status: newStatus }),
    })
    if (res.ok) loadInterventions(filter)
  }

  const counts = {
    all: interventions.length,
    active: interventions.filter((i) => i.status === 'Active').length,
    inProgress: interventions.filter((i) => i.status === 'In-Progress').length,
    resolved: interventions.filter((i) => i.status === 'Resolved').length,
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Intervention Playbook</h1>
            <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>AI-powered at-risk detection & tactical recommendations</p>
          </div>
        </div>
        <button onClick={scanAndSave} disabled={scanning}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.rose, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(239,68,68,0.3)", opacity: scanning ? 0.6 : 1 }}>
          {scanning ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          {scanning ? "Scanning..." : "Scan & Save At-Risk"}
        </button>
      </div>

      {/* Scan result banner */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ ...CARD_STYLES, padding: "12px 20px", marginBottom: 20, borderLeft: `3px solid ${C.rose}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text }}>
              <AlertTriangle size={16} color={C.rose} />
              Scan complete: <strong>{scanResult.found}</strong> at-risk students found, <strong>{scanResult.saved}</strong> interventions saved.
            </div>
            <button onClick={() => setScanResult(null)} style={{ background: "none", border: "none", color: C.steel, cursor: "pointer" }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total", count: counts.all, color: C.blue },
          { label: "Active", count: counts.active, color: C.rose },
          { label: "In-Progress", count: counts.inProgress, color: C.amber },
          { label: "Resolved", count: counts.resolved, color: C.emerald },
        ].map((s) => (
          <div key={s.label} onClick={() => setFilter(s.label === "Total" ? "" : s.label)}
            style={{ flex: 1, ...CARD_STYLES, padding: "12px 16px", cursor: "pointer", borderLeft: `3px solid ${s.color}`, opacity: filter === s.label || (!filter && s.label === "Total") ? 1 : 0.5 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: C.steel }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Intervention Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>Loading interventions...</div>
      ) : interventions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Shield size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
          <p style={{ color: C.steel, fontSize: 14, marginBottom: 16 }}>No interventions yet. Click "Scan & Save At-Risk" to detect students.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
          <AnimatePresence mode="popLayout">
            {interventions.map((item) => {
              const isResolved = item.status === 'Resolved'
              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    ...CARD_STYLES,
                    padding: 20,
                    borderLeft: `3px solid ${isResolved ? C.emerald : item.status === 'In-Progress' ? C.amber : C.rose}`,
                    opacity: isResolved ? 0.7 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Success overlay for resolved */}
                  {isResolved && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", background: "linear-gradient(135deg, rgba(16,185,129,0.05), transparent)" }} />
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{item.studentName || item.studentId}</span>
                        {item.classId && <span style={{ fontSize: 11, color: C.steel }}>Class {item.classId}</span>}
                      </div>
                      <span style={{ fontSize: 10, color: C.textDim }}>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <motion.div
                      animate={{ scale: isResolved ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {isResolved ? (
                        <CheckCircle size={22} color={C.emerald} />
                      ) : (
                        <AlertTriangle size={22} color={C.rose} />
                      )}
                    </motion.div>
                  </div>

                  {/* Risk signals */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {item.riskSignals.map((s, i) => {
                      const cfg = SIGNAL_CONFIG[s.type] || { label: s.type, icon: <AlertTriangle size={12} />, color: C.steel }
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: `${cfg.color}12`, color: cfg.color }}
                        >
                          {cfg.icon} {cfg.label}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Risk details */}
                  {!isResolved && (
                    <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                      {item.riskSignals.map((s, i) => (
                        <div key={i} style={{ fontSize: 11, color: C.textDim, paddingLeft: 8, borderLeft: `2px solid ${C.border}` }}>
                          {s.detail}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Recommendation */}
                  {item.aiRecommendation && (
                    <div style={{ padding: "8px 12px", background: `${C.purple}08`, borderRadius: 8, marginBottom: 12, fontSize: 11, color: C.text, lineHeight: 1.5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, fontWeight: 600, fontSize: 10, color: C.purple }}>
                        <Brain size={12} /> AI Playbook
                      </div>
                      {item.aiRecommendation}
                    </div>
                  )}

                  {/* Resolved timestamp */}
                  {isResolved && item.resolvedAt && (
                    <div style={{ fontSize: 10, color: C.emerald, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle size={10} /> Resolved {new Date(item.resolvedAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {item.status === 'Active' && (
                      <button onClick={() => updateStatus(item._id, 'In-Progress')}
                        style={{ flex: 1, padding: "6px 12px", background: C.amber, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        Start Progress
                      </button>
                    )}
                    {item.status !== 'Resolved' && (
                      <button onClick={() => updateStatus(item._id, 'Resolved')}
                        style={{ flex: 1, padding: "6px 12px", background: C.emerald, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        ✓ Mark Resolved
                      </button>
                    )}
                    {item.status === 'Resolved' && (
                      <div style={{ flex: 1, textAlign: "center", padding: "6px 12px", color: C.emerald, fontSize: 11, fontWeight: 600 }}>
                        ✅ Successfully Resolved
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } } .spin { animation: spin 1s linear infinite }`}</style>
    </div>
  )
}
