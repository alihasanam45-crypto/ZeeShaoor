'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, AlertTriangle, Clock, Moon, Users,
  Loader2, Shield, RefreshCw, TrendingUp,
  Sun, CheckCircle, Activity,
} from 'lucide-react'

const C = {
  bg: '#f8f9fc', panel: '#ffffff', elevated: '#f1f3f8',
  border: 'rgba(15,23,42,0.08)', borderStrong: 'rgba(15,23,42,0.16)',
  steel: '#64748b', blue: '#2563eb', purple: '#7c3aed',
  emerald: '#10b981', amber: '#f59e0b', rose: '#ef4444',
  gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)',
  text: '#1f2937', textDim: 'rgba(31,41,55,0.55)',
}

interface WellbeingReport {
  teacherId: string
  teacherName: string
  totalHours: number
  totalSessions: number
  lateNightCount: number
  lateNightDates: string[]
  riskLevel: 'safe' | 'watch' | 'critical'
  alerts: string[]
}

export default function AdminTeacherWellbeing() {
  const [reports, setReports] = useState<WellbeingReport[]>([])
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState('')
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null)

  const handleScan = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/teacher-wellbeing')
      if (!res.ok) {
        if (res.status === 403) throw new Error('Admin access required')
        throw new Error('Scan failed')
      }
      const data = await res.json()
      setReports(data.reports || [])
      setScanned(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const riskColor = (level: string) => {
    switch (level) {
      case 'critical': return C.rose
      case 'watch': return C.amber
      default: return C.emerald
    }
  }

  const riskBg = (level: string) => {
    switch (level) {
      case 'critical': return 'rgba(239,68,68,0.08)'
      case 'watch': return 'rgba(245,158,11,0.08)'
      default: return 'rgba(16,185,129,0.08)'
    }
  }

  const riskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle size={16} />
      case 'watch': return <Clock size={16} />
      default: return <CheckCircle size={16} />
    }
  }

  const totalCritical = reports.filter((r) => r.riskLevel === 'critical').length
  const totalWatch = reports.filter((r) => r.riskLevel === 'watch').length
  const totalSafe = reports.filter((r) => r.riskLevel === 'safe').length

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
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg,#7c3aed,#db2777)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart color="white" size={20} />
            </div>
            Teacher Wellbeing Monitor
          </h1>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 4, marginLeft: 50 }}>
            <Shield size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Admin-only — burnout detection over 3-week rolling window
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleScan}
          disabled={loading}
          style={{
            padding: '12px 28px', borderRadius: 12, border: 'none',
            background: loading ? C.elevated : 'linear-gradient(135deg,#7c3aed,#db2777)',
            color: loading ? C.textDim : 'white', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {loading ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <RefreshCw size={18} />
          )}
          {loading ? 'Scanning...' : scanned ? 'Re-scan' : 'Scan Wellbeing'}
        </motion.button>
      </div>

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
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          height: 400, background: C.panel, borderRadius: 20,
        }}>
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid', borderColor: C.elevated,
                borderTopColor: C.purple, margin: '0 auto 16px',
              }}
            />
            <p style={{ color: C.textDim, fontSize: 14 }}>
              Scanning teacher activity over 3-week rolling window...
            </p>
          </div>
        </div>
      ) : !scanned ? (
        <div style={{
          background: C.panel, borderRadius: 20, padding: 60,
          textAlign: 'center', border: `1px solid ${C.border}`,
        }}>
          <Heart size={48} color={C.textDim} style={{ marginBottom: 16 }} />
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>
            No Scan Data
          </h3>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 8 }}>
            Click "Scan Wellbeing" to analyze the 3-week rolling window for burnout detection.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Teachers', value: reports.length, icon: <Users size={18} />, color: C.blue },
              { label: 'Critical Risk', value: totalCritical, icon: <AlertTriangle size={18} />, color: C.rose },
              { label: 'Watch List', value: totalWatch, icon: <Clock size={18} />, color: C.amber },
              { label: 'Healthy', value: totalSafe, icon: <CheckCircle size={18} />, color: C.emerald },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: C.panel, borderRadius: 14, border: `1px solid ${C.border}`,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span style={{ color: C.textDim, fontSize: 12 }}>{stat.label}</span>
                </div>
                <p style={{
                  fontSize: 26, fontWeight: 800, margin: 0,
                  color: stat.label === 'Critical Risk' ? C.rose :
                    stat.label === 'Watch List' ? C.amber :
                      stat.label === 'Healthy' ? C.emerald : C.text,
                }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Teacher Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reports.map((report, idx) => (
              <motion.div
                key={report.teacherId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: C.panel, borderRadius: 16, border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${riskColor(report.riskLevel)}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => setExpandedTeacher(expandedTeacher === report.teacherId ? null : report.teacherId)}
                  style={{
                    padding: '18px 22px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: riskBg(report.riskLevel),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: riskColor(report.riskLevel),
                    }}>
                      {riskIcon(report.riskLevel)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>
                        {report.teacherName}
                      </h4>
                      <p style={{ fontSize: 13, color: C.textDim, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {report.totalHours}h worked
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Activity size={12} /> {report.totalSessions} sessions
                        </span>
                        {report.lateNightCount > 0 && (
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            color: C.rose, fontWeight: 600,
                          }}>
                            <Moon size={12} /> {report.lateNightCount} late nights
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    padding: '6px 14px', borderRadius: 100,
                    background: riskBg(report.riskLevel),
                    color: riskColor(report.riskLevel),
                    fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                  }}>
                    {report.riskLevel}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTeacher === report.teacherId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        padding: '0 22px 18px', borderTop: `1px solid ${C.border}`,
                        marginTop: 4, paddingTop: 14,
                      }}>
                        {report.alerts.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 8px' }}>
                              Active Alerts
                            </p>
                            {report.alerts.map((alert, i) => (
                              <div key={i} style={{
                                padding: '10px 14px', borderRadius: 10,
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.15)',
                                marginBottom: 6, fontSize: 13, color: C.text,
                                display: 'flex', alignItems: 'center', gap: 8,
                              }}>
                                <AlertTriangle size={14} color={C.rose} />
                                {alert}
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {[
                            { label: 'Total Hours (3w)', value: `${report.totalHours}h`, color: report.totalHours > 120 ? C.rose : C.blue },
                            { label: 'Total Sessions', value: report.totalSessions, color: C.steel },
                            { label: 'Late-Night Logins', value: report.lateNightCount, color: report.lateNightCount >= 3 ? C.rose : C.amber },
                            { label: 'Late-Night Dates', value: report.lateNightDates.length > 0 ? report.lateNightDates.join(', ') : 'None', color: C.steel },
                          ].map((d) => (
                            <div key={d.label} style={{
                              background: C.elevated, borderRadius: 10, padding: '12px 14px',
                            }}>
                              <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 4px' }}>{d.label}</p>
                              <p style={{ fontSize: 15, fontWeight: 700, color: d.color, margin: 0 }}>{d.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {reports.length === 0 && (
            <div style={{
              background: C.panel, borderRadius: 20, padding: 40,
              textAlign: 'center', border: `1px solid ${C.border}`,
            }}>
              <Activity size={40} color={C.textDim} style={{ marginBottom: 12 }} />
              <p style={{ color: C.textDim, fontSize: 14 }}>No teacher activity data found for the past 3 weeks.</p>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px }
      `}</style>
    </div>
  )
}
