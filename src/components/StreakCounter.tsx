'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Flame, Loader2, AlertTriangle, Award, RefreshCw } from 'lucide-react'

const MILESTONES = [3, 7, 14, 30, 60, 100]
const HEATMAP_LEVELS = ['bg-gray-800', 'bg-cyan-950', 'bg-cyan-800', 'bg-cyan-600', 'bg-cyan-400']

interface HeatmapCell { date: string; level: number }

export default function StreakCounter() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // Sirf GET — auto POST nahi karte
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/student/streak')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Data load nahi hua')
      setData(json.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Heatmap weeks — UTC day use karo
  const weeks = useMemo(() => {
    if (!data?.heatmap) return []
    const sorted: HeatmapCell[] = [...data.heatmap].sort((a, b) => a.date.localeCompare(b.date))
    const result: HeatmapCell[][] = []
    let week: HeatmapCell[] = []
    for (const cell of sorted) {
      const dayOfWeek = new Date(cell.date + 'T00:00:00Z').getUTCDay()
      if (week.length === 0) {
        const pad = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        for (let p = 0; p < pad; p++) week.push({ date: '', level: -1 })
      }
      week.push(cell)
      if (dayOfWeek === 0) { result.push(week); week = [] }
    }
    if (week.length > 0) result.push(week)
    return result
  }, [data?.heatmap])

  const {
    currentStreak = 0, longestStreak = 0, milestonesReached = [],
    todayActive = false, heatmap = [],
    nanoQuizStreak = 0, nanoHomeworkStreak = 0, nanoNotesStreak = 0,
    totalActiveDays = 0,
  } = data || {}

  const flameSize  = Math.round(Math.min(28 + currentStreak * 1.2, 64))
  const flameFilter = useMemo(
    () => `drop-shadow(0 0 ${Math.round(currentStreak * 0.5)}px currentColor)`,
    [currentStreak]
  )
  const flameColor =
    currentStreak >= 100 ? 'text-purple-400' :
    currentStreak >= 60  ? 'text-pink-500'   :
    currentStreak >= 30  ? 'text-red-500'    :
    currentStreak >= 7   ? 'text-orange-400' :
    currentStreak >= 3   ? 'text-yellow-500' : 'text-gray-500'

  const flameGlow =
    currentStreak >= 100 ? 'shadow-[0_0_30px_rgba(168,85,247,0.6)]' :
    currentStreak >= 60  ? 'shadow-[0_0_25px_rgba(236,72,153,0.5)]' :
    currentStreak >= 30  ? 'shadow-[0_0_20px_rgba(239,68,68,0.4)]'  :
    currentStreak >= 14  ? 'shadow-[0_0_15px_rgba(251,146,60,0.3)]' : ''

  const flameAnim =
    currentStreak >= 30 ? 'animate-bounce' :
    currentStreak >= 14 ? 'animate-pulse'  : ''

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <Loader2 size={24} className="text-cyan-500 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300">
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} />
        <span className="text-sm font-semibold">{error}</span>
      </div>
      <button onClick={fetchData} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-200">
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  )

  if (!data) return null

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']

  return (
    <div className="space-y-6">

      {/* Flame + Streak */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className={`relative flex items-center justify-center w-24 h-24 rounded-full bg-gray-900 ${flameGlow}`}>
          <Flame
            size={flameSize}
            className={`${flameColor} ${flameAnim} transition-all duration-500`}
            style={{ filter: flameFilter }}
          />
          {todayActive && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900" />
          )}
        </div>
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-4xl sm:text-5xl font-black ${flameColor}`}>{currentStreak}</span>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Day Streak</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <span>Longest: <strong className="text-gray-400">{longestStreak}</strong></span>
            <span>Active Days: <strong className="text-gray-400">{totalActiveDays}</strong></span>
            {todayActive
              ? <span className="flex items-center gap-1 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Aaj active</span>
              : <span className="text-amber-500 text-xs">⚠ Aaj abhi active nahi</span>
            }
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Milestones</p>
        <div className="flex flex-wrap gap-2">
          {MILESTONES.map(m => {
            const reached  = milestonesReached.includes(m)
            const progress = Math.min(Math.round((currentStreak / m) * 100), 100)
            return (
              <div key={m} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                reached
                  ? 'bg-cyan-950/50 border-cyan-700 text-cyan-300'
                  : 'bg-gray-800/50 border-gray-700 text-gray-600'
              }`}>
                <Award size={14} className={reached ? 'text-cyan-400' : ''} />
                <span>{m}d</span>
                {reached
                  ? <span className="text-[10px]">🏅</span>
                  : (
                    <div className="w-12 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-700 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  )
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* 3-Month Heatmap */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Last 3 Months Activity</p>
        <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-4 overflow-x-auto">
          <div className="flex gap-1" style={{ minWidth: `${weeks.length * 14}px` }}>
            <div className="flex flex-col gap-1 mr-2">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-[14px] flex items-center">
                  <span className="text-[9px] text-gray-600 font-medium">{label}</span>
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={cell.date ? `${cell.date} — Level ${cell.level}` : ''}
                    className={`w-[14px] h-[14px] rounded-sm transition-all hover:ring-1 hover:ring-cyan-400 cursor-pointer ${
                      cell.level >= 0
                        ? HEATMAP_LEVELS[Math.min(cell.level, 4)]
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-600">
            <span>Less</span>
            {HEATMAP_LEVELS.map((cls, i) => <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />)}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Nano Streaks */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Nano Streaks</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Quiz Streak',     value: nanoQuizStreak,     icon: '🧩', color: 'border-violet-700 text-violet-300 bg-violet-950/30' },
            { label: 'Homework Streak', value: nanoHomeworkStreak, icon: '📝', color: 'border-green-700 text-green-300 bg-green-950/30'   },
            { label: 'Notes Streak',    value: nanoNotesStreak,    icon: '📖', color: 'border-blue-700 text-blue-300 bg-blue-950/30'      },
          ].map(nano => {
            const badge =
              nano.value >= 14 ? { icon: '💎', label: 'Elite'        } :
              nano.value >= 7  ? { icon: '⚡', label: 'Unstoppable'  } :
              nano.value >= 5  ? { icon: '🔥', label: 'On Fire'      } :
              nano.value >= 3  ? { icon: '🎯', label: 'Focused'      } :
                                 { icon: '🧩', label: 'Starter'      }
            return (
              <div key={nano.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${nano.color}`}>
                <span className="text-lg">{nano.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{nano.label}</p>
                  <p className="text-lg font-black">
                    {nano.value}
                    <span className="text-xs font-normal text-gray-500 ml-1">days</span>
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">{badge.icon} {badge.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}