'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, AlertTriangle, Send, User, Clock,
  Loader2, RefreshCw, CheckCircle, X, Shield,
  TrendingUp, Users, CalendarDays,
} from 'lucide-react'

const C = {
  bg: '#f8f9fc', panel: '#ffffff', elevated: '#f1f3f8',
  border: 'rgba(15,23,42,0.08)', borderStrong: 'rgba(15,23,42,0.16)',
  steel: '#64748b', blue: '#2563eb', purple: '#7c3aed',
  emerald: '#10b981', amber: '#f59e0b', rose: '#ef4444',
  gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)',
  text: '#1f2937', textDim: 'rgba(31,41,55,0.55)',
}

interface PatternData {
  studentId: string
  studentName?: string
  classId: string
  dayOfWeek: number
  dayName: string
  missedCount: number
  dates: string[]
}

export default function AbsencePatterns() {
  const [patterns, setPatterns] = useState<PatternData[]>([])
  const [loading, setLoading] = useState(false)
  const [classFilter, setClassFilter] = useState('')
  const [error, setError] = useState('')
  const [notifying, setNotifying] = useState<string | null>(null)
  const [notified, setNotified] = useState<Set<string>>(new Set())

  const fetchPatterns = async () => {
    setLoading(true)
    setError('')
    try {
      const url = `/api/teacher/absence-patterns${classFilter ? `?classId=${encodeURIComponent(classFilter)}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to scan')
      const data = await res.json()
      setPatterns(data.patterns || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNotifyParent = async (p: PatternData) => {
    setNotifying(p.studentId)
    try {
      const res = await fetch('/api/teacher/absence-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify-parent',
          studentId: p.studentId,
          pattern: `every ${p.dayName} for ${p.missedCount} consecutive weeks`,
        }),
      })
      if (!res.ok) throw new Error()
      setNotified((prev) => new Set(prev).add(p.studentId))
    } catch (e) {
      // silent
    } finally {
      setNotifying(null)
    }
  }

  const dayColor = (day: string) => {
    const colors: Record<string, string> = {
      Monday: C.blue, Tuesday: C.purple, Wednesday: C.emerald,
      Thursday: C.amber, Friday: C.rose, Saturday: C.steel, Sunday: '#dc2626',
    }
    return colors[day] || C.steel
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, fontFamily: "'Inter',system-ui,sans-serif",
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: C.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar color="white" size={20} />
            </div>
            Absence Pattern Detector
          </h1>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 4, marginLeft: 50 }}>
            Chronological AI scanner — 4-week rolling window, day-of-week clustering
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
        padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'flex-end', gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
            Class Filter (optional)
          </label>
          <input
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            placeholder="e.g. 9A — leave empty for all"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12,
              border: '2px solid', borderColor: C.border,
              background: C.elevated, fontSize: 14, color: C.text,
              outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchPatterns}
          disabled={loading}
          style={{
            padding: '12px 32px', borderRadius: 12, border: 'none',
            background: loading ? C.elevated : C.gradient,
            color: loading ? C.textDim : 'white',
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
          }}
        >
          {loading ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <RefreshCw size={18} />
          )}
          {loading ? 'Scanning...' : 'Scan for Patterns'}
        </motion.button>
      </div>

      {/* Stats */}
      {patterns.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24,
        }}>
          {[
            { label: 'Patterns Detected', value: patterns.length, icon: <AlertTriangle size={18} />, color: C.rose },
            { label: 'Students Affected', value: new Set(patterns.map((p) => p.studentId)).size, icon: <Users size={18} />, color: C.amber },
            { label: 'Unique Days', value: new Set(patterns.map((p) => p.dayName)).size, icon: <CalendarDays size={18} />, color: C.blue },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: C.panel, borderRadius: 16, border: `1px solid ${C.border}`,
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <span style={{ color: C.textDim, fontSize: 13 }}>{stat.label}</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0 }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(239,68,68,0.08)', borderRadius: 12,
              padding: '12px 20px', color: C.rose, fontSize: 14, marginBottom: 20,
              border: `1px solid rgba(239,68,68,0.2)`,
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pattern Cards */}
      {loading ? (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          height: 300, background: C.panel, borderRadius: 20,
        }}>
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid', borderColor: C.elevated,
                borderTopColor: C.blue, margin: '0 auto 16px',
              }}
            />
            <p style={{ color: C.textDim, fontSize: 14 }}>
              Scanning attendance records over 4-week window...
            </p>
          </div>
        </div>
      ) : patterns.length === 0 ? (
        <div style={{
          background: C.panel, borderRadius: 20, padding: 60,
          textAlign: 'center', border: `1px solid ${C.border}`,
        }}>
          <Shield size={48} color={C.textDim} style={{ marginBottom: 16 }} />
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>
            No Patterns Detected
          </h3>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 8 }}>
            Click "Scan for Patterns" to analyze a 4-week rolling window for absence patterns.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {patterns.map((p, idx) => (
            <motion.div
              key={`${p.studentId}-${p.dayOfWeek}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                background: C.panel, borderRadius: 16, border: `1px solid ${C.border}`,
                padding: '20px 24px',
                borderLeft: `4px solid ${dayColor(p.dayName)}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${dayColor(p.dayName)}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: dayColor(p.dayName),
                  }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>
                      {p.studentName || 'Unknown Student'}
                    </h4>
                    <p style={{ fontSize: 13, color: C.textDim, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>Class {p.classId}</span>
                      <span>·</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        color: dayColor(p.dayName), fontWeight: 600,
                      }}>
                        <Clock size={12} />
                        Every {p.dayName}
                      </span>
                      <span>·</span>
                      <span style={{ color: C.rose, fontWeight: 600 }}>
                        {p.missedCount}x missed
                      </span>
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {p.dates.map((d) => (
                        <span key={d} style={{
                          fontSize: 11, color: C.textDim, background: C.elevated,
                          padding: '2px 8px', borderRadius: 100,
                        }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {notified.has(p.studentId) ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      color: C.emerald, fontSize: 13, fontWeight: 600,
                      padding: '8px 16px', background: 'rgba(16,185,129,0.08)',
                      borderRadius: 10,
                    }}>
                      <CheckCircle size={16} /> Notified
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleNotifyParent(p)}
                      disabled={notifying === p.studentId}
                      style={{
                        padding: '8px 18px', borderRadius: 10, border: 'none',
                        background: C.gradient, color: 'white', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      {notifying === p.studentId ? (
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Send size={14} />
                      )}
                      Notify Parent
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
