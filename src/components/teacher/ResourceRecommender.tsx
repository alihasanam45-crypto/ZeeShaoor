'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Star, Bookmark, ExternalLink, Loader2 } from 'lucide-react'

interface Resource {
  _id: string
  title: string
  url: string
  resourceType: string
  avgRating: number
  ratings: { teacherId: string; score: number }[]
  savedBy: string[]
}

const C = {
  panel: '#ffffff', elevated: '#f1f3f8',
  border: 'rgba(15,23,42,0.08)', borderStrong: 'rgba(15,23,42,0.16)',
  steel: '#64748b', blue: '#2563eb', purple: '#7c3aed',
  emerald: '#10b981', amber: '#f59e0b',
  text: '#1f2937', textDim: 'rgba(31,41,55,0.55)',
  gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)',
}

export default function ResourceRecommender({ topicId }: { topicId: string }) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!topicId) return
    const fetchResources = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/teacher/resources?topicId=${encodeURIComponent(topicId)}`)
        if (!res.ok) throw new Error('Failed to load resources')
        const data = await res.json()
        setResources(data.resources || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchResources()
  }, [topicId])

  const handleRate = async (resourceId: string, score: number) => {
    try {
      const res = await fetch(`/api/teacher/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rate', score }),
      })
      if (!res.ok) throw new Error()
      setRatingMap((prev) => ({ ...prev, [resourceId]: score }))
      // Optimistic update
      setResources((prev) =>
        prev.map((r) => {
          if (r._id === resourceId) {
            const newRatings = [...r.ratings, { teacherId: 'me', score }]
            const avg =
              newRatings.reduce((s, r) => s + r.score, 0) / newRatings.length
            return { ...r, avgRating: Math.round(avg * 10) / 10, ratings: newRatings }
          }
          return r
        }),
      )
    } catch (e) {
      // silent
    }
  }

  const handleToggleSave = async (resourceId: string) => {
    try {
      const res = await fetch(`/api/teacher/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-save' }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.saved) {
        setSavedIds((prev) => new Set(prev).add(resourceId))
      } else {
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.delete(resourceId)
          return next
        })
      }
    } catch (e) {
      // silent
    }
  }

  const renderStars = (resourceId: string, currentAvg: number) => {
    return (
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = ratingMap[resourceId]
            ? star <= ratingMap[resourceId]
            : star <= Math.round(currentAvg)
          return (
            <motion.button
              key={star}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.preventDefault()
                handleRate(resourceId, star)
              }}
              style={{
                border: 'none', background: 'none', cursor: 'pointer', padding: 2,
              }}
            >
              <Star
                size={16}
                fill={filled ? C.amber : 'none'}
                color={filled ? C.amber : C.borderStrong}
                style={{ transition: 'all 0.2s' }}
              />
            </motion.button>
          )
        })}
        <span style={{ fontSize: 12, color: C.textDim, marginLeft: 4 }}>
          {currentAvg.toFixed(1)}
        </span>
      </div>
    )
  }

  if (!topicId) return null

  return (
    <div style={{
      background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
      padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(37,99,235,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen size={18} color={C.blue} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>
            Recommended Resources
          </h3>
          <p style={{ fontSize: 12, color: C.textDim, margin: '2px 0 0' }}>
            Top-rated materials for this topic
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: C.steel }} />
        </div>
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', padding: 20 }}>{error}</p>
      ) : resources.length === 0 ? (
        <p style={{ color: C.textDim, fontSize: 13, textAlign: 'center', padding: 20 }}>
          No resources with 4+ rating for this topic yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {resources.map((r, idx) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                padding: '16px 18px', borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: idx === 0 ? 'rgba(37,99,235,0.04)' : C.elevated,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      color: C.blue, background: 'rgba(37,99,235,0.1)',
                      padding: '2px 8px', borderRadius: 100,
                    }}>
                      {r.resourceType}
                    </span>
                    {idx === 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: C.emerald,
                        background: 'rgba(16,185,129,0.1)',
                        padding: '2px 8px', borderRadius: 100,
                      }}>
                        Best Match
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{r.title}</p>
                  <div style={{ marginTop: 8 }}>{renderStars(r._id, r.avgRating)}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <motion.a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: C.elevated, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: C.steel, border: `1px solid ${C.border}`,
                    }}
                  >
                    <ExternalLink size={15} />
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.preventDefault(); handleToggleSave(r._id) }}
                    style={{
                      width: 34, height: 34, borderRadius: 10,
                      border: `1px solid ${savedIds.has(r._id) ? C.emerald : C.border}`,
                      background: savedIds.has(r._id) ? 'rgba(16,185,129,0.1)' : C.elevated,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Bookmark
                      size={15}
                      fill={savedIds.has(r._id) ? C.emerald : 'none'}
                      color={savedIds.has(r._id) ? C.emerald : C.steel}
                      style={{ transition: 'all 0.3s' }}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
