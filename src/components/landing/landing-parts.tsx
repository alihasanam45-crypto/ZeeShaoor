'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Menu,
  MessageCircle,
  Moon,
  Pause,
  Play,
  Sun,
  X,
} from 'lucide-react'

import {
  AVAILABLE_GRADES,
  BRAND,
  NAV_LINKS,
  ROUTES,
  TICKER_ITEMS,
  chapterNumbers,
  chapterRange,
  subjectsForGrade,
  type CurriculumEntry,
} from './landing-content'

/* ==================================================================
   THEME TOGGLE
   Icon state is driven by html[data-theme] in CSS, not React state,
   so there is no hydration mismatch and no flash on first paint.
   ================================================================== */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const toggle = useCallback(() => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('zeeshaoor-theme', next)
    } catch {
      /* private mode / storage disabled — the theme still applies for this visit */
    }
  }, [])

  return (
    <button
      type="button"
      className="zs-theme-toggle"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      // Until mounted we cannot know the current theme; hide it from AT rather than lie.
      aria-hidden={!mounted ? true : undefined}
      tabIndex={mounted ? undefined : -1}
    >
      <Sun className="zs-ticon-sun" aria-hidden />
      <Moon className="zs-ticon-moon" aria-hidden />
    </button>
  )
}

/* ==================================================================
   ANNOUNCEMENT BAR
   - seamless loop: two identical runs, translateX(-50%)
   - pauses on hover, on focus-within, and via an explicit control
   - reduced motion: animation off, row becomes horizontally scrollable
   - the moving track is aria-hidden; a static sentence carries the
     same information for assistive technology
   ================================================================== */
export function AnnouncementBar() {
  const [paused, setPaused] = useState(false)

  const run = (
    <span className="zs-ticker-run">
      {TICKER_ITEMS.map((item, i) => (
        <span key={item} className="zs-ticker-item">
          {item}
          <i aria-hidden className={i % 2 === 0 ? 'zs-sep-cyan' : 'zs-sep-violet'}>
            ◆
          </i>
        </span>
      ))}
    </span>
  )

  return (
    <div className="zs-ticker" data-paused={paused || undefined}>
      <p className="zs-sr-only">{TICKER_ITEMS.join('. ')}.</p>

      <div className="zs-ticker-viewport" aria-hidden>
        <div className="zs-ticker-track">
          {run}
          {run}
        </div>
      </div>

      <button
        type="button"
        className="zs-ticker-btn"
        aria-pressed={paused}
        aria-label={paused ? 'Resume the announcement bar' : 'Pause the announcement bar'}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
      </button>
    </div>
  )
}

/* ==================================================================
   HEADER — three zones: brand | centered emerald pill | actions
   ================================================================== */
export function LandingHeader() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('')
  const menuId = useId()
  const btnRef = useRef<HTMLButtonElement>(null)

  /* active-section indicator */
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (sections.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  /* Escape closes the mobile menu and returns focus to the trigger */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="zs-nav">
      <Link href={ROUTES.home} className="zs-brand" aria-label={`${BRAND.full} home`}>
        <Image
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          priority
          className="zs-brand-mark"
        />
        <span className="zs-brand-word">
          {BRAND.name}
          <span className="zs-brand-tld">{BRAND.tld}</span>
        </span>
      </Link>

      <nav className="zs-pill" aria-label="Primary">
        {NAV_LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className="zs-pill-link"
            aria-current={active === l.id ? 'true' : undefined}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="zs-nav-cta">
        <ThemeToggle />
        <Link href={ROUTES.login} className="zs-btn zs-btn-quiet zs-nav-login">
          Log in
        </Link>
        <Link href={ROUTES.register} className="zs-btn zs-btn-solid">
          Start a paper
        </Link>

        <button
          ref={btnRef}
          type="button"
          className="zs-menu-btn"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </div>

      <div id={menuId} className="zs-drawer" data-open={open || undefined} hidden={!open}>
        {NAV_LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a href="#faq" onClick={() => setOpen(false)}>
          FAQ
        </a>
        <hr />
        <Link href={ROUTES.login} onClick={() => setOpen(false)}>
          Log in
        </Link>
        <Link
          href={ROUTES.register}
          className="zs-btn zs-btn-solid zs-btn-full"
          onClick={() => setOpen(false)}
        >
          Start a paper
          <ArrowRight className="zs-ico" aria-hidden />
        </Link>
      </div>
    </header>
  )
}

/* ==================================================================
   PAPER PREVIEW
   A public, read-only demonstration. It reads the same curriculum
   registry the rest of the page uses, calls no API, and cannot reach
   a protected route. Structure only — no board pattern is claimed.
   ================================================================== */
export function PaperPreview() {
  const [gradeKey, setGradeKey] = useState(AVAILABLE_GRADES[0]?.key ?? '9')

  const subjects = useMemo(() => subjectsForGrade(gradeKey), [gradeKey])
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')

  const entry: CurriculumEntry | undefined =
    subjects.find((s) => s.id === subjectId) ?? subjects[0]

  const chapters = useMemo(() => (entry ? chapterNumbers(entry) : []), [entry])
  const [selected, setSelected] = useState<number[]>([])
  const [medium, setMedium] = useState<'English' | 'Urdu'>('English')

  /* keep subject + chapters valid whenever the class changes */
  useEffect(() => {
    const next = subjectsForGrade(gradeKey)
    setSubjectId(next[0]?.id ?? '')
    setSelected(next[0] ? chapterNumbers(next[0]).slice(0, 3) : [])
  }, [gradeKey])

  useEffect(() => {
    setSelected(chapters.slice(0, 3))
  }, [subjectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleChapter = (n: number) =>
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((c) => c !== n) : [...prev, n].sort((a, b) => a - b),
    )

  if (!entry) return null

  const chapterLabel =
    selected.length === 0
      ? 'no chapters selected'
      : `ch. ${selected.slice(0, 4).join(', ')}${selected.length > 4 ? '…' : ''}`

  return (
    <div className="zs-preview">
      {/* ---------- controls ---------- */}
      <div className="zs-preview-controls">
        <fieldset className="zs-fset">
          <legend>Class</legend>
          <div className="zs-chips">
            {AVAILABLE_GRADES.map((g) => (
              <button
                key={g.key}
                type="button"
                className="zs-chip-btn"
                aria-pressed={gradeKey === g.key}
                onClick={() => setGradeKey(g.key)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="zs-fset">
          <legend>Subject</legend>
          <div className="zs-chips">
            {subjects.map((s) => (
              <button
                key={s.id}
                type="button"
                className="zs-chip-btn"
                aria-pressed={entry.id === s.id}
                onClick={() => setSubjectId(s.id)}
              >
                {s.subject}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="zs-fset">
          <legend>
            Chapters <span className="zs-fset-note">{chapterRange(entry)}</span>
          </legend>
          <div className="zs-chips zs-chips-dense">
            {chapters.map((n) => (
              <button
                key={n}
                type="button"
                className="zs-chip-btn zs-chip-num"
                aria-pressed={selected.includes(n)}
                aria-label={`Chapter ${n}`}
                onClick={() => toggleChapter(n)}
              >
                {n}
                {selected.includes(n) && <Check aria-hidden />}
              </button>
            ))}
          </div>
          {entry.note && <p className="zs-fset-hint">{entry.note}</p>}
        </fieldset>

        <fieldset className="zs-fset">
          <legend>Medium</legend>
          <div className="zs-chips">
            {(['English', 'Urdu'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className="zs-chip-btn"
                aria-pressed={medium === m}
                onClick={() => setMedium(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* ---------- the sheet ---------- */}
      <div className="zs-sheet-stage">
        <div className="zs-sheet-back" aria-hidden />
        <article className="zs-sheet" aria-live="polite" aria-label="Paper structure preview">
          <div className="zs-sheet-head">
            <div>
              <p className="zs-sheet-kicker">Structure preview</p>
              <h3 className="zs-sheet-title">
                {entry.subject} — {entry.grade}
              </h3>
            </div>
            <div className="zs-rollbox">
              <span>Roll No.</span>
              <div className="zs-rollcells" aria-hidden>
                <i /><i /><i /><i /><i />
              </div>
            </div>
          </div>

          <div className="zs-sheet-rule">
            <span>{chapterLabel}</span>
            <span>{medium}</span>
          </div>

          <div className="zs-sheet-body">
            <div className="zs-marks" aria-hidden>
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>

            <div className="zs-questions">
              <p className="zs-qsection">Section A — Objective</p>
              <p className="zs-qline">
                Multiple-choice items drawn from {selected.length || 0} selected chapter
                {selected.length === 1 ? '' : 's'}.
              </p>

              <p className="zs-qsection">Section B — Short answers</p>
              {medium === 'English' ? (
                <p className="zs-qline">Short structured questions, one line per response.</p>
              ) : (
                <p className="zs-qline zs-urdu" lang="ur" dir="rtl">
                  مختصر جوابات — ہر سوال کے لیے ایک سطر
                </p>
              )}

              <p className="zs-qsection">Section C — Long answers</p>
              <p className="zs-qline">
                Extended questions with space for working and a marking scheme alongside.
              </p>
            </div>
          </div>

          <p className="zs-sheet-note">
            Illustrative layout only. The generated paper is assembled from the mapped
            question bank after you sign in.
          </p>
        </article>
      </div>
    </div>
  )
}

/* ==================================================================
   FLOATING WHATSAPP — sits above the safe area, never over the footer
   ================================================================== */
export function FloatingWhatsApp({ href }: { href: string }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="zs-wa"
      data-in={shown || undefined}
      aria-hidden={!shown}
      tabIndex={shown ? undefined : -1}
    >
      <MessageCircle aria-hidden />
      <span className="zs-wa-label">WhatsApp</span>
    </a>
  )
}
