'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Flame, Loader2, AlertTriangle, Award } from 'lucide-react'

const MILESTONES = [3, 7, 14, 30, 60, 100]

const HEATMAP_LEVELS = [
  'bg-slate-100',
  'bg-indigo-100',
  'bg-indigo-300',
  'bg-indigo-500',
  'bg-indigo-700',
]

function getHeatmapColor(level: number): string {
  return HEATMAP_LEVELS[Math.min(level, 4)]
}

interface HeatmapCell {
  date: string
  level: number
}

export default function StreakCounter() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const fetchedRef = useRef(false)

  const fetchData = useCallback(async () => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    try {
      const res = await fetch('/api/student/streak')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Data load nahi hua')
      setData(json.data)

      // Log today as active on first load
      if (!json.data?.todayActive) {
        await fetch('/api/student/streak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }).catch(() => {})
        // Refetch to get updated streak
        const res2 = await fetch('/api/student/streak')
        const json2 = await res2.json()
        if (res2.ok) setData(json2.data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={24} className="text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
        <AlertTriangle size={18} />
        <span className="text-sm font-semibold">{error}</span>
      </div>
    )
  }

  if (!data) return null

  const {
    currentStreak = 0,
    longestStreak = 0,
    milestonesReached = [],
    nextMilestone = 3,
    todayActive = false,
    heatmap = [],
    nanoQuizStreak = 0,
    nanoHomeworkStreak = 0,
    nanoNotesStreak = 0,
    totalActiveDays = 0,
  } = data

  // Fire intensity based on streak
  const flameSize = Math.min(28 + currentStreak * 1.2, 64)
  const flameAnimClass =
    currentStreak >= 60 ? 'animate-bounce' :
    currentStreak >= 30 ? 'animate-pulse' :
    currentStreak >= 14 ? 'animate-pulse' :
    ''

  const flameColor =
    currentStreak >= 100 ? 'text-purple-500' :
    currentStreak >= 60 ? 'text-pink-500' :
    currentStreak >= 30 ? 'text-red-500' :
    currentStreak >= 14 ? 'text-orange-500' :
    currentStreak >= 7 ? 'text-orange-400' :
    currentStreak >= 3 ? 'text-amber-500' :
    'text-slate-300'

  const flameGlow =
    currentStreak >= 100 ? 'shadow-[0_0_30px_rgba(168,85,247,0.35)]' :
    currentStreak >= 60 ? 'shadow-[0_0_25px_rgba(236,72,153,0.3)]' :
    currentStreak >= 30 ? 'shadow-[0_0_20px_rgba(239,68,68,0.25)]' :
    currentStreak >= 14 ? 'shadow-[0_0_15px_rgba(251,146,60,0.2)]' :
    ''

  // Build heatmap grid: 7 rows (days) × 13 columns (weeks)
  // But align it properly: column = week, row = day of week
  // We need the 90 days in order, grouped by week
  const sortedHeatmap: HeatmapCell[] = [...(heatmap || [])].sort((a, b) => a.date.localeCompare(b.date))

  // Group by week
  const weeks: HeatmapCell[][] = []
  let currentWeek: HeatmapCell[] = []
  for (const cell of sortedHeatmap) {
    const dayOfWeek = new Date(cell.date).getDay() // 0=Sun
    // Start new week on Monday (or first cell if empty)
    if (currentWeek.length === 0) {
      // Pad empty days at start
      const padDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      for (let p = 0; p < padDays; p++) {
        currentWeek.push({ date: '', level: -1 })
      }
    }
    currentWeek.push(cell)
    if (dayOfWeek === 0) { // Sunday ends the week
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']

  return (
    <div className="space-y-6">
      {/* --------- FLAME + STREAK --------- */}
      <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-slate-100 bg-slate-50 p-6 sm:flex-row">
        <div className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm ${flameGlow}`}>
          <Flame
            size={flameSize}
            className={`${flameColor} ${flameAnimClass} transition-all duration-500`}
            style={{ filter: `drop-shadow(0 0 ${currentStreak * 0.5}px currentColor)` }}
          />
          {todayActive && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </div>

        <div className="text-center sm:text-left">
          <div className="mb-1 flex items-center gap-3">
            <span className={`text-4xl font-black sm:text-5xl ${currentStreak >= 3 ? flameColor : 'text-slate-700'}`}>
              {currentStreak}
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Day Streak</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Longest: <strong className="text-slate-700">{longestStreak}</strong></span>
            <span>Active: <strong className="text-slate-700">{totalActiveDays}</strong></span>
            {todayActive && (
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --------- MILESTONE BADGES --------- */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Milestones</p>
        <div className="flex flex-wrap gap-2">
          {MILESTONES.map(m => {
            const reached = milestonesReached.includes(m)
            const progress = currentStreak >= m ? 100 : Math.round((currentStreak / m) * 100)
            return (
              <div
                key={m}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition-all
                  ${reached
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
              >
                <Award size={14} className={reached ? 'text-indigo-500' : ''} />
                <span>{m}d</span>
                {!reached && (
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {reached && <span className="text-[10px]">🏅</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* --------- 3-MONTH HEATMAP --------- */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Last 3 Months Activity
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex gap-1" style={{ minWidth: `${weeks.length * 14}px` }}>
            {/* Day labels */}
            <div className="mr-2 flex flex-col gap-1">
              {dayLabels.map((label, i) => (
                <div key={i} className="flex h-[14px] items-center">
                  <span className="text-[9px] font-medium text-slate-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={cell.date ? `${cell.date} — Level ${cell.level}` : ''}
                    className={`h-[14px] w-[14px] rounded-sm ${
                      cell.level >= 0 ? getHeatmapColor(cell.level) : 'bg-transparent'
                    } cursor-pointer transition-all hover:ring-1 hover:ring-indigo-400`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-2 text-xs text-slate-400">
            <span>Less</span>
            {HEATMAP_LEVELS.map((cls, i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${cls}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* --------- NANO STREAKS --------- */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Nano Streaks
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Quiz Streak', value: nanoQuizStreak, icon: '🧩', color: 'border-violet-200 text-violet-700 bg-violet-50' },
            { label: 'Homework Streak', value: nanoHomeworkStreak, icon: '📝', color: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
            { label: 'Notes Streak', value: nanoNotesStreak, icon: '📖', color: 'border-sky-200 text-sky-700 bg-sky-50' },
          ].map(nano => {
            const badges: Record<string, { label: string; min: number }> = {
              '🧩': { label: 'Starter', min: 1 },
              '🎯': { label: 'Focused', min: 3 },
              '🔥': { label: 'On Fire', min: 5 },
              '⚡': { label: 'Unstoppable', min: 7 },
              '💎': { label: 'Elite', min: 14 },
            }
            const badgeLevel =
              nano.value >= 14 ? '💎' :
              nano.value >= 7 ? '⚡' :
              nano.value >= 5 ? '🔥' :
              nano.value >= 3 ? '🎯' :
              '🧩'
            const badgeLabel = badges[badgeLevel]?.label || 'Starter'

            return (
              <div
                key={nano.label}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${nano.color}`}
              >
                <span className="text-lg">{nano.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{nano.label}</p>
                  <p className="text-lg font-black">{nano.value}
                    <span className="ml-1 text-xs font-normal text-slate-400">days</span>
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">{badgeLabel} 🏅</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
