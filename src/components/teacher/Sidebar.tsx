'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ElementType } from 'react'
import {
  LayoutDashboard, MonitorPlay, BookOpen, Clock, Users, FileText,
  FileCheck, WandSparkles, ClipboardList, NotebookPen, BarChart3,
  ShieldAlert, BrainCircuit, Smile, Zap, Route, UserX, GraduationCap,
  MessageSquare, Calendar, Activity, TrendingUp,
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: ElementType }
type NavSection = { heading: string; items: NavItem[] }

// /teacher/paper is intentionally absent — it renders the generated paper
// from sessionStorage and redirects to /teacher/generator when empty.
const SECTIONS: NavSection[] = [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', href: '/teacher', icon: LayoutDashboard }],
  },
  {
    heading: 'Teaching',
    items: [
      { label: 'Live Class', href: '/teacher/live-class', icon: MonitorPlay },
      { label: 'Lesson Planner', href: '/teacher/lesson-planner', icon: BookOpen },
      { label: 'Pacing Tracker', href: '/teacher/pacing', icon: Clock },
      { label: 'Collab Board', href: '/teacher/collab', icon: Users },
      { label: 'Substitute Briefing', href: '/teacher/substitute', icon: FileText },
    ],
  },
  {
    heading: 'Assessment',
    items: [
      { label: 'Test Creator', href: '/teacher/test-creator', icon: FileCheck },
      { label: 'Paper Generator', href: '/teacher/generator', icon: WandSparkles },
      { label: 'Homework Autopilot', href: '/teacher/homework', icon: ClipboardList },
      { label: 'Rubric Scorer', href: '/teacher/rubric', icon: NotebookPen },
      { label: 'Grade Distribution', href: '/teacher/grade-distribution', icon: BarChart3 },
    ],
  },
  {
    heading: 'Student Insight',
    items: [
      { label: 'At-Risk Playbook', href: '/teacher/at-risk', icon: ShieldAlert },
      { label: 'Mark Predictor', href: '/teacher/mark-predictor', icon: BrainCircuit },
      { label: 'Emotion Report', href: '/teacher/emotion-report', icon: Smile },
      { label: 'Energy Map', href: '/teacher/energy-map', icon: Zap },
      { label: 'Learning Paths', href: '/teacher/learning-paths', icon: Route },
      { label: 'Absence Patterns', href: '/teacher/absence-patterns', icon: UserX },
      { label: 'Portfolio Builder', href: '/teacher/portfolio', icon: GraduationCap },
    ],
  },
  {
    heading: 'Communication',
    items: [
      { label: 'Parent Hub', href: '/teacher/parent-hub', icon: MessageSquare },
      { label: 'Meetings', href: '/teacher/meetings', icon: Calendar },
      { label: 'Rapid Feedback', href: '/teacher/feedback', icon: Activity },
    ],
  },
  {
    heading: 'Personal',
    items: [{ label: 'Growth Tracker', href: '/teacher/growth', icon: TrendingUp }],
  },
]

export default function TeacherSidebar() {
  const pathname = usePathname() ?? ''

  return (
    <aside className="z-50 flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">ZeeShaoor</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Teacher Portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((section) => (
          <div key={section.heading} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {section.heading}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === '/teacher'
                    ? pathname === '/teacher'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                        isActive
                          ? 'bg-indigo-50 font-medium text-indigo-700'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-100 px-6 py-3">
        <p className="text-[10px] leading-relaxed text-slate-400">
          Awakening Intellect, Anchoring Truth
        </p>
      </div>
    </aside>
  )
}
