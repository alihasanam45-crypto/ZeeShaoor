'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface BrainScore {
  subject:  string
  score:    number           // 0–100
  trend:    'up' | 'down' | 'same'
}

interface BrainMeterProps {
  scores: BrainScore[]
}

// --------- Score threshold system ---------------------------------------------------------------------------------------------------------------------------------------------------------
function getThreshold(score: number): {
  stroke:     string   // SVG stroke color
  text:       string   // score text color
  label:      string   // status label
  labelColor: string
  glow:       string   // drop-shadow color
  ring:       string   // alert surface bg
} {
  if (score >= 80) return {
    stroke:     '#10b981',   // emerald-500
    text:       'text-emerald-600',
    label:      'Excellent',
    labelColor: 'text-emerald-600',
    glow:       'drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]',
    ring:       'border border-emerald-100 bg-emerald-50',
  }
  if (score >= 60) return {
    stroke:     '#6366f1',   // indigo-500
    text:       'text-indigo-600',
    label:      'Good',
    labelColor: 'text-indigo-600',
    glow:       'drop-shadow-[0_0_8px_rgba(99,102,241,0.35)]',
    ring:       'border border-indigo-100 bg-indigo-50',
  }
  if (score >= 40) return {
    stroke:     '#f59e0b',   // amber-500
    text:       'text-amber-600',
    label:      'Average',
    labelColor: 'text-amber-600',
    glow:       'drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]',
    ring:       'border border-amber-100 bg-amber-50',
  }
  return {
    stroke:     '#ef4444',   // red-500
    text:       'text-red-500',
    label:      'Critical',
    labelColor: 'text-red-500',
    glow:       'drop-shadow-[0_0_8px_rgba(239,68,68,0.35)]',
    ring:       'border border-red-100 bg-red-50',
  }
}

// --------- Single animated ring ---------------------------------------------------------------------------------------------------------------------------------------------------------------
function BrainRing({ data, index }: { data: BrainScore; index: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  // Animate score counter from 0 → actual on mount
  useEffect(() => {
    const duration = 1200 + index * 150   // staggered
    const steps    = 60
    const interval = duration / steps
    let current    = 0

    const timer = setInterval(() => {
      current += data.score / steps
      if (current >= data.score) {
        setAnimatedScore(data.score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [data.score, index])

  const threshold = getThreshold(data.score)

  // SVG ring math
  const size        = 96       // viewBox size
  const strokeWidth = 7
  const radius      = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress    = (animatedScore / 100) * circumference
  const cx          = size / 2
  const cy          = size / 2

  const TrendIcon =
    data.trend === 'up'   ? TrendingUp   :
    data.trend === 'down' ? TrendingDown :
    Minus

  const trendColor =
    data.trend === 'up'   ? 'text-emerald-500' :
    data.trend === 'down' ? 'text-red-400'     :
    'text-slate-400'

  return (
    <div className="group flex flex-col items-center gap-3">

      {/* Ring container */}
      <div className="relative w-24 h-24">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={`-rotate-90 ${threshold.glow} transition-all duration-300 group-hover:scale-110`}
        >
          {/* Track ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={threshold.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black leading-none ${threshold.text}`}>
            {animatedScore}
          </span>
          <span className="text-xs text-slate-400 leading-none">%</span>
          {/* Trend arrow */}
          <TrendIcon
            size={10}
            className={`${trendColor} mt-0.5`}
          />
        </div>
      </div>

      {/* Subject name */}
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-600 leading-tight">{data.subject}</p>
        <p className={`text-xs font-bold mt-0.5 ${threshold.labelColor}`}>{threshold.label}</p>
      </div>
    </div>
  )
}

// --------- Overall meter bar ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function OverallBar({ scores }: { scores: BrainScore[] }) {
  const avg       = Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length)
  const threshold = getThreshold(avg)

  return (
    <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Overall Neural Score
        </span>
        <span className={`text-sm font-black ${threshold.text}`}>{avg}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
          style={{ width: `${avg}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-3">
          {[
            { label: '<40%',   color: 'bg-red-400'     },
            { label: '40–59%', color: 'bg-amber-400'   },
            { label: '60–79%', color: 'bg-indigo-400'  },
            { label: '>80%',   color: 'bg-emerald-400' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
        <span className={`text-xs font-bold ${threshold.labelColor}`}>
          {threshold.label}
        </span>
      </div>
    </div>
  )
}

// --------- Weakest subject alert ------------------------------------------------------------------------------------------------------------------------------------------------------------
function WeakAlert({ scores }: { scores: BrainScore[] }) {
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0]
  if (weakest.score >= 60) return null

  const threshold = getThreshold(weakest.score)

  return (
    <div className={`mt-4 flex items-start gap-3 rounded-2xl p-4 ${threshold.ring}`}>
      <span className={`text-xs font-black ${threshold.text} mt-0.5`}>!</span>
      <p className="text-xs text-slate-500 leading-relaxed">
        <span className={`font-semibold ${threshold.text}`}>{weakest.subject}</span>
        {' '}needs attention. Your score is {weakest.score}% — AI recommends 2 focused sessions this week.
      </p>
    </div>
  )
}

// --------- Main export ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function BrainMeter({ scores }: BrainMeterProps) {
  return (
    <div>
      {/* 5 rings */}
      <div className="flex flex-wrap gap-8 justify-between items-center">
        {scores.map((s, i) => (
          <BrainRing key={s.subject} data={s} index={i} />
        ))}
      </div>

      {/* Overall bar */}
      <OverallBar scores={scores} />

      {/* Weak subject alert */}
      <WeakAlert scores={scores} />
    </div>
  )
}
