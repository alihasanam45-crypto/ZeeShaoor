'use client'

import { useState } from 'react'
import { Lightbulb, ChevronRight, GraduationCap } from 'lucide-react'

interface InheritedTip {
  id: number
  topic: string
  tip: string
  contributor: string
  subject: string
}

const INHERITED_TIPS: InheritedTip[] = [
  { id: 1, topic: 'Quadratic Equations', tip: 'Practice with word problems first — they build intuition before formula drills.', contributor: 'Ahmed R.', subject: 'Math' },
  { id: 2, topic: 'Photosynthesis', tip: 'Draw the process out step-by-step. Visualization beats memorization.', contributor: 'Sara K.', subject: 'Biology' },
  { id: 3, topic: 'Electrochemistry', tip: 'Focus on redox reactions — half of the chapter is built on that concept.', contributor: 'Usman T.', subject: 'Chemistry' },
  { id: 4, topic: 'Pakistan Movement', tip: 'Create a timeline of key events. Sequence is everything in history.', contributor: 'Fatima Z.', subject: 'Pakistan Studies' },
]

export default function KnowledgeInherit() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center">
          <GraduationCap size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Knowledge Inherit</h3>
          <p className="text-xs text-gray-500">Wisdom from peers who came before</p>
        </div>
      </div>

      <div className="space-y-3">
        {INHERITED_TIPS.map(tip => (
          <div
            key={tip.id}
            className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-4 transition-all hover:border-gray-600"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{tip.subject}</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{tip.topic}</h4>
              </div>
              <Lightbulb size={14} className="text-amber-400 shrink-0 mt-1" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              "{tip.tip}"
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600">— {tip.contributor}</span>
              <button
                onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Learn More
                <ChevronRight size={12} className={expanded === tip.id ? 'rotate-90' : ''} />
              </button>
            </div>
            {expanded === tip.id && (
              <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-500 leading-relaxed">
                This tip was shared by {tip.contributor} after scoring in the top 5% in {tip.subject}. 
                It has helped over 200 students improve their understanding of {tip.topic}.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
