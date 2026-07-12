'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Sparkles, BookOpen, Save, Trash2, Download,
  X, Loader2, ChevronRight, Globe, Zap, CheckCircle,
  Lightbulb, PenTool, HelpCircle, ClipboardList,
} from 'lucide-react'
import ResourceRecommender from '@/components/teacher/ResourceRecommender'

const C = {
  bg: '#f8f9fc', panel: '#ffffff', elevated: '#f1f3f8',
  border: 'rgba(15,23,42,0.08)', borderStrong: 'rgba(15,23,42,0.16)',
  steel: '#64748b', blue: '#2563eb', purple: '#7c3aed',
  emerald: '#10b981', amber: '#f59e0b', rose: '#ef4444',
  gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)',
  text: '#1f2937', textDim: 'rgba(31,41,55,0.55)',
}

interface LessonContent {
  hook: string
  explanation: string
  activity: string
  assessment: string
}

interface SavedPlan {
  _id: string
  topicName: string
  duration: number
  studentLevel: string
  language: 'Urdu' | 'English'
  content: LessonContent
  createdAt: string
}

const LOADING_MESSAGES = [
  'Analyzing pedagogical structures...',
  'Consulting curriculum standards...',
  'Crafting engaging hooks...',
  'Designing student activities...',
  'Formulating assessment questions...',
  'Applying Pakistani context...',
]

export default function LessonPlanner() {
  const [topicName, setTopicName] = useState('')
  const [duration, setDuration] = useState(40)
  const [studentLevel, setStudentLevel] = useState('')
  const [language, setLanguage] = useState<'Urdu' | 'English'>('English')
  const [generating, setGenerating] = useState(false)
  const [content, setContent] = useState<LessonContent | null>(null)
  const [error, setError] = useState('')
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Rotate loading messages
  React.useEffect(() => {
    if (!generating) return
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [generating])

  const handleGenerate = async () => {
    if (!topicName.trim() || !studentLevel.trim()) {
      setError('Please fill in topic name and student level')
      return
    }
    setGenerating(true)
    setError('')
    setContent(null)
    setLoadingMsgIdx(0)

    try {
      const res = await fetch('/api/teacher/lesson-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          topicName: topicName.trim(),
          duration,
          studentLevel: studentLevel.trim(),
          language,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setContent(data.content)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!content) return
    setSaving(true)
    try {
      const res = await fetch('/api/teacher/lesson-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          topicName: topicName.trim(),
          duration,
          studentLevel: studentLevel.trim(),
          language,
          content,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSavedId(data.plan._id)
      setTimeout(() => setSavedId(null), 3000)
      await fetchSavedPlans()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const fetchSavedPlans = async () => {
    try {
      const res = await fetch('/api/teacher/lesson-planner')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSavedPlans(data.plans || [])
    } catch (e) { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/teacher/lesson-planner?id=${id}`, { method: 'DELETE' })
      await fetchSavedPlans()
    } catch (e) { /* silent */ }
  }

  const handleExport = () => {
    if (!content || !contentRef.current) return
    const text = [
      `Lesson Plan: ${topicName}`,
      `Duration: ${duration} min | Level: ${studentLevel} | Language: ${language}`,
      '',
      `--- Opening Hook ---`,
      content.hook,
      '',
      `--- Main Explanation ---`,
      content.explanation,
      '',
      `--- Student Activity ---`,
      content.activity,
      '',
      `--- Assessment Question ---`,
      content.assessment,
    ].join('\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topicName.replace(/\s+/g, '_')}_lesson_plan.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sectionIcon = (key: string) => {
    switch (key) {
      case 'hook': return <Lightbulb size={20} />
      case 'explanation': return <BookOpen size={20} />
      case 'activity': return <PenTool size={20} />
      case 'assessment': return <HelpCircle size={20} />
      default: return <ClipboardList size={20} />
    }
  }

  const sectionColor = (key: string) => {
    switch (key) {
      case 'hook': return C.amber
      case 'explanation': return C.blue
      case 'activity': return C.purple
      case 'assessment': return C.emerald
      default: return C.steel
    }
  }

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
              <Brain color="white" size={20} />
            </div>
            AI Lesson Planner
          </h1>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 4, marginLeft: 50 }}>
            Generate pedagogically sound lesson plans with AI
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Bilingual Toggle */}
          <div style={{
            display: 'flex', background: C.elevated, borderRadius: 100,
            border: `1px solid ${C.border}`, overflow: 'hidden',
          }}>
            {(['English', 'Urdu'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  padding: '8px 18px', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: language === lang ? C.gradient : 'transparent',
                  color: language === lang ? 'white' : C.steel,
                  fontFamily: lang === 'Urdu' ? "'Noto Nastaliq Urdu',serif" : 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={14} />
                  {lang === 'Urdu' ? 'اردو' : 'English'}
                </span>
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowSaved(!showSaved); if (!showSaved) fetchSavedPlans() }}
            style={{
              padding: '10px 20px', borderRadius: 12, border: `1px solid ${C.border}`,
              background: C.panel, color: C.text, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <ClipboardList size={16} /> Saved Plans
          </motion.button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showSaved ? '1fr 360px' : '1fr', gap: 24 }}>
        {/* MAIN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
              padding: '28px 32px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
                  Topic / Lesson Title
                </label>
                <input
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Photosynthesis, Quadratic Equations..."
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '2px solid', borderColor: topicName ? C.blue : C.border,
                    background: C.elevated, fontSize: 14, color: C.text,
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 40)}
                  min={5}
                  max={180}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: `2px solid ${C.border}`, background: C.elevated,
                    fontSize: 14, color: C.text, outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: 'block' }}>
                  Student Level
                </label>
                <input
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value)}
                  placeholder="e.g. Class 9, Beginner..."
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '2px solid', borderColor: studentLevel ? C.blue : C.border,
                    background: C.elevated, fontSize: 14, color: C.text,
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={generating}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                background: generating ? C.elevated : C.gradient,
                color: generating ? C.textDim : 'white',
                fontSize: 16, fontWeight: 600,
                cursor: generating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {generating ? (
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <Sparkles size={18} /> Generate Lesson Plan
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.08)', borderRadius: 12,
                  padding: '12px 20px', color: C.rose, fontSize: 14,
                  border: `1px solid rgba(239,68,68,0.2)`,
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Generating State */}
          <AnimatePresence>
            {generating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
                  padding: '48px 32px', textAlign: 'center',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    border: '3px solid', borderColor: C.elevated,
                    borderTopColor: C.blue, margin: '0 auto 20px',
                  }}
                />
                <p style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </p>
                <p style={{ color: C.textDim, fontSize: 13, marginTop: 8 }}>
                  Crafting your {language === 'Urdu' ? 'اردو' : ''} lesson plan...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Content */}
          <AnimatePresence>
            {content && !generating && (
              <motion.div
                ref={contentRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
                }}>
                  {(['hook', 'explanation', 'activity', 'assessment'] as const).map((key, idx) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{
                        background: C.panel, borderRadius: 16,
                        border: `1px solid ${C.border}`,
                        borderTop: `3px solid ${sectionColor(key)}`,
                        padding: 20, gridColumn: key === 'explanation' ? '1 / -1' : 'auto',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ color: sectionColor(key) }}>
                          {sectionIcon(key)}
                        </span>
                        <h3 style={{
                          fontSize: 15, fontWeight: 700, color: C.text, margin: 0,
                          textTransform: 'capitalize',
                        }}>
                          {key === 'hook' ? 'Opening Hook' :
                           key === 'explanation' ? 'Main Explanation' :
                           key === 'activity' ? 'Student Activity' : 'Assessment Question'}
                        </h3>
                      </div>
                      <p style={{
                        fontSize: 14, lineHeight: 1.7, color: C.text, margin: 0,
                        fontFamily: language === 'Urdu' ? "'Noto Nastaliq Urdu',serif" : 'inherit',
                        direction: language === 'Urdu' ? 'rtl' : 'ltr',
                      }}>
                        {content[key]}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: '12px 28px', borderRadius: 12, border: 'none',
                      background: C.gradient, color: 'white', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    {saving ? (
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : savedId ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {savedId ? 'Saved!' : 'Save to Library'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExport}
                    style={{
                      padding: '12px 28px', borderRadius: 12, border: `1px solid ${C.border}`,
                      background: C.panel, color: C.text, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <Download size={16} /> Export as Text
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resource Recommender — show when topic is generated */}
          {content && !generating && (
            <ResourceRecommender topicId={topicName} />
          )}
        </div>

        {/* SIDEBAR: Saved Plans */}
        <AnimatePresence>
          {showSaved && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              style={{
                background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`,
                padding: 20, height: 'fit-content', maxHeight: 'calc(100vh - 120px)',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClipboardList size={16} /> Saved Plans
                </h3>
                <button
                  onClick={() => setShowSaved(false)}
                  style={{ border: 'none', background: C.elevated, borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: C.steel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              {savedPlans.length === 0 ? (
                <p style={{ color: C.textDim, fontSize: 13, textAlign: 'center', padding: 20 }}>
                  No saved plans yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {savedPlans.map((plan) => (
                    <motion.div
                      key={plan._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '14px 16px', borderRadius: 14,
                        background: C.elevated,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>
                            {plan.topicName}
                          </p>
                          <p style={{ fontSize: 12, color: C.textDim, margin: '4px 0 0' }}>
                            {plan.studentLevel} · {plan.duration} min · {plan.language}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          style={{
                            border: 'none', background: 'rgba(239,68,68,0.08)',
                            borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
                            color: C.rose, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px }
      `}</style>
    </div>
  )
}
