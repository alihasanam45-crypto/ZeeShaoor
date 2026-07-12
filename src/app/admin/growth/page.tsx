"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  TrendingUp, Users, CheckCircle, BarChart3, Target, Clock,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface TeacherGrowthRow {
  teacherId: string
  teacherName: string
  pdHoursCompleted: number
  pdHoursTarget: number
  goalCount: number
  completedGoals: number
  goalCompletionPct: number
  academicYear: string
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

export default function AdminGrowthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [data, setData] = useState<TeacherGrowthRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && session?.user.role !== 'admin') router.push("/")
    if (status === "authenticated" && session?.user.role === 'admin') loadData()
  }, [status])

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/growth")
      if (res.ok) setData(await res.json())
    } finally { setLoading(false) }
  }

  const totalPdHours = data.reduce((s, r) => s + r.pdHoursCompleted, 0)
  const avgGoalCompletion = data.length > 0
    ? Math.round(data.reduce((s, r) => s + r.goalCompletionPct, 0) / data.length)
    : 0

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart3 size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Teacher Growth — Admin</h1>
          <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>Aggregated PD data across all teachers (journal entries excluded)</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ ...CARD_STYLES, flex: 1, padding: "14px 18px", borderLeft: `3px solid ${C.blue}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.steel, textTransform: "uppercase" }}>Total Teachers</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>{data.length}</div>
        </div>
        <div style={{ ...CARD_STYLES, flex: 1, padding: "14px 18px", borderLeft: `3px solid ${C.emerald}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.steel, textTransform: "uppercase" }}>Total PD Hours</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>{totalPdHours}</div>
        </div>
        <div style={{ ...CARD_STYLES, flex: 1, padding: "14px 18px", borderLeft: `3px solid ${C.purple}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.steel, textTransform: "uppercase" }}>Avg Goal Completion</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>{avgGoalCompletion}%</div>
        </div>
      </div>

      {/* Data table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>Loading...</div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: C.steel, fontSize: 14 }}>
          <Users size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
          <p style={{ margin: 0 }}>No PD data available yet.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...CARD_STYLES, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.elevated }}>
                <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: C.steel, fontSize: 11, textTransform: "uppercase" }}>Teacher</th>
                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, color: C.steel, fontSize: 11, textTransform: "uppercase" }}>PD Hours</th>
                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, color: C.steel, fontSize: 11, textTransform: "uppercase" }}>Goals</th>
                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, color: C.steel, fontSize: 11, textTransform: "uppercase" }}>Completion</th>
                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, color: C.steel, fontSize: 11, textTransform: "uppercase" }}>Year</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const pct = Math.min(row.pdHoursCompleted / Math.max(row.pdHoursTarget, 1), 1)
                return (
                  <motion.tr
                    key={row.teacherId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <td style={{ padding: "10px 16px", fontWeight: 500, color: C.text }}>{row.teacherName}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                        <span style={{ fontWeight: 700, color: C.text }}>{row.pdHoursCompleted}</span>
                        <span style={{ color: C.textDim }}>/ {row.pdHoursTarget}</span>
                        <div style={{ width: 50, height: 4, background: C.elevated, borderRadius: 2, overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} style={{ height: "100%", background: pct >= 0.8 ? C.emerald : pct >= 0.5 ? C.blue : C.amber, borderRadius: 2 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center", color: C.text }}>
                      {row.completedGoals}/{row.goalCount}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <span style={{
                        padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: row.goalCompletionPct >= 70 ? `${C.emerald}14` : row.goalCompletionPct >= 40 ? `${C.amber}14` : `${C.rose}14`,
                        color: row.goalCompletionPct >= 70 ? C.emerald : row.goalCompletionPct >= 40 ? C.amber : C.rose,
                      }}>
                        {row.goalCompletionPct}%
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center", color: C.steel, fontSize: 12 }}>{row.academicYear}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
