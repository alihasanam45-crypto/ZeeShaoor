'use client'

import { useState } from 'react'
import { Brain, ChevronRight, Calendar, CheckCircle, RotateCcw } from 'lucide-react'

interface ReviewTopic {
  id: number
  subject: string
  topic: string
  lastReviewed: string
  nextReview: string
  completed: boolean
}

const INITIAL_TOPICS: ReviewTopic[] = [
  { id: 1, subject: 'Mathematics', topic: 'Differentiation Rules', lastReviewed: '2026-07-03', nextReview: '2026-07-10', completed: false },
  { id: 2, subject: 'Physics', topic: 'Newton\'s Laws', lastReviewed: '2026-07-05', nextReview: '2026-07-11', completed: false },
  { id: 3, subject: 'Chemistry', topic: 'Organic Reactions', lastReviewed: '2026-07-04', nextReview: '2026-07-10', completed: false },
  { id: 4, subject: 'English', topic: 'Essay Structure', lastReviewed: '2026-07-02', nextReview: '2026-07-09', completed: true },
  { id: 5, subject: 'Pakistan Studies', topic: 'Lahore Resolution', lastReviewed: '2026-07-01', nextReview: '2026-07-08', completed: true },
]

export default function RecallRadar() {
  const [topics, setTopics] = useState(INITIAL_TOPICS)
  const [animatingId, setAnimatingId] = useState<number | null>(null)

  const active = topics.filter(t => !t.completed)
  const completed = topics.filter(t => t.completed)
  const progress = topics.length > 0 ? Math.round((completed.length / topics.length) * 100) : 0

  const handleReview = (id: number) => {
    setAnimatingId(id)
    setTimeout(() => {
      setTopics(prev => prev.map(t => t.id === id ? { ...t, completed: true, lastReviewed: new Date().toISOString().slice(0, 10) } : t))
      setAnimatingId(null)
    }, 600)
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-violet-950 border border-violet-800 flex items-center justify-center">
          <Brain size={16} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Recall Radar</h3>
          <p className="text-xs text-gray-500">Spaced repetition due today</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>Daily Progress</span>
          <span className="font-bold text-white">{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {[...active, ...completed].map(topic => (
          <div
            key={topic.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
              animatingId === topic.id
                ? 'border-violet-500 bg-violet-950/30 scale-95'
                : topic.completed
                  ? 'border-green-800/30 bg-green-950/10'
                  : 'border-gray-700/50 bg-gray-800/40 hover:border-violet-700/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                topic.completed ? 'bg-green-500' : 'bg-violet-400'
              }`} />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{topic.subject}</span>
                <p className="text-xs font-semibold text-white truncate">{topic.topic}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 mt-0.5">
                  <Calendar size={9} />
                  <span>Next: {topic.nextReview}</span>
                </div>
              </div>
            </div>

            {!topic.completed ? (
              <button
                onClick={() => handleReview(topic.id)}
                className="flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 shrink-0"
              >
                <RotateCcw size={12} />
                Review Now
              </button>
            ) : (
              <CheckCircle size={16} className="text-green-500 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
