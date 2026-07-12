'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Flame, BookOpen, Video, Clock,
  Brain, Zap, FileText, Gamepad2, PenLine, CalendarRange,
  Sparkles, ShieldCheck, Trophy, Newspaper, MessageSquare,
  HeartHandshake, CreditCard, LogOut, Focus,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
  /** Match nested routes against this prefix instead of href (e.g. dynamic segments) */
  activePrefix?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Progress', href: '/student/progress', icon: TrendingUp },
      { label: 'Streak', href: '/student/streak', icon: Flame },
    ],
  },
  {
    title: 'Learn',
    items: [
      { label: 'Study', href: '/student/study', icon: BookOpen },
      { label: 'Lectures', href: '/student/lectures', icon: Video },
      { label: 'Schedule', href: '/student/schedule', icon: Clock },
    ],
  },
  {
    title: 'Practice',
    items: [
      { label: 'Quiz', href: '/student/quiz', icon: Brain },
      { label: 'Exam Simulator', href: '/student/simulator', icon: Zap },
      { label: 'Past Papers', href: '/student/past-papers', icon: FileText },
      { label: 'Brain Gym', href: '/student/brain-gym', icon: Gamepad2 },
      { label: 'Essay Lab', href: '/student/essay', icon: PenLine },
      { label: 'Exams', href: '/student/exams', icon: CalendarRange },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { label: 'AI Ask', href: '/student/ai-ask', icon: Sparkles },
      { label: 'AI Checker', href: '/student/ai-checker', icon: ShieldCheck },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Toppers', href: '/student/toppers', icon: Trophy },
      { label: 'Board News', href: '/student/board-news', icon: Newspaper },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help Desk', href: '/student/helpdesk', icon: MessageSquare },
      { label: 'Feedback', href: '/student/feedback', icon: HeartHandshake },
      { label: 'Checkout', href: '/student/checkout', icon: CreditCard },
    ],
  },
]

interface SidebarProps {
  focusMode: boolean
  onToggleFocus: () => void
}

export default function Sidebar({ focusMode, onToggleFocus }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (item: NavItem) => {
    const prefix = item.activePrefix ?? item.href
    return pathname === item.href || pathname?.startsWith(`${prefix}/`)
  }

  return (
    <aside
      className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white/95 backdrop-blur-2xl transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        focusMode ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-slate-100 ${
          focusMode ? 'justify-center' : 'px-6'
        }`}
      >
        <Link href="/student/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="ZeeShaoor.pk"
            width={36}
            height={36}
            priority
            className="shrink-0 rounded-2xl shadow-md shadow-indigo-500/25"
          />
          {!focusMode && (
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-lg font-black tracking-tight text-transparent">
              ZeeShaoor.pk
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-6 overflow-y-auto py-6 ${focusMode ? 'px-3' : 'px-4'}`}>
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            {!focusMode && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(item => {
                const Icon = item.icon
                const active = isActive(item)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={focusMode ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center rounded-2xl p-3 text-[15px] font-medium transition-all duration-300 ${
                      focusMode ? 'justify-center' : 'gap-4'
                    } ${
                      active
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-indigo-500' : 'text-slate-400'}`} />
                    {!focusMode && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Focus Mode toggle */}
      <div className={`shrink-0 border-t border-slate-100 py-3 ${focusMode ? 'px-3' : 'px-4'}`}>
        <button
          onClick={onToggleFocus}
          aria-pressed={focusMode}
          title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          className={`flex w-full items-center rounded-2xl p-3 transition-all duration-300 ${
            focusMode
              ? 'justify-center bg-indigo-50 text-indigo-600 shadow-sm'
              : 'gap-4 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:shadow-sm'
          }`}
        >
          <Focus className="h-5 w-5 shrink-0" />
          {!focusMode && (
            <>
              <span className="text-[15px] font-medium">Focus Mode</span>
              <span className="ml-auto flex h-6 w-11 shrink-0 items-center rounded-full bg-slate-200 p-0.5">
                <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* User */}
      <div className={`shrink-0 border-t border-slate-100 py-4 ${focusMode ? 'px-3' : 'px-4'}`}>
        <div className={`flex items-center ${focusMode ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-black text-white">
            AH
          </div>
          {!focusMode && (
            <>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800">Ali Hasan</p>
                <p className="text-[10px] text-slate-500">Student</p>
              </div>
              <button
                aria-label="Log out"
                className="ml-auto rounded-xl p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
