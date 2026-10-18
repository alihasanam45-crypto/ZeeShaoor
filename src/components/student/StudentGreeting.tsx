'use client'

import { useEffect, useState } from 'react'
import { Clock, TrendingDown, TrendingUp } from 'lucide-react'

interface StudentGreetingProps {
  name: string
  classLabel: string
  /** Week-over-week mastery change in percentage points; null hides the chip. */
  weeklyGrowth: number | null
}

export default function StudentGreeting({ name, classLabel, weeklyGrowth }: StudentGreetingProps) {
  const [greeting, setGreeting] = useState('Good Morning')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good Morning')
    else if (h < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const growthUp = weeklyGrowth !== null && weeklyGrowth >= 0

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {greeting}, {name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here&apos;s your learning overview for today</p>
      </div>
      <div className="flex items-center gap-3">
        {weeklyGrowth !== null && (
          <span
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
              growthUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
            }`}
          >
            {growthUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {growthUp ? '+' : ''}
              {weeklyGrowth}% this week
            </span>
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{classLabel}</span>
        </span>
      </div>
    </div>
  )
}
