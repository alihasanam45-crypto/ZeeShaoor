'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Focus } from 'lucide-react'
import Sidebar from './Sidebar'
import AIAssistOrb from './AIAssistOrb'
import NotificationHub, { SEED_NOTIFICATIONS, type HubNotification } from './NotificationHub'

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  progress: 'Progress',
  study: 'Study',
  quiz: 'Quiz',
  'past-papers': 'Past Papers',
  simulator: 'Exam Simulator',
  schedule: 'Schedule',
  'ai-ask': 'AI Ask',
  toppers: 'Toppers',
  essay: 'Essay Lab',
  'board-news': 'Board News',
  helpdesk: 'Help Desk',
  'ai-checker': 'AI Checker',
  'brain-gym': 'Brain Gym',
  exams: 'Exams',
  lectures: 'Lectures',
  streak: 'Streak',
  feedback: 'Feedback',
  subject: 'Subjects',
  checkout: 'Checkout',
}

export default function StudentShell({ children }: { children: React.ReactNode }) {
  const [focusMode, setFocusMode] = useState(false)
  const [hubOpen, setHubOpen] = useState(false)
  const [notifications, setNotifications] = useState<HubNotification[]>(SEED_NOTIFICATIONS)
  const pathname = usePathname()

  const segment = pathname?.split('/')[2] ?? ''
  const sectionTitle = SECTION_TITLES[segment] ?? 'Dashboard'
  const unreadCount = notifications.filter(n => n.unread).length

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)))
  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

  return (
    <div
      data-focus={focusMode ? 'on' : 'off'}
      className="group/shell flex h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-900"
    >
      <Sidebar focusMode={focusMode} onToggleFocus={() => setFocusMode(v => !v)} />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 backdrop-blur-xl lg:px-10">
          <div className="flex items-baseline gap-2.5">
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:inline">
              Student Portal
            </span>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="text-sm font-bold text-slate-800">{sectionTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            {focusMode && (
              <span className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 sm:flex">
                <Focus className="h-3.5 w-3.5" />
                Focus Mode on
              </span>
            )}
            <button
              onClick={() => setHubOpen(true)}
              aria-label={`Open notification hub${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              className="relative rounded-2xl p-2.5 text-slate-500 transition-all hover:bg-slate-50 hover:text-indigo-600 hover:shadow-sm"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold leading-none text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth [scrollbar-gutter:stable]">
          {children}
        </main>
      </div>

      <NotificationHub
        open={hubOpen}
        notifications={notifications}
        onClose={() => setHubOpen(false)}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
      <AIAssistOrb />
    </div>
  )
}
