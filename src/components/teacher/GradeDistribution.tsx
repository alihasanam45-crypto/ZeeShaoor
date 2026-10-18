'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, TrendingUp, AlertTriangle, CheckCircle,
  Loader2, Calculator,
} from 'lucide-react'
import {
  LineChart, Line, Area, ComposedChart, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  Legend,
} from 'recharts'

const C = {
  panel: '#ffffff', elevated: '#f1f3f8',
  border: 'rgba(15,23,42,0.08)', borderStrong: 'rgba(15,23,42,0.16)',
  steel: '#64748b', blue: '#2563eb', purple: '#7c3aed',
  emerald: '#10b981', amber: '#f59e0b', rose: '#ef4444',
  gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)',
  text: '#1f2937', textDim: 'rgba(31,41,55,0.55)',
}

interface AnalysisResult {
  stats: {
    mean: number
    standardDeviation: number
    min: number
    max: number
    failureRate: number
    distribution: number[]
  }
  normalization: {
    needsNormalization: boolean
    suggestedShift: number
    normalizedMean: number
    description: string
    difficultyFlag: boolean
  }
  analytics: any
}

export default function GradeDistribution() {
  const [testId, setTestId] = useState('')
  const [classId, setClassId] = useState('')
  const [scoreInput, setScoreInput] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const handleAnalyze = async () => {
    if (!testId.trim() || !classId.trim() || !scoreInput.trim()) {
      setError('Please fill all fields')
      return
    }
    const scores = scoreInput.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n))
    if (scores.length < 3) {
      setError('Enter at least 3 scores')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/teacher/test-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: testId.trim(),
          classId: classId.trim(),
          scores,
        }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setResult(data)
      await fetchHistory()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/teacher/test-analytics')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setHistory(data.analytics || [])
    } catch (e) { /* silent */ }
  }

  // Generate normal distribution curve data points
  const bellCurveData = useMemo(() => {
    if (!result) return []
    const { mean, standardDeviation } = result.stats
    const data: { score: number; frequency: number; failing: number | null }[] = []

    // Generate points from mean - 4σ to mean + 4σ
    const start = Math.max(0, Math.round(mean - 4 * standardDeviation))
    const end = Math.min(100, Math.round(mean + 4 * standardDeviation))

    for (let x = start; x <= end; x += 1) {
      const exponent = -((x - mean) ** 2) / (2 * standardDeviation ** 2)
      const frequency =
        (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) *
        Math.exp(exponent)

      data.push({
        score: x,
        frequency: Math.round(frequency * 10000) / 10000,
        failing: x < 40 ? frequency : null,
      })
    }

    return data
  }, [result])

  const barData = useMemo(() => {
    if (!result) return []
    return result.stats.distribution.map((count, i) => ({
      range: `${i * 10}-${(i + 1) * 10}`,
      count,
      failing: i < 4 ? count : 0,
    }))
  }, [result])

  return (
    <div>
      {/* Input Form */}
      <div style={{
        background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
        padding: '24px 28px', marginBottom: 24,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>Test ID</label>
            <input value={testId} onChange={(e) => setTestId(e.target.value)} placeholder="e.g. T-001" style={{
              width: '100%', padding: '11px 14px', borderRadius: 10, border: '2px solid', borderColor: C.border,
              background: C.elevated, fontSize: 14, color: C.text, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>Class ID</label>
            <input value={classId} onChange={(e) => setClassId(e.target.value)} placeholder="e.g. 9A" style={{
              width: '100%', padding: '11px 14px', borderRadius: 10, border: '2px solid', borderColor: C.border,
              background: C.elevated, fontSize: 14, color: C.text, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
              Scores (comma-separated)
            </label>
            <input value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} placeholder="e.g. 85, 72, 64, 91, 55, 43, 78" style={{
              width: '100%', padding: '11px 14px', borderRadius: 10, border: '2px solid', borderColor: C.border,
              background: C.elevated, fontSize: 14, color: C.text, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              padding: '12px 28px', borderRadius: 12, border: 'none',
              background: loading ? C.elevated : C.gradient,
              color: loading ? C.textDim : 'white', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Calculator size={18} />
            )}
            {loading ? 'Analyzing...' : 'Analyze Distribution'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowHistory(!showHistory); if (!showHistory && history.length === 0) fetchHistory() }}
            style={{
              padding: '12px 20px', borderRadius: 12, border: `1px solid ${C.border}`,
              background: C.panel, color: C.text, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <BarChart3 size={18} /> History
          </motion.button>
        </div>
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

      {/* Results */}
      {result && (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Mean (μ)', value: result.stats.mean, color: C.blue, icon: <TrendingUp size={18} /> },
              { label: 'Std Dev (σ)', value: result.stats.standardDeviation, color: C.purple, icon: <BarChart3 size={18} /> },
              { label: 'Min / Max', value: `${result.stats.min} / ${result.stats.max}`, color: C.steel, icon: <BarChart3 size={18} /> },
              {
                label: 'Failure Rate',
                value: `${result.stats.failureRate}%`,
                color: result.stats.failureRate > 40 ? C.rose : C.emerald,
                icon: result.stats.failureRate > 40 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: C.panel, borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 18px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span style={{ color: C.textDim, fontSize: 12 }}>{stat.label}</span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Bell Curve (Normal Distribution) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
                padding: 24,
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} /> Normal Distribution Curve
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={bellCurveData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis
                    dataKey="score"
                    tick={{ fontSize: 11, fill: C.steel }}
                    axisLine={{ stroke: C.border }}
                    tickLine={false}
                    domain={[0, 100]}
                    label={{ value: 'Score', position: 'bottom', fontSize: 11, fill: C.textDim }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: C.panel, border: `1px solid ${C.borderStrong}`,
                      borderRadius: 10, fontSize: 12,
                    }}
                    formatter={(value) => [Number(value).toFixed(4), 'Density']}
                  />
                  {/* Failing zone (red gradient area) */}
                  <defs>
                    <linearGradient id="failingGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={C.rose} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={C.rose} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.blue} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  {/* Full curve area */}
                  <Area type="monotone" dataKey="frequency" fill="url(#curveFill)" stroke="none" />
                  {/* Failing zone area */}
                  <Area type="monotone" dataKey="failing" fill="url(#failingGrad)" stroke="none" />
                  {/* Curve line */}
                  <Line type="monotone" dataKey="frequency" stroke={C.blue} strokeWidth={2} dot={false} />
                  {/* Mean reference line */}
                  <ReferenceLine
                    x={result.stats.mean}
                    stroke={C.purple}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    label={{
                      value: `μ = ${result.stats.mean}`,
                      position: 'top',
                      fill: C.purple,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                  {/* 40% failure threshold line */}
                  <ReferenceLine
                    x={40}
                    stroke={C.rose}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    label={{
                      value: 'Fail (40)',
                      position: 'top',
                      fill: C.rose,
                      fontSize: 10,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center', fontSize: 12, color: C.textDim }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 20, height: 2, background: C.blue, display: 'inline-block' }} /> Normal Distribution
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 20, height: 2, background: C.purple, display: 'inline-block', borderTop: '2px dashed #7c3aed' }} /> Mean (μ)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 20, height: 12, background: 'rgba(239,68,68,0.15)',
                    display: 'inline-block', borderRadius: 2,
                  }} /> Failing Zone
                </span>
              </div>
            </motion.div>

            {/* Normalization Engine */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
                padding: 24,
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calculator size={16} /> AI Normalization Engine
              </h3>

              <div style={{
                background: result.normalization.difficultyFlag
                  ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                borderRadius: 14, padding: '16px 20px', marginBottom: 20,
                border: `1px solid ${result.normalization.difficultyFlag ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {result.normalization.difficultyFlag ? (
                    <AlertTriangle size={20} color={C.rose} />
                  ) : (
                    <CheckCircle size={20} color={C.emerald} />
                  )}
                  <span style={{
                    fontWeight: 700, fontSize: 14,
                    color: result.normalization.difficultyFlag ? C.rose : C.emerald,
                  }}>
                    {result.normalization.difficultyFlag ? 'Anomalous Distribution Detected' : 'Distribution Looks Healthy'}
                  </span>
                </div>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {result.normalization.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: C.elevated, borderRadius: 12, padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, color: C.textDim, margin: '0 0 4px' }}>Current Mean</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>{result.stats.mean}</p>
                </div>
                <div style={{
                  background: 'rgba(37,99,235,0.06)', borderRadius: 12,
                  padding: '14px 16px', border: '1px solid rgba(37,99,235,0.15)',
                }}>
                  <p style={{ fontSize: 12, color: C.blue, margin: '0 0 4px' }}>Suggested Shift</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.blue, margin: 0 }}>
                    {result.normalization.suggestedShift > 0 ? '+' : ''}{result.normalization.suggestedShift} pts
                  </p>
                </div>
                <div style={{ background: C.elevated, borderRadius: 12, padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, color: C.textDim, margin: '0 0 4px' }}>Normalized Mean</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>{result.normalization.normalizedMean}</p>
                </div>
                <div style={{
                  background: 'rgba(139,92,246,0.06)', borderRadius: 12,
                  padding: '14px 16px', border: '1px solid rgba(139,92,246,0.15)',
                }}>
                  <p style={{ fontSize: 12, color: C.purple, margin: '0 0 4px' }}>Std Dev (σ)</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.purple, margin: 0 }}>{result.stats.standardDeviation}</p>
                </div>
              </div>

              {result.normalization.needsNormalization && (
                <div style={{
                  marginTop: 16, padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
                  fontSize: 13, color: C.text, textAlign: 'center', fontWeight: 500,
                }}>
                  x&prime; = x + ({result.normalization.normalizedMean} - {result.stats.mean})
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              marginTop: 20, background: C.panel, borderRadius: 20,
              border: `1px solid ${C.border}`, padding: 20,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
              Analysis History
            </h3>
            {history.length === 0 ? (
              <p style={{ color: C.textDim, fontSize: 13 }}>No previous analyses found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.map((h: any) => (
                  <div key={h._id} style={{
                    padding: '12px 16px', borderRadius: 10, background: C.elevated,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{h.testId}</span>
                      <span style={{ color: C.textDim, fontSize: 13, marginLeft: 12 }}>Class {h.classId}</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 12,
                        color: h.difficultyFlag ? C.rose : C.emerald, fontSize: 12,
                      }}>
                        {h.difficultyFlag ? '⚠' : '✓'} μ={h.meanScore} σ={h.standardDeviation}
                      </span>
                    </div>
                    <span style={{ color: C.textDim, fontSize: 12 }}>
                      {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
