'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Clock, RefreshCw } from 'lucide-react'

interface ScheduleItem {
  subject: string
  duration: number
  breakAfter: boolean
}

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Pakistan Studies', 'Computer Science']

export default function ZenAutoPilot() {
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [sessionDuration, setSessionDuration] = useState(45)
  const [breakEnabled, setBreakEnabled] = useState(true)
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [currentSession, setCurrentSession] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const breakDuration = 5
  const totalSessions = 3

  const schedule: ScheduleItem[] = Array.from({ length: totalSessions }, (_, i) => ({
    subject,
    duration: sessionDuration,
    breakAfter: breakEnabled && i < totalSessions - 1,
  }))

  const totalMinutes = schedule.reduce((sum, s) => sum + s.duration, 0) +
    (breakEnabled ? (totalSessions - 1) * breakDuration : 0)

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [status])

  const handleStart = () => {
    setElapsed(0)
    setCurrentSession(0)
    setStatus('running')
  }

  const handlePause = () => {
    setStatus(prev => prev === 'running' ? 'paused' : 'running')
  }

  const handleStop = () => {
    setStatus('idle')
    setElapsed(0)
    setCurrentSession(0)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center">
          <RefreshCw size={16} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Zen Auto-Pilot</h3>
          <p className="text-xs text-gray-500">Automated study sessions</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-1.5">Subject</label>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={status !== 'idle'}
            className="w-full text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-700 disabled:opacity-50"
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-1.5">
            Session Duration: {sessionDuration} min
          </label>
          <input
            type="range"
            min={30}
            max={120}
            step={5}
            value={sessionDuration}
            onChange={e => setSessionDuration(Number(e.target.value))}
            disabled={status !== 'idle'}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
            <span>30 min</span>
            <span>120 min</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-700/50">
          <span className="text-xs font-medium text-gray-400">Break between sessions (5 min)</span>
          <button
            onClick={() => setBreakEnabled(!breakEnabled)}
            disabled={status !== 'idle'}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              breakEnabled ? 'bg-cyan-600' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              breakEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Schedule Preview</p>
          <div className="space-y-1.5">
            {schedule.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-gray-300 font-medium">{s.subject}</span>
                <span className="text-gray-600">{s.duration} min</span>
                {s.breakAfter && <span className="text-gray-600 ml-auto">→ 5 min break</span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 mt-2">Total: {totalMinutes} minutes • {totalSessions} sessions</p>
        </div>

        <div className="text-center">
          <div className="text-3xl font-black font-mono text-white mb-3">
            {formatTime(elapsed)}
          </div>

          <div className="flex items-center justify-center gap-3">
            {status === 'idle' && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-900/70 transition-all"
              >
                <Play size={16} />
                Start
              </button>
            )}
            {status !== 'idle' && (
              <>
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-yellow-900/50 text-yellow-400 border border-yellow-700 hover:bg-yellow-900/70 transition-all"
                >
                  {status === 'running' ? <Pause size={16} /> : <Play size={16} />}
                  {status === 'running' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-red-900/50 text-red-400 border border-red-700 hover:bg-red-900/70 transition-all"
                >
                  <Square size={14} />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
