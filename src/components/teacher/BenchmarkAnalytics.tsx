"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts"
import { BarChart3, TrendingUp, Target } from "lucide-react"

const C = {
  panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface BenchmarkTopic {
  topic: string
  classAvg: number
  schoolAvg: number
}

interface BenchmarkData {
  classId: string
  subject: string
  classAverage: number
  schoolAverage: number
  difference: number
  aboveAverage: boolean
  insight: string
  topicBreakdown: BenchmarkTopic[]
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

interface Props {
  classId: string
  subject: string
}

export default function BenchmarkAnalytics({ classId, subject }: Props) {
  const [data, setData] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [classId, subject])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/benchmark?classId=${classId}&subject=${subject}`)
      if (res.ok) setData(await res.json())
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Insight card */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ ...CARD_STYLES, padding: "14px 20px", borderLeft: `3px solid ${data.aboveAverage ? C.emerald : C.amber}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: data.aboveAverage ? `${C.emerald}14` : `${C.amber}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={18} color={data.aboveAverage ? C.emerald : C.amber} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{data.insight}</div>
            <div style={{ fontSize: 11, color: C.steel, marginTop: 2 }}>
              Your class: {data.classAverage}% · School: {data.schoolAverage}% · Difference: {data.difference > 0 ? '+' : ''}{data.difference}%
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: C.steel, fontSize: 13 }}>Loading benchmark...</div>
      ) : data && data.topicBreakdown.length > 0 ? (
        <div style={{ display: "flex", gap: 16 }}>
          {/* Radar Chart */}
          <div style={{ flex: 1, ...CARD_STYLES, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Target size={16} color={C.blue} />
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Topic Strength Comparison</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data.topicBreakdown} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: C.steel }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: C.steel }} />
                <Radar name="Your Class" dataKey="classAvg" stroke={C.blue} fill={C.blue} fillOpacity={0.15} strokeWidth={2} />
                <Radar name="School Avg" dataKey="schoolAvg" stroke={C.steel} fill={C.steel} fillOpacity={0.08} strokeWidth={2} strokeDasharray="4 4" />
                <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart comparison */}
          <div style={{ flex: 1, ...CARD_STYLES, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <BarChart3 size={16} color={C.purple} />
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Per-Topic Breakdown</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topicBreakdown} margin={{ left: -10, right: 10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="topic" tick={{ fontSize: 9, fill: C.steel }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: C.steel }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} />
                <Bar dataKey="classAvg" name="Your Class" radius={[4, 4, 0, 0]}>
                  {data.topicBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.classAvg >= entry.schoolAvg ? C.emerald : C.amber} fillOpacity={0.7} />
                  ))}
                </Bar>
                <Bar dataKey="schoolAvg" name="School Avg" radius={[4, 4, 0, 0]} fill={C.steel} fillOpacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : data ? (
        <div style={{ textAlign: "center", padding: 40, color: C.steel, fontSize: 12 }}>
          No topic breakdown data available.
        </div>
      ) : null}
    </div>
  )
}
