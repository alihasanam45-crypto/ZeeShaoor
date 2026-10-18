'use client'

import { useState } from 'react'
import { Smile, Frown, Meh, Angry, Heart } from 'lucide-react'

interface Emotion {
  emoji: string
  label: string
  icon: typeof Smile
  color: string
  message: string
}

const EMOTIONS: Emotion[] = [
  { emoji: '😊', label: 'Happy', icon: Smile, color: 'text-green-400', message: 'Great vibe! You\'re in a great headspace for learning.' },
  { emoji: '😴', label: 'Tired', icon: Meh, color: 'text-yellow-400', message: 'Rest is productive too. Take a short break.' },
  { emoji: '😰', label: 'Anxious', icon: Frown, color: 'text-orange-400', message: 'Take a deep breath. You\'ve got this.' },
  { emoji: '😕', label: 'Confused', icon: Angry, color: 'text-red-400', message: 'Confusion is the first step to clarity. Ask for help.' },
  { emoji: '🤩', label: 'Motivated', icon: Heart, color: 'text-purple-400', message: 'Channel that energy into focused study!' },
]

interface LogEntry {
  emotion: string
  timestamp: string
}

export default function EmotionCheckIn() {
  const [selected, setSelected] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const handleSelect = (label: string) => {
    setSelected(label)
    setLogs(prev => [{ emotion: label, timestamp: new Date().toLocaleTimeString() }, ...prev])
  }

  const current = EMOTIONS.find(e => e.label === selected)

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <h3 className="text-sm font-black text-white mb-1">Emotion Check-In</h3>
      <p className="text-xs text-gray-500 mb-4">How are you feeling right now?</p>

      <div className="flex gap-3 justify-center">
        {EMOTIONS.map(emotion => {
          const active = selected === emotion.label
          return (
            <button
              key={emotion.label}
              onClick={() => handleSelect(emotion.label)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-300 ${
                active
                  ? `${emotion.color} border-current bg-gray-800 scale-110 shadow-lg`
                  : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300 hover:scale-105'
              }`}
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <span className="text-[10px] font-semibold">{emotion.label}</span>
            </button>
          )
        })}
      </div>

      {current && (
        <div className={`mt-4 p-3 rounded-xl bg-gray-800/60 border border-gray-700 ${current.color}`}>
          <p className="text-xs font-medium">{current.message}</p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Today's Log</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-gray-500 py-1 px-2 rounded-lg bg-gray-800/30">
                <span>{log.emotion}</span>
                <span className="text-gray-600">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
