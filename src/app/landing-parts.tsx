'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowUpRight,
  MessageCircle,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react'

type NewsItem = { title: string; link: string; date: string }
type Theme = 'dark' | 'light'

const THEME_KEY = 'zeeshaoor-theme'

/* ------------------------------------------------------------------ */
/*  Day / night toggle                                                 */
/*                                                                     */
/*  The theme itself is applied by an inline script in page.tsx that    */
/*  runs before first paint, so there is no flash and no server/client  */
/*  markup difference. This component only reads and flips it.          */
/*  Which icon shows is decided by CSS off html[data-theme], never by   */
/*  React state — that is what keeps hydration clean.                   */
/* ------------------------------------------------------------------ */
export function ThemeToggle() {
  // Starts null on both server and client, so the first render matches.
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const current = document.documentElement.dataset.theme
    setTheme(current === 'light' ? 'light' : 'dark')
  }, [])

  // Follow the operating system only until the visitor picks a side.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(THEME_KEY)) return
      } catch {
        /* storage blocked — fall through and follow the OS */
      }
      const next: Theme = e.matches ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      setTheme(next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme =
      document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* private mode — the theme still holds for this session */
    }
    setTheme(next)
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      className="zs-theme-toggle"
      aria-label="Toggle day and night theme"
      title={theme === 'light' ? 'Switch to night theme' : 'Switch to day theme'}
      suppressHydrationWarning
    >
      <Sun className="zs-ticon-sun" aria-hidden strokeWidth={1.75} />
      <Moon className="zs-ticon-moon" aria-hidden strokeWidth={1.75} />
      <span className="zs-sr-only" aria-live="polite">
        {theme === 'light' ? 'Day theme active' : 'Night theme active'}
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Live BISE news — reads your existing /api/bise-news route          */
/* ------------------------------------------------------------------ */
export function BoardNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let alive = true
    fetch('/api/bise-news')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        setNews(Array.isArray(data?.items) ? data.items : [])
        setState('ready')
      })
      .catch(() => alive && setState('error'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="zs-panel">
      <div className="zs-panel-head">
        <span className="zs-panel-title">
          <span className="zs-live" aria-hidden />
          Board announcements
        </span>
        <span className="zs-mono">refreshed hourly</span>
      </div>

      {state === 'loading' && (
        <div className="zs-skel-wrap" aria-live="polite" aria-busy="true">
          <span className="zs-skel" />
          <span className="zs-skel" />
          <span className="zs-skel" />
          <span className="zs-skel" />
        </div>
      )}

      {state === 'error' && (
        <p className="zs-empty">
          <RefreshCw aria-hidden /> Announcements didn&apos;t load. Check your
          connection and reload the page.
        </p>
      )}

      {state === 'ready' && news.length === 0 && (
        <p className="zs-empty">
          Nothing new from the boards today. This list fills in as
          announcements are published.
        </p>
      )}

      {state === 'ready' && news.length > 0 && (
        <ul className="zs-news-list">
          {news.map((item, i) => (
            <li key={`${item.link}-${i}`}>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <span className={i < 2 ? 'zs-flag zs-flag-hot' : 'zs-flag'}>
                  {i < 2 ? 'new' : ''}
                </span>
                <span className="zs-news-body">
                  <strong>{item.title}</strong>
                  <em>{item.date}</em>
                </span>
                <ArrowUpRight aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Floating WhatsApp                                                  */
/* ------------------------------------------------------------------ */
export function FloatingWhatsApp({ href }: { href: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={show ? 'zs-wa zs-wa-in' : 'zs-wa'}
      aria-label="Message ZeeShaoor on WhatsApp"
    >
      <MessageCircle aria-hidden />
      <span className="zs-wa-label">Message us</span>
    </a>
  )
}
