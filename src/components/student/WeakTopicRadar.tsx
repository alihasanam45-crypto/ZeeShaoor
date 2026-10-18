'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ChevronRight, Loader2, CheckCircle, TrendingUp } from 'lucide-react'

interface WeakTopicItem {
  subject: string
  chapter: string
  totalAttempts: number
  correctCount: number
  wrongCount: number
  currentScore: number
  isResolved: boolean
  lastAttempted: string
}

function getScoreColor(score: number, isResolved: boolean): string {
  if (isResolved) return 'bg-emerald-500'
  if (score >= 60) return 'bg-indigo-500'
  if (score >= 40) return 'bg-amber-400'
  return 'bg-red-500'
}

function getScoreTextColor(score: number, isResolved: boolean): string {
  if (isResolved) return 'text-emerald-600'
  if (score >= 60) return 'text-indigo-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-500'
}

export default function WeakTopicRadar() {
  const router = useRouter()
  const [activeTopics, setActiveTopics] = useState<WeakTopicItem[]>([])
  const [resolvedTopics, setResolvedTopics] = useState<WeakTopicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const fetchedRef = useRef(false)

  const fetchData = useCallback(async () => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    try {
      const res = await fetch('/api/student/weak-topics')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Data load nahi hua')
      setActiveTopics(json.data?.weak || [])
      setResolvedTopics(json.data?.resolved || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const allTopics = [...activeTopics, ...resolvedTopics]
  const hasData = allTopics.length > 0

  return (
    <div>
      {/* Meta row — the card that hosts this widget owns the title */}
      {!loading && !error && hasData && (
        <div className="mb-5 flex items-center justify-end">
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500">
            {activeTopics.length} active
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !hasData && (
        <div className="py-8 text-center">
          <TrendingUp size={28} className="mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No weak topics detected</p>
          <p className="mt-1 text-xs text-slate-400">Keep attempting quizzes to build your profile</p>
        </div>
      )}

      {/* Topics List */}
      {!loading && !error && hasData && (
        <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
          {allTopics.map((topic, i) => {
            const barColor = getScoreColor(topic.currentScore, topic.isResolved)
            const txtColor = getScoreTextColor(topic.currentScore, topic.isResolved)

            return (
              <div
                key={`${topic.subject}-${topic.chapter}-${i}`}
                className={`rounded-2xl border p-4 transition-all ${
                  topic.isResolved
                    ? 'border-emerald-100 bg-emerald-50/60'
                    : 'border-slate-100 bg-slate-50 hover:border-red-200'
                }`}
              >
                {/* Row 1: Subject + Chapter + Score */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {topic.subject}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                      {topic.chapter}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <span className={`text-lg font-black ${txtColor}`}>
                      {topic.currentScore}%
                    </span>
                    {topic.isResolved && (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle size={10} />
                        Resolved
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${topic.currentScore}%` }}
                  />
                </div>

                {/* Row 2: Stats + Practice Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
                    <span>
                      Wrong: <strong className="text-red-500">{topic.wrongCount}</strong>
                    </span>
                    <span>
                      Total: <strong className="text-slate-600">{topic.totalAttempts}</strong>
                    </span>
                    {!topic.isResolved && topic.wrongCount >= 3 && (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertTriangle size={9} />
                        AI Flagged
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const params = new URLSearchParams({
                        subject: topic.subject,
                        chapter: topic.chapter,
                      })
                      router.push(`/student/study?${params.toString()}`)
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-500"
                  >
                    Practice Now
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
