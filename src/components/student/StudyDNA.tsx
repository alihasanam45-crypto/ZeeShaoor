'use client'

import { useEffect, useState } from 'react'
import { Dna } from 'lucide-react'

interface Dimension {
  label: string
  score: number
  color: string
  description: string
}

const DIMENSIONS: Dimension[] = [
  { label: 'Focus', score: 78, color: 'from-cyan-500 to-blue-500', description: 'Ability to concentrate during study sessions' },
  { label: 'Consistency', score: 65, color: 'from-emerald-500 to-green-500', description: 'Regular daily study habits' },
  { label: 'Depth', score: 82, color: 'from-purple-500 to-violet-500', description: 'Deep understanding of concepts' },
  { label: 'Speed', score: 58, color: 'from-orange-500 to-red-500', description: 'Problem-solving and reading speed' },
  { label: 'Recall', score: 71, color: 'from-pink-500 to-rose-500', description: 'Memory retention and retrieval' },
]

export default function StudyDNA() {
  const [animatedScores, setAnimatedScores] = useState<number[]>(DIMENSIONS.map(() => 0))

  useEffect(() => {
    const duration = 1000
    const steps = 40
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      setAnimatedScores(DIMENSIONS.map(d => Math.min(Math.round((d.score / steps) * step), d.score)))
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  const average = Math.round(DIMENSIONS.reduce((sum, d) => sum + d.score, 0) / DIMENSIONS.length)

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center">
          <Dna size={16} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Study DNA</h3>
          <p className="text-xs text-gray-500">Your learning profile</p>
        </div>
      </div>

      <div className="space-y-4">
        {DIMENSIONS.map((dim, i) => (
          <div key={dim.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white">{dim.label}</span>
              <span className="text-xs font-black" style={{ color: dim.color.split(' ')[0].replace('from-', '').replace('-500', '') }}>
                {animatedScores[i]}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-500`}
                style={{ width: `${animatedScores[i]}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-600 mt-0.5">{dim.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Score</span>
          <span className="text-lg font-black text-white">{average}<span className="text-sm text-gray-500">/100</span></span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-800 mt-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${average}%` }}
          />
        </div>
      </div>
    </div>
  )
}
