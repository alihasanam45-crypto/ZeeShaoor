'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, Play, Pause, RotateCcw, Ban } from 'lucide-react'

export default function FocusShield() {
  const [active, setActive] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [distractionsBlocked, setDistractionsBlocked] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active])

  useEffect(() => {
    if (active && seconds > 0 && seconds % 15 === 0) {
      setDistractionsBlocked(prev => prev + 1)
    }
  }, [seconds, active])

  const handleToggle = () => {
    if (active) {
      setActive(false)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    } else {
      setActive(true)
    }
  }

  const handleReset = () => {
    setActive(false)
    setSeconds(0)
    setDistractionsBlocked(0)
    setShowNotification(false)
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const shieldColor = active ? 'text-cyan-400' : 'text-gray-600'

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5 relative">
      {showNotification && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cyan-900/90 text-cyan-300 text-xs font-bold px-4 py-2 rounded-full border border-cyan-700 animate-bounce whitespace-nowrap shadow-lg">
          Focus session ended — {formatTime(seconds)} logged
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
          <Shield size={16} className={shieldColor} />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Focus Shield</h3>
          <p className="text-xs text-gray-500">Distraction-free mode</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-4">
        <div className={`text-5xl font-black font-mono tracking-wider transition-colors ${active ? 'text-cyan-400' : 'text-gray-600'}`}>
          {formatTime(seconds)}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              active
                ? 'bg-red-900/50 text-red-400 border border-red-700 hover:bg-red-900/70'
                : 'bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-900/70'
            }`}
          >
            {active ? <Pause size={16} /> : <Play size={16} />}
            {active ? 'End Session' : 'Start Focus'}
          </button>
          <button
            onClick={handleReset}
            className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-500 hover:text-gray-300"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-3 border-t border-gray-800">
        <span className="flex items-center gap-1">
          <Ban size={12} className="text-red-400" />
          Distractions blocked: <strong className="text-white">{distractionsBlocked}</strong>
        </span>
        <span className="text-gray-600">
          Shield {active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  )
}
