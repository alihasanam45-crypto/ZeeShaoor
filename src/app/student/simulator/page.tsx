'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Clock, Flag, ChevronLeft, ChevronRight, AlertCircle,
  CheckCircle, X, BookOpen, LayoutGrid, Send,
} from 'lucide-react'

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
type QuestionStatus = 'unanswered' | 'answered' | 'marked' | 'answered-marked'

interface Question {
  id: number
  text: string
  hasEquation: boolean
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correctKey?: 'A' | 'B' | 'C' | 'D'
}

interface QuestionState {
  selected: 'A' | 'B' | 'C' | 'D' | null
  marked: boolean
  status: QuestionStatus
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const EXAM_META = {
  title:   'Physics Class 10',
  subTitle: 'Grand Mock Test — BISE Lahore Pattern',
  total:   20,
  duration: 90 * 60, // 90 minutes in seconds
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    hasEquation: false,
    text: 'A car starts from rest and accelerates uniformly at 2 m/s². What is the velocity of the car after 10 seconds?',
    options: [
      { key: 'A', text: '10 m/s' },
      { key: 'B', text: '20 m/s' },
      { key: 'C', text: '15 m/s' },
      { key: 'D', text: '25 m/s' },
    ],
  },
  {
    id: 2,
    hasEquation: true,
    text: 'A body of mass 5 kg is moving with a velocity of 4 m/s. What is its kinetic energy?',
    options: [
      { key: 'A', text: '20 J' },
      { key: 'B', text: '40 J' },
      { key: 'C', text: '80 J' },
      { key: 'D', text: '100 J' },
    ],
  },
  {
    id: 3,
    hasEquation: true,
    text: 'The resistance of a conductor is 10 Ω. If the potential difference across it is 20 V, what is the current flowing through it?',
    options: [
      { key: 'A', text: '0.5 A' },
      { key: 'B', text: '2 A' },
      { key: 'C', text: '5 A' },
      { key: 'D', text: '200 A' },
    ],
  },
  {
    id: 4,
    hasEquation: false,
    text: 'Which of the following is NOT a vector quantity?',
    options: [
      { key: 'A', text: 'Velocity' },
      { key: 'B', text: 'Force' },
      { key: 'C', text: 'Speed' },
      { key: 'D', text: 'Acceleration' },
    ],
  },
  {
    id: 5,
    hasEquation: true,
    text: 'A wave has a frequency of 50 Hz and wavelength of 2 m. What is the speed of the wave?',
    options: [
      { key: 'A', text: '25 m/s' },
      { key: 'B', text: '52 m/s' },
      { key: 'C', text: '100 m/s' },
      { key: 'D', text: '0.04 m/s' },
    ],
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: i + 6,
    hasEquation: i % 3 === 0,
    text: `[Question ${i + 6}] Sample physics question about ${
      ['Newton\'s laws', 'thermodynamics', 'optics', 'electricity', 'magnetism',
       'waves', 'quantum mechanics', 'relativity', 'fluid mechanics', 'gravitation',
       'projectile motion', 'simple harmonic motion', 'nuclear physics', 'heat transfer', 'pressure'][i]
    }. This is a placeholder for the actual BISE board examination question content.`,
    options: [
      { key: 'A' as const, text: 'Option A — First possible answer' },
      { key: 'B' as const, text: 'Option B — Second possible answer' },
      { key: 'C' as const, text: 'Option C — Third possible answer' },
      { key: 'D' as const, text: 'Option D — Fourth possible answer' },
    ],
  })),
]

// --------- Helpers ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getStatusColor(status: QuestionStatus, isCurrent: boolean): string {
  if (isCurrent) return 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900 bg-gray-800 text-white'
  switch (status) {
    case 'answered':         return 'bg-emerald-500 text-white hover:bg-emerald-400'
    case 'marked':           return 'bg-violet-500 text-white hover:bg-violet-400'
    case 'answered-marked':  return 'bg-violet-500 text-white hover:bg-violet-400 ring-2 ring-emerald-400'
    default:                 return 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
  }
}

// --------- Confirm Modal ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function SubmitModal({
  answered,
  total,
  onConfirm,
  onCancel,
}: {
  answered: number
  total: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const unanswered = total - answered
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-3xl bg-gray-900 shadow-2xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-rose-600 to-orange-600" />

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-900 bg-opacity-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={22} className="text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Submit Exam?</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Answered',   value: answered,           color: 'text-emerald-400', bg: 'bg-emerald-900' },
              { label: 'Unanswered', value: unanswered,         color: 'text-rose-400',    bg: 'bg-rose-900'    },
              { label: 'Total',      value: total,              color: 'text-cyan-400',    bg: 'bg-cyan-900'    },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`flex flex-col items-center gap-1 p-3 rounded-xl ${bg} bg-opacity-30`}>
                <span className={`text-2xl font-black ${color}`}>{value}</span>
                <span className="text-xs text-gray-500 font-medium">{label}</span>
              </div>
            ))}
          </div>

          {unanswered > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-900 bg-opacity-20 mb-5">
              <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300 leading-relaxed">
                You have <strong>{unanswered} unanswered question{unanswered > 1 ? 's' : ''}</strong>.
                Unanswered questions will receive zero marks.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white transition-all"
            >
              Continue Exam
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-lg shadow-rose-900 transition-all hover:scale-105"
            >
              Submit Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --------- Result Screen ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ResultScreen({
  states,
  timeTaken,
  onReview,
}: {
  states: Record<number, QuestionState>
  timeTaken: number
  onReview: () => void
}) {
  const answered = Object.values(states).filter((s) => s.selected !== null).length
  const score    = Math.round((answered / EXAM_META.total) * 100)

  const grade =
    score >= 80 ? { label: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-900' } :
    score >= 60 ? { label: 'B',  color: 'text-cyan-400',    bg: 'bg-cyan-900'    } :
    score >= 40 ? { label: 'C',  color: 'text-yellow-400',  bg: 'bg-yellow-900'  } :
                  { label: 'F',  color: 'text-rose-400',    bg: 'bg-rose-900'    }

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 mx-auto">
          <div className={`absolute inset-0 rounded-full ${grade.bg} opacity-30 blur-xl`} />
          <div className={`relative w-28 h-28 rounded-full ${grade.bg} bg-opacity-40 flex flex-col items-center justify-center`}>
            <span className={`text-5xl font-black ${grade.color}`}>{grade.label}</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Exam Complete</h1>
        <p className="text-gray-500 text-sm mb-8">{EXAM_META.title} · {EXAM_META.subTitle}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Score',      value: `${score}%`,                      color: grade.color },
            { label: 'Attempted',  value: `${answered}/${EXAM_META.total}`, color: 'text-cyan-400' },
            { label: 'Time Taken', value: formatTime(timeTaken),            color: 'text-violet-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-2xl bg-gray-900">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReview}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-gray-300 border border-gray-700 hover:border-cyan-500 hover:text-cyan-400 transition-all"
          >
            <BookOpen size={16} /> Review Answers
          </button>
          <Link
            href="/student/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-cyan-900 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #0e7490, #7c3aed)' }}
          >
            <LayoutGrid size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

// --------- Page ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function SimulatorPage() {
  const [current,     setCurrent]     = useState(1)
  const [states,      setStates]      = useState<Record<number, QuestionState>>(
    Object.fromEntries(
      Array.from({ length: EXAM_META.total }, (_, i) => [
        i + 1,
        { selected: null, marked: false, status: 'unanswered' as QuestionStatus },
      ])
    )
  )
  const [timeLeft,    setTimeLeft]    = useState(EXAM_META.duration)
  const [showSubmit,  setShowSubmit]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [timeTaken,   setTimeTaken]   = useState(0)
  const [navOpen,     setNavOpen]     = useState(false)  // mobile nav panel

  // Countdown timer
  useEffect(() => {
    if (submitted) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [submitted])

  const timeLow    = timeLeft <= 300  // 5 minutes warning
  const timeCritical = timeLeft <= 60 // 1 minute critical

  const q = QUESTIONS[current - 1]
  const currentState = states[current]

  const answered = Object.values(states).filter((s) => s.selected !== null).length

  const updateState = useCallback(
    (qId: number, patch: Partial<QuestionState>) => {
      setStates((prev) => {
        const old = prev[qId]
        const updated = { ...old, ...patch }
        updated.status =
          updated.selected !== null && updated.marked ? 'answered-marked' :
          updated.selected !== null                   ? 'answered'        :
          updated.marked                              ? 'marked'          :
          'unanswered'
        return { ...prev, [qId]: updated }
      })
    },
    []
  )

  function selectOption(key: 'A' | 'B' | 'C' | 'D') {
    updateState(current, { selected: key })
  }

  function toggleMark() {
    updateState(current, { marked: !currentState.marked })
  }

  function clearSelection() {
    updateState(current, { selected: null })
  }

  function handleSubmit() {
    setTimeTaken(EXAM_META.duration - timeLeft)
    setSubmitted(true)
    setShowSubmit(false)
  }

  if (submitted) {
    return (
      <ResultScreen
        states={states}
        timeTaken={timeTaken}
        onReview={() => setSubmitted(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col overflow-hidden">

      {/* ════════════════════════════════════════════════════════════════
          TOP NAV BAR — Fixed
      ════════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-4 sm:px-6 gap-3 bg-gray-900 border-b border-gray-800 shadow-xl shadow-black">

        {/* Left — Logo + Exam Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0e7490, #7c3aed)' }}
          >
            Z
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">{EXAM_META.title}</p>
            <p className="text-xs text-gray-600 truncate hidden sm:block">{EXAM_META.subTitle}</p>
          </div>
        </div>

        {/* Center — Countdown Timer */}
        <div className={[
          'flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-lg transition-all duration-300',
          timeCritical
            ? 'bg-rose-900 bg-opacity-50 text-rose-400 animate-pulse ring-2 ring-rose-500 ring-opacity-50'
            : timeLow
              ? 'bg-amber-900 bg-opacity-40 text-amber-400'
              : 'bg-gray-800 text-cyan-400',
        ].join(' ')}>
          <Clock
            size={18}
            className={timeCritical ? 'text-rose-400' : timeLow ? 'text-amber-400' : 'text-cyan-400'}
          />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Right — Submit button + mobile nav toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile navigator toggle */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="lg:hidden p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle question navigator"
          >
            <LayoutGrid size={18} />
          </button>

          <button
            onClick={() => setShowSubmit(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900 transition-all duration-200 hover:scale-105"
          >
            <Send size={15} />
            <span className="hidden sm:inline">End Exam</span>
          </button>
        </div>
      </header>

      {/* Confirm submit modal */}
      {showSubmit && (
        <SubmitModal
          answered={answered}
          total={EXAM_META.total}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmit(false)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════
          BODY — Two columns
      ════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex pt-16 overflow-hidden">

        {/* ------ LEFT: Question Area (70%) --------------------------------------------------------------------------------------------- */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">

            {/* Question header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-gray-600">
                  Question
                </span>
                <span className="text-2xl font-black text-white">{current}</span>
                <span className="text-gray-600 font-semibold">/ {EXAM_META.total}</span>

                {currentState.status === 'answered' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-900 bg-opacity-50 text-emerald-400">
                    <CheckCircle size={11} /> Saved
                  </span>
                )}
              </div>

              {/* Mark for Review */}
              <button
                onClick={toggleMark}
                className={[
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                  currentState.marked
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900 scale-105'
                    : 'bg-gray-800 text-gray-500 hover:bg-violet-900 hover:bg-opacity-30 hover:text-violet-400',
                ].join(' ')}
              >
                <Flag size={13} />
                {currentState.marked ? 'Marked' : 'Mark for Review'}
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-gray-800 mb-8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
                style={{ width: `${(current / EXAM_META.total) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="relative rounded-2xl bg-gray-900 p-6 sm:p-8 mb-6 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-600 to-violet-600 opacity-60" />

              {/* Question text */}
              <p className="text-base sm:text-lg text-gray-100 leading-relaxed font-medium mb-6">
                {q.text}
              </p>

              {/* LaTeX equation placeholder */}
              {q.hasEquation && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-cyan-900 bg-opacity-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
                      Equation / Formula
                    </p>
                    <p className="text-sm text-gray-500 font-mono italic">
                      [ LaTeX / Math Equation Engine Render — KaTeX integration pending ]
                    </p>
                  </div>
                </div>
              )}

              {/* Options grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map(({ key, text }) => {
                  const isSelected = currentState.selected === key
                  return (
                    <button
                      key={key}
                      onClick={() => selectOption(key)}
                      className={[
                        'group relative flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 overflow-hidden',
                        isSelected
                          ? 'border-2 border-cyan-500 bg-cyan-900 bg-opacity-20 shadow-lg shadow-cyan-900'
                          : 'border-2 border-gray-800 bg-gray-800 hover:border-gray-600 hover:bg-gray-700',
                      ].join(' ')}
                    >
                      {/* Inner top line when selected */}
                      {isSelected && (
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500 to-violet-500" />
                      )}

                      {/* Key badge */}
                      <span className={[
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black transition-all duration-200',
                        isSelected
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-900'
                          : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-200',
                      ].join(' ')}>
                        {key}
                      </span>

                      {/* Option text */}
                      <span className={[
                        'text-sm font-medium leading-relaxed pt-1 transition-colors',
                        isSelected ? 'text-cyan-100' : 'text-gray-400 group-hover:text-gray-200',
                      ].join(' ')}>
                        {text}
                      </span>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <CheckCircle size={16} className="flex-shrink-0 ml-auto mt-1 text-cyan-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between gap-3 pb-8">
              <button
                onClick={() => setCurrent((c) => Math.max(1, c - 1))}
                disabled={current === 1}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                onClick={clearSelection}
                disabled={currentState.selected === null}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-800 hover:bg-gray-700 hover:text-rose-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <X size={14} /> Clear
              </button>

              <button
                onClick={() => {
                  if (current < EXAM_META.total) setCurrent((c) => c + 1)
                  else setShowSubmit(true)
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-cyan-900 transition-all duration-200 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #0e7490, #7c3aed)' }}
              >
                {current < EXAM_META.total ? (
                  <> Save & Next <ChevronRight size={16} /> </>
                ) : (
                  <> Review & Submit <Send size={14} /> </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ------ RIGHT: Navigator Panel (30%) ------------------------------------------------------------------------------------ */}
        {/* Desktop — always visible */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-l border-gray-800 bg-[#0a0a1a] overflow-y-auto">
          <NavigatorPanel
            states={states}
            current={current}
            answered={answered}
            onSelect={(n) => setCurrent(n)}
          />
        </aside>

        {/* Mobile — slide over */}
        {navOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black bg-opacity-60 lg:hidden"
              onClick={() => setNavOpen(false)}
            />
            <aside className="fixed top-16 right-0 bottom-0 z-40 w-72 flex flex-col border-l border-gray-800 bg-[#0a0a1a] overflow-y-auto lg:hidden shadow-2xl">
              <NavigatorPanel
                states={states}
                current={current}
                answered={answered}
                onSelect={(n) => { setCurrent(n); setNavOpen(false) }}
              />
            </aside>
          </>
        )}
      </main>
    </div>
  )
}

// --------- Navigator Panel Component ------------------------------------------------------------------------------------------------------------------------------------------------
function NavigatorPanel({
  states,
  current,
  answered,
  onSelect,
}: {
  states: Record<number, QuestionState>
  current: number
  answered: number
  onSelect: (n: number) => void
}) {
  const marked   = Object.values(states).filter((s) => s.marked).length
  const total    = EXAM_META.total

  return (
    <div className="flex flex-col h-full p-4">

      {/* Panel header */}
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3">
          Question Navigator
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Answered',   value: answered,       color: 'text-emerald-400', dot: 'bg-emerald-500' },
            { label: 'Skipped',    value: total - answered, color: 'text-gray-400',  dot: 'bg-gray-700'    },
            { label: 'Flagged',    value: marked,         color: 'text-violet-400',  dot: 'bg-violet-500'  },
          ].map(({ label, value, color, dot }) => (
            <div key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-900">
              <span className={`text-lg font-black ${color}`}>{value}</span>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of question buttons */}
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1
            const s = states[n]
            const isCurrent = current === n
            return (
              <button
                key={n}
                onClick={() => onSelect(n)}
                className={[
                  'w-full aspect-square rounded-xl text-xs font-black transition-all duration-200 hover:scale-110',
                  getStatusColor(s.status, isCurrent),
                ].join(' ')}
              >
                {n}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-gray-800 space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">Legend</p>
        {[
          { dot: 'bg-gray-800 border border-gray-700',  label: 'Unanswered' },
          { dot: 'bg-emerald-500',                       label: 'Answered'   },
          { dot: 'bg-violet-500',                        label: 'Marked for Review' },
          { dot: 'ring-2 ring-cyan-400 bg-gray-800',     label: 'Current Question'  },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className={`w-4 h-4 rounded-md flex-shrink-0 ${dot}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Submit shortcut */}
      <button
        onClick={() => {}}
        className="mt-4 w-full py-3 rounded-xl text-xs font-bold text-rose-400 border border-rose-900 hover:bg-rose-900 hover:bg-opacity-30 hover:text-rose-300 transition-all flex items-center justify-center gap-2"
      >
        <AlertCircle size={13} />
        {answered}/{total} Answered · Submit
      </button>
    </div>
  )
}
