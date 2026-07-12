'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Command, LogOut, Search, CornerDownLeft } from 'lucide-react'
import { ADMIN_NAV } from './nav'

const ALL_ITEMS = ADMIN_NAV.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.heading })),
)

export default function AdminHeader() {
  const router = useRouter()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_ITEMS
    return ALL_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        (item.hint ?? '').toLowerCase().includes(q),
    )
  }, [query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setHighlighted(0)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [close, router],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    setHighlighted(0)
  }, [query])

  // The session token carries only id/role/email — derive a display name from the email
  const adminName = session?.user?.email?.split('@')[0] || 'Admin'
  const initial = adminName.charAt(0).toUpperCase()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-xl">
      <button
        onClick={() => setOpen(true)}
        className="flex w-80 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-400"
      >
        <Command className="h-4 w-4" />
        <span className="flex-1 text-left">Search console...</span>
        <kbd className="rounded border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">Ctrl+K</kbd>
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
            {initial}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-tight text-slate-200">{adminName}</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-500 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 pt-[15vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setHighlighted((h) => Math.min(h + 1, results.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setHighlighted((h) => Math.max(h - 1, 0))
                  } else if (e.key === 'Enter' && results[highlighted]) {
                    navigate(results[highlighted].href)
                  }
                }}
                placeholder="Jump to any console module..."
                className="h-12 flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
            <ul className="max-h-80 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-slate-600">No modules match &ldquo;{query}&rdquo;</li>
              )}
              {results.map((item, i) => (
                <li key={item.href}>
                  <button
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      i === highlighted ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-600">{item.section}</span>
                    {i === highlighted && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-indigo-400" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}
