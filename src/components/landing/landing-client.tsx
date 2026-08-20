'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Menu, MessageCircle, Moon, Sun, X } from 'lucide-react'

import {
  ANNOUNCEMENTS, AVAILABLE_CLASSES, BRAND, CONTACT, NAV_LINKS, ROUTES,
  subjectsForGrade, WHATSAPP_URL, type SubjectEntry,
} from './landing-content'

/* ================================================================== */
/*  THEME TOGGLE                                                       */
/* ================================================================== */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const toggle = useCallback(() => {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try { localStorage.setItem('zeeshaoor-theme', next) } catch { /* private mode */ }
  }, [])

  return (
    <button type="button" className="zs-icon-btn" onClick={toggle} aria-label="Switch colour theme"
      aria-pressed={mounted ? undefined : undefined}>
      {/* Icon state is driven by the html attribute, not React state — no hydration gap */}
      <Sun className="zs-ticon-sun" aria-hidden />
      <Moon className="zs-ticon-moon" aria-hidden />
    </button>
  )
}

/* ================================================================== */
/*  ANNOUNCEMENT BAR                                                   */
/*  Seamless loop = the run is rendered twice and the track moves -50%.*/
/*  Pauses on hover and on keyboard focus. Reduced-motion users get a  */
/*  static, horizontally scrollable row (CSS handles the swap).        */
/* ================================================================== */
export function AnnouncementBar() {
  const run = (
    <span className="zs-ticker-run">
      {ANNOUNCEMENTS.map((text, i) => (
        <span key={`${text}-${i}`} className="zs-ticker-item">
          {text}
          <i aria-hidden className={i % 2 === 0 ? 'zs-sep zs-sep-cyan' : 'zs-sep zs-sep-violet'}>◆</i>
        </span>
      ))}
    </span>
  )

  return (
    <div className="zs-ticker" role="region" aria-label="Announcements" tabIndex={0}>
      <div className="zs-ticker-track">
        {run}
        <span aria-hidden>{run}</span>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  CENTRED NAV PILL — with a real active-section indicator            */
/* ================================================================== */
export function NavPill() {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const sections = NAV_LINKS
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null)
    if (!sections.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <nav className="zs-pill" aria-label="Primary">
      {NAV_LINKS.map((l) => (
        <a key={l.id} href={`#${l.id}`}
          className={active === l.id ? 'zs-pill-link zs-pill-on' : 'zs-pill-link'}
          aria-current={active === l.id ? 'true' : undefined}>
          {l.label}
        </a>
      ))}
    </nav>
  )
}

/* ================================================================== */
/*  MOBILE NAV — drawer, Escape, aria-expanded, closes on selection    */
/* ================================================================== */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="zs-mnav">
      <button ref={btnRef} type="button" className="zs-icon-btn" onClick={() => setOpen((v) => !v)}
        aria-expanded={open} aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}>
        {open ? <X aria-hidden /> : <Menu aria-hidden />}
      </button>

      {open && (
        <>
          <div className="zs-mnav-scrim" onClick={() => setOpen(false)} aria-hidden />
          <div id={panelId} className="zs-mnav-panel">
            {NAV_LINKS.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
            <hr className="zs-mnav-rule" />
            <Link href={ROUTES.login} onClick={() => setOpen(false)}>Log in</Link>
            <Link href={ROUTES.register} className="zs-btn zs-btn-solid zs-btn-full"
              onClick={() => setOpen(false)}>
              Start a paper <ArrowRight className="zs-ico" aria-hidden />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

/* ================================================================== */
/*  PRODUCT PREVIEW                                                    */
/*  Purely presentational. Calls no API and needs no auth. Options     */
/*  come from the curriculum registry passed in by the server.         */
/* ================================================================== */
export function PaperPreview({ curriculum }: { curriculum: SubjectEntry[] }) {
  const [grade, setGrade] = useState(AVAILABLE_CLASSES[0]?.grade ?? '')
  const subjects = subjectsForGrade(grade)
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')

  const entry = curriculum.find((c) => c.id === subjectId) ?? subjects[0] ?? curriculum[0]

  const pickGrade = (g: string) => {
    setGrade(g)
    setSubjectId(subjectsForGrade(g)[0]?.id ?? '')
  }

  if (!entry) return null

  return (
    <div className="zs-preview">
      <div className="zs-preview-controls">
        <fieldset className="zs-fieldset">
          <legend>Class</legend>
          <div className="zs-chips">
            {AVAILABLE_CLASSES.map((c) => (
              <button key={c.grade} type="button"
                className={c.grade === grade ? 'zs-chip zs-chip-on' : 'zs-chip'}
                aria-pressed={c.grade === grade} onClick={() => pickGrade(c.grade)}>
                {c.grade}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="zs-fieldset">
          <legend>Subject</legend>
          <div className="zs-chips">
            {subjects.map((s) => (
              <button key={s.id} type="button"
                className={s.id === entry.id ? 'zs-chip zs-chip-on' : 'zs-chip'}
                aria-pressed={s.id === entry.id} onClick={() => setSubjectId(s.id)}>
                {s.subject}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="zs-preview-range">
          Chapters {entry.chapterFrom}–{entry.chapterTo} available
          {entry.note ? <span className="zs-preview-note">{entry.note}</span> : null}
        </p>
      </div>

      <article className="zs-sheet" aria-label={`Illustrative ${entry.grade} ${entry.subject} paper preview`}>
        <div className="zs-sheet-head">
          <div>
            <p className="zs-sheet-kicker">Assessment paper</p>
            <h3 className="zs-sheet-title">{entry.subject} — {entry.grade}</h3>
            <p className="zs-sheet-meta">Chapters {entry.chapterFrom}–{entry.chapterTo}</p>
          </div>
          <div className="zs-rollbox">
            <span>Roll No.</span>
            <div className="zs-rollcells" aria-hidden><i /><i /><i /><i /><i /></div>
          </div>
        </div>

        <div className="zs-sheet-rule">
          <span>Time allowed — 2:30 hrs</span>
          <span>Total marks — 60</span>
        </div>

        <div className="zs-sheet-body">
          <div className="zs-marks" aria-hidden><span>12</span><span>18</span><span>30</span></div>
          <div className="zs-questions">
            <p className="zs-section">Section A — Objective</p>
            <p className="zs-sub">
              (i) {entry.preview.objective}
              <span className="zs-opts" aria-hidden>
                {Array.from({ length: entry.preview.optionCount }, (_, i) => (
                  <span key={i} className={i === entry.preview.correctIndex ? 'zs-opt-on' : undefined}>
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </span>
            </p>

            <p className="zs-section">Section B — Short answers</p>
            <p className="zs-sub">(i) {entry.preview.short}</p>
            {entry.preview.urdu && (
              <p className="zs-sub zs-urdu" lang="ur" dir="rtl">{entry.preview.urdu}</p>
            )}

            <p className="zs-section">Section C — Long answers</p>
            <p className="zs-sub">(i) {entry.preview.long}</p>
          </div>
        </div>

        <p className="zs-sheet-foot">
          Illustrative preview. Actual papers are assembled from the chapters you select.
        </p>
      </article>
    </div>
  )
}

/* ================================================================== */
/*  FLOATING WHATSAPP — lifts above the footer so nothing is covered   */
/* ================================================================== */
export function FloatingWhatsApp() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
      className={shown ? 'zs-wa zs-wa-in' : 'zs-wa'}
      aria-label={`Message ${BRAND.full} on WhatsApp at ${CONTACT.phoneDisplay}`}>
      <MessageCircle aria-hidden />
      <span className="zs-wa-label">WhatsApp</span>
    </a>
  )
}

export { Check }