"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, ZAxis, Cell, LabelList,
} from "recharts"
import {
  BarChart3, Users, TrendingUp, Target, Info, Eye, EyeOff,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface PeerPoint {
  studentId: string
  studentName: string
  subjectScore: number
  rank: number
  percentile: number
  percentileLabel: string
}

interface AnonymousPoint {
  score: number
  isYou: boolean
  percentile?: number
}

interface ClassAnalyticsProps {
  classId: string
  subject: string
  chapter?: string
  role: 'teacher' | 'student'
  currentStudentId?: string
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

// Custom tooltip component
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(30, 41, 59, 0.95)",
        backdropFilter: "blur(12px)",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 12,
        color: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.08)",
        lineHeight: 1.6,
      }}
    >
      {data.name !== 'Anonymous' && <div style={{ fontWeight: 600, marginBottom: 2 }}>{data.name}</div>}
      <div style={{ opacity: 0.7 }}>Score: <strong>{data.score}%</strong></div>
      {data.rank && <div style={{ opacity: 0.7 }}>Rank: #{data.rank}/{data.totalStudents}</div>}
      {data.percentile !== undefined && (
        <div style={{ opacity: 0.7 }}>
          Percentile: <strong>{data.percentile}th</strong>
          {data.percentile >= 90 && ' 🏆'}
        </div>
      )}
    </motion.div>
  )
}

export default function ClassAnalytics({
  classId,
  subject,
  chapter,
  role,
  currentStudentId,
}: ClassAnalyticsProps) {
  const [data, setData] = useState<PeerPoint[] | AnonymousPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ averageScore: 0, highestScore: 0, lowestScore: 0, totalStudents: 0 })
  const [topic, setTopic] = useState("")
  const [showNames, setShowNames] = useState(role === 'teacher')
  const [yourInfo, setYourInfo] = useState({ score: 0, rank: 0 } as { score: number; rank: number })

  useEffect(() => {
    loadData()
  }, [classId, subject, chapter, role, currentStudentId])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ classId, subject })
      if (chapter) params.set('chapter', chapter)
      if (role === 'student' && currentStudentId) {
        params.set('anonymous', 'true')
        params.set('studentId', currentStudentId)
      }

      const res = await fetch(`/api/teacher/class-analytics?${params}`)
      if (!res.ok) return

      const result = await res.json()

      if (role === 'student' && result.data) {
        setData(result.data.map((d: AnonymousPoint) => ({
          ...d,
          name: d.isYou ? 'You' : 'Anonymous',
        })))
        setYourInfo({ score: result.yourScore, rank: result.yourRank })
        setTopic(result.topic)
        setStats({
          averageScore: 0,
          highestScore: Math.max(...result.data.map((d: AnonymousPoint) => d.score)),
          lowestScore: Math.min(...result.data.map((d: AnonymousPoint) => d.score)),
          totalStudents: result.totalStudents,
        })
      } else if (result.data) {
        setData(result.data.map((d: PeerPoint) => ({
          ...d,
          name: d.studentName,
          score: d.subjectScore,
        })))
        setTopic(result.topic)
        setStats({
          averageScore: result.averageScore,
          highestScore: result.highestScore,
          lowestScore: result.lowestScore,
          totalStudents: result.totalStudents,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Build scatter data
  const scatterData = data.map((d: any, i: number) => {
    const randomX = i + 1 + (Math.random() - 0.5) * 0.8
    return {
      x: randomX,
      score: d.score ?? d.subjectScore ?? 0,
      name: d.name ?? d.studentName ?? 'Anonymous',
      rank: d.rank,
      percentile: d.percentile,
      totalStudents: stats.totalStudents,
      isYou: d.isYou,
    }
  })

  const isStudentView = role === 'student'

  return (
    <div style={{ ...CARD_STYLES, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={16} color={C.blue} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>
            {topic || `${subject} Performance`}
          </h3>
        </div>
        {role === 'teacher' && (
          <button onClick={() => setShowNames(!showNames)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: C.elevated, border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, color: C.steel, cursor: "pointer" }}>
            {showNames ? <EyeOff size={12} /> : <Eye size={12} />}
            {showNames ? "Hide Names" : "Show Names"}
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, textAlign: "center", padding: "8px 12px", background: C.elevated, borderRadius: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{stats.averageScore || (stats.totalStudents > 0 ? Math.round(scatterData.reduce((s: number, d: any) => s + d.score, 0) / scatterData.length) : 0)}%</div>
          <div style={{ fontSize: 10, color: C.steel }}>Class Avg</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "8px 12px", background: C.elevated, borderRadius: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.emerald }}>{stats.highestScore}%</div>
          <div style={{ fontSize: 10, color: C.steel }}>Highest</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "8px 12px", background: C.elevated, borderRadius: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.rose }}>{stats.lowestScore}%</div>
          <div style={{ fontSize: 10, color: C.steel }}>Lowest</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "8px 12px", background: C.elevated, borderRadius: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{stats.totalStudents}</div>
          <div style={{ fontSize: 10, color: C.steel }}>Students</div>
        </div>
      </div>

      {/* Student view: your rank banner */}
      {isStudentView && yourInfo.rank > 0 && (
        <div style={{ padding: "8px 14px", background: `${C.blue}10`, borderRadius: 10, marginBottom: 12, fontSize: 12, color: C.blue, textAlign: "center", fontWeight: 500 }}>
          Your score: {yourInfo.score}% &middot; You are in the <strong>Top {Math.round((stats.totalStudents - yourInfo.rank) / stats.totalStudents * 100)}%</strong> of your class
        </div>
      )}

      {/* Scatter Chart */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>Loading analytics...</div>
      ) : scatterData.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>
          <Target size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0 }}>No data available for this class/subject.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              hide
              domain={[0, scatterData.length + 1]}
            />
            <YAxis
              type="number"
              dataKey="score"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: C.steel }}
              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: C.steel } }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            {showNames || isStudentView ? (
              <Scatter
                data={scatterData}
                shape={(props: any) => {
                  const { cx, cy, payload } = props
                  const isYou = payload.isYou
                  const size = isYou ? 10 : showNames ? 7 : 5
                  return (
                    <g>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={size}
                        fill={isYou ? C.blue : showNames ? C.blue : C.steel}
                        stroke={isYou ? '#fff' : 'none'}
                        strokeWidth={isYou ? 2 : 0}
                        opacity={isYou ? 1 : showNames ? 0.7 : 0.35}
                      />
                      {isYou && (
                        <text x={cx} y={cy - 14} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.blue}>
                          You
                        </text>
                      )}
                      {showNames && !isYou && (
                        <text x={cx} y={cy - 10} textAnchor="middle" fontSize={8} fill={C.steel}>
                          {payload.name.length > 12 ? payload.name.slice(0, 12) + '…' : payload.name}
                        </text>
                      )}
                    </g>
                  )
                }}
              />
            ) : (
              <Scatter
                data={scatterData.map((d: any) => ({ ...d, name: 'Anonymous' }))}
                fill={C.steel}
                opacity={0.35}
                shape={<circle r={5} />}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div style={{ marginTop: 12, display: "flex", gap: 16, justifyContent: "center", fontSize: 10, color: C.steel }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue }} /> {isStudentView ? 'You' : showNames ? 'Students' : 'All'}
        </span>
        {isStudentView && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.steel, opacity: 0.35 }} /> Peers
          </span>
        )}
        <span style={{ color: C.textDim }}>Hover a dot for details</span>
      </div>
    </div>
  )
}
