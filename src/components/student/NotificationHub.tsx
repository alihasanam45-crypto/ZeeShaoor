'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Brain, CheckCheck, Inbox, Share2, X } from 'lucide-react'

export type HubKind = 'recall' | 'ripple'

export interface HubNotification {
  id: string
  kind: HubKind
  title: string
  body: string
  time: string
  href: string
  cta: string
  unread: boolean
}

export const SEED_NOTIFICATIONS: HubNotification[] = [
  {
    id: 'recall-1',
    kind: 'recall',
    title: 'Differentiation Rules is due for review',
    body: 'Your spaced-repetition window is open — a 10-minute review today locks it in for the week.',
    time: '2h ago',
    href: '/student/study?subject=Mathematics&chapter=Differentiation+Rules',
    cta: 'Review now',
    unread: true,
  },
  {
    id: 'recall-2',
    kind: 'recall',
    title: "Newton's Laws review due tomorrow",
    body: 'You scored 72% last time. One more strong pass moves it out of the risk zone.',
    time: '5h ago',
    href: '/student/study?subject=Physics&chapter=Newton%27s+Laws',
    cta: 'Start early',
    unread: true,
  },
  {
    id: 'recall-3',
    kind: 'recall',
    title: 'Organic Reactions is overdue',
    body: 'This Chemistry topic slipped past its review date on 10 July.',
    time: '1d ago',
    href: '/student/study?subject=Chemistry&chapter=Organic+Reactions',
    cta: 'Recover it',
    unread: true,
  },
  {
    id: 'ripple-1',
    kind: 'ripple',
    title: 'Zainab improved her Math score by 30%',
    body: 'Your study-buddy sessions are paying off — she credited your worked examples.',
    time: '3h ago',
    href: '/student/toppers',
    cta: 'See your impact',
    unread: true,
  },
  {
    id: 'ripple-2',
    kind: 'ripple',
    title: 'Hassan started a daily revision habit',
    body: 'Your mentee logged his 7th day in a row after your streak challenge.',
    time: '1d ago',
    href: '/student/streak',
    cta: 'View streaks',
    unread: false,
  },
  {
    id: 'ripple-3',
    kind: 'ripple',
    title: '3 classmates used your shared notes',
    body: 'Your Physics numericals sheet was opened 3 times this week.',
    time: '2d ago',
    href: '/student/helpdesk',
    cta: 'Open resources',
    unread: false,
  },
]

const KIND_STYLES: Record<HubKind, { chip: string; label: string; icon: typeof Brain }> = {
  recall: { chip: 'border-violet-100 bg-violet-50 text-violet-600', label: 'Recall Radar', icon: Brain },
  ripple: { chip: 'border-emerald-100 bg-emerald-50 text-emerald-600', label: 'Ripple Effect', icon: Share2 },
}

type HubTab = 'all' | HubKind

const TABS: { id: HubTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'recall', label: 'Recall Radar' },
  { id: 'ripple', label: 'Ripple Effect' },
]

interface NotificationHubProps {
  open: boolean
  notifications: HubNotification[]
  onClose: () => void
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}

export default function NotificationHub({
  open,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationHubProps) {
  const [tab, setTab] = useState<HubTab>('all')
  const unreadCount = notifications.filter(n => n.unread).length
  const visible = tab === 'all' ? notifications : notifications.filter(n => n.kind === tab)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`fixed inset-0 z-[90] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] transition-opacity duration-500 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-out panel */}
      <aside
        role="dialog"
        aria-label="Notification hub"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-slate-200 bg-white/95 shadow-[-24px_0_80px_rgb(15,23,42,0.1)] backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Notification Hub</h2>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="rounded-2xl p-2.5 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-2 border-b border-slate-100 px-6 py-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {visible.length === 0 && (
            <div className="py-16 text-center">
              <Inbox className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">Nothing here yet</p>
              <p className="mt-1 text-xs text-slate-400">New alerts will land in this panel.</p>
            </div>
          )}

          {visible.map(n => {
            const kind = KIND_STYLES[n.kind]
            const Icon = kind.icon
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => {
                  onMarkRead(n.id)
                  onClose()
                }}
                className={`block rounded-3xl border p-4 transition-all hover:shadow-sm ${
                  n.unread
                    ? 'border-indigo-100 bg-indigo-50/40 hover:border-indigo-200'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${kind.chip}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        {kind.label}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{n.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{n.body}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                      {n.cta} →
                    </span>
                  </div>
                  {n.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 py-3 text-xs font-semibold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-600"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        </div>
      </aside>
    </div>
  )
}
