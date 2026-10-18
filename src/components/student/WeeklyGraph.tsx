'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'

interface DayData {
  day: string
  short: string
  hours: number
}

const WEEKLY_DATA: DayData[] = [
  { day: 'Monday', short: 'Mon', hours: 4.5 },
  { day: 'Tuesday', short: 'Tue', hours: 3.0 },
  { day: 'Wednesday', short: 'Wed', hours: 5.0 },
  { day: 'Thursday', short: 'Thu', hours: 2.5 },
  { day: 'Friday', short: 'Fri', hours: 3.5 },
  { day: 'Saturday', short: 'Sat', hours: 6.0 },
  { day: 'Sunday', short: 'Sun', hours: 1.5 },
]

export default function WeeklyGraph() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const maxHours = Math.max(...WEEKLY_DATA.map(d => d.hours))
  const totalHours = WEEKLY_DATA.reduce((sum, d) => sum + d.hours, 0)
  const averageHours = totalHours / WEEKLY_DATA.length

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center">
          <BarChart3 size={16} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Weekly Activity</h3>
          <p className="text-xs text-gray-500">Study hours this week</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-40 px-1">
        {WEEKLY_DATA.map((day, i) => {
          const height = maxHours > 0 ? (day.hours / maxHours) * 100 : 0
          return (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-bold text-gray-500">
                {day.hours}h
              </span>
              <div className="w-full flex justify-center" style={{ height: '100%', alignSelf: 'flex-end' }}>
                <div
                  className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-cyan-500 transition-all duration-700 ease-out"
                  style={{
                    height: animated ? `${height}%` : '0%',
                    opacity: animated ? 1 : 0,
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
              <span className="text-[9px] font-semibold text-gray-600">{day.short}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-lg font-black text-white">{totalHours}h</p>
          <p className="text-[10px] text-gray-500 font-medium">Total Hours</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-white">{averageHours.toFixed(1)}h</p>
          <p className="text-[10px] text-gray-500 font-medium">Daily Average</p>
        </div>
      </div>
    </div>
  )
}
