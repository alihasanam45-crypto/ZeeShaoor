'use client'

import { useState, type CSSProperties } from 'react'

/* ================================================================== */
/*  Content for the four subjects the landing page already claims are
    live (see CURRICULUM in page.tsx). Nothing here is fetched from the
    real question bank — this is the same kind of illustrative sample
    the static sheet always was, just four of them instead of one.
    Facts are kept genuinely correct (pH 7 is neutral, zinc + dilute
    HCl gives hydrogen, the cell is the basic unit of life, etc.) since
    this is public-facing curriculum content, not filler.               */
/* ================================================================== */

type McqItem = {
  prompt: string
  correctIndex: 0 | 1 | 2 | 3
}

type SheetSample = {
  subject: string
  grade: string
  chapters: string
  mcq: [McqItem, McqItem]
  shortA: string
  shortUrdu: string
  shortWriting: string
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

const SHEET_SAMPLES: SheetSample[] = [
  {
    subject: 'Physics',
    grade: 'Class 9',
    chapters: 'ch. 1–6',
    mcq: [
      { prompt: 'The SI unit of electric charge is', correctIndex: 1 },
      { prompt: 'Focal length of a convex lens is', correctIndex: 0 },
    ],
    shortA: 'Define the moment of a force and state its unit.',
    shortUrdu: 'عدسے کی قوّت سے کیا مراد ہے؟ مثال دے کر واضح کریں۔',
    shortWriting: 'State the law of conservation of momentum',
  },
  {
    subject: 'Computer',
    grade: 'Class 10',
    chapters: 'ch. 1–8',
    mcq: [
      { prompt: 'Which of these is volatile memory?', correctIndex: 1 },
      { prompt: "HTML primarily defines a webpage's", correctIndex: 2 },
    ],
    shortA: 'Define an algorithm and give one real-life example.',
    shortUrdu: 'ڈیٹا بیس سے کیا مراد ہے؟ اس کا ایک استعمال بیان کریں۔',
    shortWriting: 'Differentiate between a compiler and an interpreter',
  },
  {
    subject: 'Biology',
    grade: 'Class 10',
    chapters: 'ch. 1–10',
    mcq: [
      { prompt: 'The basic structural unit of life is the', correctIndex: 1 },
      { prompt: 'Which organ pumps blood throughout the body?', correctIndex: 2 },
    ],
    shortA: 'Differentiate between mitosis and meiosis.',
    shortUrdu: 'خون کی چار اقسام کون کون سی ہیں؟',
    shortWriting: 'Explain the process of photosynthesis in plants',
  },
  {
    subject: 'Chemistry',
    grade: 'Class 10',
    chapters: 'ch. 14–26',
    mcq: [
      { prompt: 'The pH value of a neutral solution is', correctIndex: 1 },
      { prompt: 'Zinc reacting with dilute HCl produces', correctIndex: 1 },
    ],
    shortA: 'State the law of conservation of mass.',
    shortUrdu: 'تیزاب اور بیس میں کیا فرق ہے؟',
    shortWriting: 'Write the chemical formula for the reaction between sodium and water',
  },
]

/* Cosmetic only — echoes the "Version A / Version B" claim shown lower
   on the page without wiring any real shuffle logic in here. */
const VERSION_BY_INDEX = ['A', 'B', 'A', 'B']

const REGENERATE_MS = 650

export function InteractiveSheet() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const active = SHEET_SAMPLES[activeIndex]

  function handleSelect(i: number) {
    if (i === activeIndex || generating) return
    setGenerating(true)
    setHasInteracted(true)
    window.setTimeout(() => {
      setActiveIndex(i)
      setGenerating(false)
    }, REGENERATE_MS)
  }

  return (
    <div className="zs-sheet-stage zs-in" style={{ '--d': '200ms' } as CSSProperties}>
      <p className="zs-try-label">Try it — pick a subject</p>
      <div className="zs-try-pills" role="group" aria-label="Choose a subject to preview">
        {SHEET_SAMPLES.map((s, i) => (
          <button
            key={s.subject}
            type="button"
            className={i === activeIndex ? 'zs-try-pill zs-try-pill-active' : 'zs-try-pill'}
            aria-pressed={i === activeIndex}
            onClick={() => handleSelect(i)}
          >
            {s.subject}
          </button>
        ))}
      </div>

      <div className="zs-sheet-visual">
        <div className={generating ? 'zs-sheet-generating' : undefined}>
          <div className="zs-sheet-back" aria-hidden>
            <span className="zs-sheet-tab">Answer key</span>
          </div>

          <article
          key={active.subject}
          className={hasInteracted ? 'zs-sheet zs-sheet-fresh' : 'zs-sheet'}
          aria-label="Sample generated paper"
        >
          <div className="zs-sheet-head">
            <div>
              <p className="zs-sheet-board">
                Board of Intermediate &amp; Secondary Education
              </p>
              <h2 className="zs-sheet-title">
                {active.subject} — {active.grade}
              </h2>
              <p className="zs-sheet-meta">Group I · Annual pattern</p>
            </div>
            <div className="zs-rollbox">
              <span>Roll No.</span>
              <div className="zs-rollcells" aria-hidden>
                <i /><i /><i /><i /><i />
              </div>
            </div>
          </div>

          <div className="zs-sheet-rule">
            <span>Time allowed — 2:30 hrs</span>
            <span>Total marks — 60</span>
          </div>

          <div className="zs-sheet-body">
            <div className="zs-marks" aria-hidden>
              <span>12</span>
              <span>18</span>
              <span>30</span>
            </div>

            <div className="zs-questions">
              <p className="zs-section">Section A — Objective</p>
              <p className="zs-q">
                <b>Q1.</b> Choose the correct option.
              </p>
              <p className="zs-sub">
                (i) {active.mcq[0].prompt}
                <span className="zs-opts">
                  {OPTION_LABELS.map((label, oi) => (
                    <span key={label} className={oi === active.mcq[0].correctIndex ? 'zs-opt-on' : undefined}>
                      {label}
                    </span>
                  ))}
                </span>
              </p>
              <p className="zs-sub">
                (ii) {active.mcq[1].prompt}
                <span className="zs-opts">
                  {OPTION_LABELS.map((label, oi) => (
                    <span key={label} className={oi === active.mcq[1].correctIndex ? 'zs-opt-on' : undefined}>
                      {label}
                    </span>
                  ))}
                </span>
              </p>

              <p className="zs-section">Section B — Short answers</p>
              <p className="zs-sub">(i) {active.shortA}</p>
              <p className="zs-sub zs-urdu" lang="ur" dir="rtl">
                {active.shortUrdu}
              </p>
              <p className="zs-sub zs-writing">
                (iii) {active.shortWriting}
                <span className="zs-caret" aria-hidden />
              </p>
            </div>
          </div>

          <div className="zs-sheet-foot">
            <span className="zs-mono">{active.chapters}</span>
            <span className="zs-mono">difficulty · balanced</span>
            <span className="zs-mono">v. {VERSION_BY_INDEX[activeIndex]}</span>
            <span
              className="zs-mono zs-verify"
              title="Every generated paper carries a QR code that confirms it hasn't been altered."
            >
              <svg viewBox="0 0 21 21" aria-hidden="true" className="zs-verify-icon">
                <rect x="0" y="0" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <rect x="2.3" y="2.3" width="2.4" height="2.4" fill="currentColor" />
                <rect x="14" y="0" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <rect x="16.3" y="2.3" width="2.4" height="2.4" fill="currentColor" />
                <rect x="0" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <rect x="2.3" y="16.3" width="2.4" height="2.4" fill="currentColor" />
                <rect x="9" y="1" width="1.6" height="1.6" fill="currentColor" />
                <rect x="12" y="3" width="1.6" height="1.6" fill="currentColor" />
                <rect x="9" y="9" width="1.6" height="1.6" fill="currentColor" />
                <rect x="11.5" y="9" width="1.6" height="1.6" fill="currentColor" />
                <rect x="9" y="11.5" width="1.6" height="1.6" fill="currentColor" />
                <rect x="16" y="9" width="1.6" height="1.6" fill="currentColor" />
                <rect x="9" y="16" width="1.6" height="1.6" fill="currentColor" />
                <rect x="16" y="16" width="1.6" height="1.6" fill="currentColor" />
                <rect x="18.5" y="12" width="1.6" height="1.6" fill="currentColor" />
              </svg>
              QR-verified
            </span>
          </div>
        </article>
        </div>

        <div className="zs-chip" aria-hidden>
          <span className="zs-chip-pulse" />
          <span className="zs-chip-status" />
        </div>
      </div>
    </div>
  )
}
