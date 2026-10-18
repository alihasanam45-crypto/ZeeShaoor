'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Star, GitBranch, Plus, Clock, X, Loader2,
  Edit3, Trash2, BookOpen, ChevronRight, Crown,
  Pin, History, MessageSquare,
} from 'lucide-react'

const C = {
  bg: '#f8f9fc', panel: '#ffffff', elevated: '#f1f3f8',
  border: 'rgba(15,23,42,0.08)', borderStrong: 'rgba(15,23,42,0.16)',
  steel: '#64748b', blue: '#2563eb', purple: '#7c3aed',
  emerald: '#10b981', amber: '#f59e0b', rose: '#ef4444',
  gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)',
  text: '#1f2937', textDim: 'rgba(31,41,55,0.55)',
  gold: '#f59e0b',
}

interface PlanData {
  _id: string
  subjectId: string
  title: string
  authorName?: string
  content: string
  monthlyRating: number
  ratingCount: number
  isPinned: boolean
  createdAt: string
}

interface VersionData {
  _id: string
  editorName?: string
  changesMade: string
  timestamp: string
}

export default function CollabBoard() {
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newContent, setNewContent] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editChanges, setEditChanges] = useState('')
  const [saving, setSaving] = useState(false)
  const [versions, setVersions] = useState<VersionData[]>([])
  const [showVersions, setShowVersions] = useState(false)
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({})
  const drawerRef = useRef<HTMLDivElement>(null)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const url = `/api/teacher/collab${subjectFilter ? `?subjectId=${encodeURIComponent(subjectFilter)}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPlans(data.plans || [])
    } catch (e) { /* silent */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchPlans() }, [subjectFilter])

  const handleCreate = async () => {
    if (!newTitle.trim() || !newSubject.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/teacher/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          subjectId: newSubject.trim(),
          title: newTitle.trim(),
          content: newContent,
        }),
      })
      if (!res.ok) throw new Error()
      setShowCreate(false)
      setNewTitle('')
      setNewSubject('')
      setNewContent('')
      await fetchPlans()
    } catch (e) { /* silent */ } finally { setCreating(false) }
  }

  const handleSelectPlan = async (plan: PlanData) => {
    setSelectedPlan(plan)
    setEditContent(plan.content)
    setEditChanges('')
  }

  const handleSaveEdit = async () => {
    if (!selectedPlan || !editChanges.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/teacher/collab/${selectedPlan._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-content',
          newContent: editContent,
          changesMade: editChanges,
        }),
      })
      if (!res.ok) throw new Error()
      await fetchPlans()
      setEditChanges('')
    } catch (e) { /* silent */ } finally { setSaving(false) }
  }

  const handleRate = async (planId: string, score: number) => {
    try {
      const res = await fetch(`/api/teacher/collab/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rate', score }),
      })
      if (!res.ok) throw new Error()
      setRatingMap((m) => ({ ...m, [planId]: score }))
      await fetchPlans()
    } catch (e) { /* silent */ }
  }

  const handleTogglePin = async (planId: string) => {
    try {
      await fetch(`/api/teacher/collab/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-pin' }),
      })
      await fetchPlans()
    } catch (e) { /* silent */ }
  }

  const handleDelete = async (planId: string) => {
    try {
      await fetch(`/api/teacher/collab/${planId}`, { method: 'DELETE' })
      if (selectedPlan?._id === planId) setSelectedPlan(null)
      await fetchPlans()
    } catch (e) { /* silent */ }
  }

  const loadVersions = async (planId: string) => {
    setVersionsLoading(true)
    setShowVersions(true)
    try {
      const res = await fetch(`/api/teacher/collab/${planId}/versions`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVersions(data.versions || [])
    } catch (e) { setVersions([]) } finally { setVersionsLoading(false) }
  }

  const pinnedPlans = plans.filter((p) => p.isPinned)
  const regularPlans = plans.filter((p) => !p.isPinned)

  const RatingStars = ({ planId, rating }: { planId: string; rating: number }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = ratingMap[planId] ? star <= ratingMap[planId] : star <= Math.round(rating)
        return (
          <motion.button
            key={star}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); handleRate(planId, star) }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 1 }}
          >
            <Star
              size={14}
              fill={filled ? C.amber : 'none'}
              color={filled ? C.amber : C.borderStrong}
            />
          </motion.button>
        )
      })}
    </div>
  )

  const PlanCard = ({ plan, isPinned: pinned }: { plan: PlanData; isPinned: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: pinned ? '0 12px 40px rgba(245,158,11,0.15)' : '0 8px 30px rgba(0,0,0,0.06)' }}
      onClick={() => handleSelectPlan(plan)}
      style={{
        background: pinned
          ? 'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(251,191,36,0.02))'
          : C.panel,
        borderRadius: 16,
        border: pinned
          ? '2px solid rgba(245,158,11,0.25)'
          : `1px solid ${C.border}`,
        padding: '20px 22px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: pinned ? '0 0 30px rgba(245,158,11,0.08)' : 'none',
      }}
    >
      {pinned && (
        <>
          <div style={{
            position: 'absolute', top: -20, right: -20, opacity: 0.08,
            transform: 'rotate(15deg)',
          }}>
            <Crown size={100} color={C.amber} />
          </div>
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
            borderRadius: 100, padding: '3px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 700, color: 'white',
            boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
          }}>
            <Crown size={12} /> Plan of the Month
          </div>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 16, fontWeight: 700, color: C.text, margin: 0,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {pinned && <Star size={16} color={C.amber} fill={C.amber} />}
            {plan.title}
          </h3>
          <p style={{ fontSize: 12, color: C.textDim, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={12} /> {plan.subjectId}
            <span>·</span>
            {plan.authorName && <><Users size={12} /> {plan.authorName}</>}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RatingStars planId={plan._id} rating={plan.monthlyRating} />
          <span style={{ fontSize: 12, color: C.textDim }}>
            {plan.monthlyRating.toFixed(1)} ({plan.ratingCount})
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); loadVersions(plan._id) }}
            style={{
              border: `1px solid ${C.border}`, background: C.elevated,
              borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.steel,
            }}
          >
            <GitBranch size={13} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleTogglePin(plan._id) }}
            style={{
              border: pinned ? '1px solid rgba(245,158,11,0.3)' : `1px solid ${C.border}`,
              background: pinned ? 'rgba(245,158,11,0.08)' : C.elevated,
              borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: pinned ? C.amber : C.steel,
            }}
          >
            <Pin size={13} />
          </motion.button>
          {!pinned && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); handleDelete(plan._id) }}
              style={{
                border: 'none', background: 'rgba(239,68,68,0.08)',
                borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.rose,
              }}
            >
              <Trash2 size={13} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, fontFamily: "'Inter',system-ui,sans-serif",
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: C.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users color="white" size={20} />
            </div>
            Collaborative Planning Board
          </h1>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 4, marginLeft: 50 }}>
            Git-like version control for shared lesson plans
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          style={{
            padding: '12px 24px', borderRadius: 12, border: 'none',
            background: C.gradient, color: 'white', fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          }}
        >
          <Plus size={18} /> New Plan
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPlan ? '1fr 400px' : '1fr', gap: 24 }}>
        {/* LEFT: Plan Grid */}
        <div>
          {/* Filter */}
          <div style={{ marginBottom: 20 }}>
            <input
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              placeholder="Filter by subject (e.g. Physics, Urdu)..."
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: `2px solid ${C.border}`, background: C.panel,
                fontSize: 14, color: C.text, outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: C.steel }} />
            </div>
          ) : plans.length === 0 ? (
            <div style={{
              background: C.panel, borderRadius: 20, padding: 60,
              textAlign: 'center', border: `1px solid ${C.border}`,
            }}>
              <Users size={48} color={C.textDim} style={{ marginBottom: 16 }} />
              <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>
                No Plans Yet
              </h3>
              <p style={{ color: C.textDim, fontSize: 14, marginTop: 8 }}>
                Create the first collaborative plan.
              </p>
            </div>
          ) : (
            <>
              {/* Pinned: Highest Rated Plan of the Month */}
              {pinnedPlans.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Crown size={18} color={C.amber} />
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>
                      Plan of the Month
                    </h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                    {pinnedPlans.map((p) => (
                      <PlanCard key={p._id} plan={p} isPinned />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Plans */}
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} color={C.steel} /> All Plans
                  <span style={{ fontSize: 13, fontWeight: 400, color: C.textDim }}>({regularPlans.length})</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                  {regularPlans.map((p) => (
                    <PlanCard key={p._id} plan={p} isPinned={false} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Plan Detail Drawer */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div
              ref={drawerRef}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              style={{
                background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
                padding: 24, height: 'fit-content', maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto', position: 'sticky', top: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>
                    {selectedPlan.title}
                  </h3>
                  <p style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>
                    {selectedPlan.subjectId} · {selectedPlan.authorName || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedPlan(null); setShowVersions(false) }}
                  style={{ border: 'none', background: C.elevated, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: C.steel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content Editor */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
                  Plan Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: `2px solid ${C.border}`, background: C.elevated,
                    fontSize: 14, color: C.text, resize: 'vertical',
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
                  What did you change?
                </label>
                <input
                  value={editChanges}
                  onChange={(e) => setEditChanges(e.target.value)}
                  placeholder="e.g. Added activity section, fixed explanation..."
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: `2px solid ${C.border}`, background: C.elevated,
                    fontSize: 14, color: C.text, outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveEdit}
                  disabled={!editChanges.trim() || saving}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                    background: editChanges.trim() && !saving ? C.gradient : C.elevated,
                    color: editChanges.trim() && !saving ? 'white' : C.textDim,
                    fontSize: 14, fontWeight: 600, cursor: editChanges.trim() && !saving ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {saving ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Edit3 size={16} />
                  )}
                  {saving ? 'Saving...' : 'Save Version'}
                </motion.button>
              </div>

              {/* Version History */}
              <div style={{ marginTop: 24 }}>
                <div
                  onClick={() => { if (!showVersions) loadVersions(selectedPlan._id); else setShowVersions(!showVersions) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '10px 0', borderTop: `1px solid ${C.border}`,
                    marginTop: 8,
                  }}
                >
                  <History size={16} color={C.steel} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                    Version History
                  </span>
                  <ChevronRight size={14} color={C.steel}
                    style={{ transform: showVersions ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </div>

                <AnimatePresence>
                  {showVersions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {versionsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: C.steel }} />
                        </div>
                      ) : versions.length === 0 ? (
                        <p style={{ color: C.textDim, fontSize: 13, padding: 12 }}>No version history yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                          {versions.map((v, idx) => (
                            <div key={v._id} style={{
                              padding: '10px 14px', borderRadius: 10,
                              background: C.elevated, borderLeft: `3px solid ${idx === 0 ? C.blue : C.borderStrong}`,
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ fontWeight: 600, color: C.text }}>{v.editorName || 'Unknown'}</span>
                                <span style={{ color: C.textDim, fontSize: 12 }}>
                                  {new Date(v.timestamp).toLocaleDateString()} {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p style={{ fontSize: 12, color: C.textDim, margin: '4px 0 0' }}>
                                {v.changesMade}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 50, padding: '20px',
            }}
            onClick={() => { if (!creating) setShowCreate(false) }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: C.panel, borderRadius: 24, padding: 40,
                maxWidth: 480, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  position: 'absolute', top: 16, right: 16, border: 'none',
                  background: C.elevated, borderRadius: '50%', width: 36,
                  height: 36, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: C.steel,
                }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: C.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Plus color="white" size={26} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
                  New Collaborative Plan
                </h2>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
                  Subject
                </label>
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Physics, Urdu..."
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '2px solid', borderColor: newSubject ? C.blue : C.border,
                    background: C.elevated, fontSize: 14, color: C.text,
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
                  Plan Title
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chapter 5: Lesson Plan"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '2px solid', borderColor: newTitle ? C.blue : C.border,
                    background: C.elevated, fontSize: 14, color: C.text,
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
                  Initial Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste or write the plan content..."
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '2px solid', borderColor: C.border, background: C.elevated,
                    fontSize: 14, color: C.text, resize: 'vertical', outline: 'none',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newSubject.trim() || creating}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                  background: newTitle.trim() && newSubject.trim() && !creating
                    ? C.gradient : C.elevated,
                  color: newTitle.trim() && newSubject.trim() && !creating ? 'white' : C.textDim,
                  fontSize: 16, fontWeight: 600,
                  cursor: newTitle.trim() && newSubject.trim() && !creating ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {creating ? (
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <MessageSquare size={18} />
                )}
                {creating ? 'Creating...' : 'Create Plan'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px }
      `}</style>
    </div>
  )
}
