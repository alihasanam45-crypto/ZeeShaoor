'use client'

import Link from 'next/link'
import Image from 'next/image'
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
//
// Paper Generator is the flagship tool, so it sits at the very top under
// Dashboard (not buried in Assessment).
const SECTIONS: NavSection[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
      { label: 'Paper Generator', href: '/teacher/generator', icon: WandSparkles },
    ],
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

// Executive Dark / Neon glassmorphism — matches the Paper Generator palette
// (bg #0a0a14, deep slate panels, neon indigo/purple accents) so the whole
// teacher portal reads as one unified command center.
export default function TeacherSidebar() {
  const pathname = usePathname() ?? ''

  return (
    <aside className="relative z-50 flex h-full w-72 shrink-0 flex-col border-r border-white/10 bg-[#0a0a14]">
      {/* Neon hairline down the right edge */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent" />

      <div className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-6">
        <Image
          src="/logo.png"
          alt="ZeeShaoor.pk"
          width={36}
          height={36}
          priority
          className="rounded-xl shadow-lg shadow-indigo-500/30"
        />
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">ZeeShaoor.pk</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">Teacher Portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((section) => (
          <div key={section.heading} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
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
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/10 font-semibold text-white ring-1 ring-inset ring-indigo-400/30 shadow-[0_4px_20px_rgba(99,102,241,0.18)]'
                          : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_8px_2px_rgba(129,140,248,0.6)]" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 px-6 py-3">
        <p className="text-[10px] leading-relaxed text-white/30">
          Awakening Intellect, Anchoring Truth
        </p>
      </div>
    </aside>
  )
}
