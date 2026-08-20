'use client'

/* Marked client-only on purpose: every nav item's `icon` is a React component,
   which is not serializable across the server→client boundary. Pinning this
   module (and the icons it pulls in) to the client bundle means the lists are
   constructed where they are consumed, and never travel through the RSC
   payload — which is what produced a flood of "Only plain objects can be
   passed to Client Components" errors, one per nav item, on every render. */

import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  BrainCircuit,
  CalendarRange,
  Calendar,
  CalendarCheck,
  ClipboardList,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  Flame,
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  MessageSquare,
  MonitorPlay,
  NotebookPen,
  PenLine,
  Route,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Sparkles,
  Trophy,
  TrendingUp,
  UserX,
  Users,
  Video,
  WandSparkles,
  Zap,
  Newspaper,
} from 'lucide-react'
import { ADMIN_NAV as RAW_ADMIN_NAV } from '@/components/admin/nav'
import type { NavSection } from './types'

/* ============================================================================
   Navigation registries.

   Each portal's nav lives here rather than inside its sidebar component, so
   the sidebar, the command palette and the header breadcrumb all read from one
   list. Adding a page means adding one entry, and it appears in all three.
   ========================================================================= */

/* Paper Generator sits directly under Dashboard rather than inside Assessment:
   it is the flagship tool and burying it cost a click on every use. */
export const TEACHER_NAV: NavSection[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard, exact: true, hint: 'Teaching overview' },
      { label: 'Paper Generator', href: '/teacher/generator', icon: WandSparkles, hint: 'Build exam papers' },
    ],
  },
  {
    heading: 'Teaching',
    items: [
      { label: 'Live Class', href: '/teacher/live-class', icon: MonitorPlay, hint: 'Run a live session' },
      { label: 'Lesson Planner', href: '/teacher/lesson-planner', icon: BookOpen, hint: 'Plan lessons' },
      { label: 'Pacing Tracker', href: '/teacher/pacing', icon: Clock, hint: 'Syllabus pace' },
      { label: 'Collaboration Board', href: '/teacher/collab', icon: Users, hint: 'Shared planning' },
      { label: 'Substitute Briefing', href: '/teacher/substitute', icon: FileText, hint: 'Cover notes' },
    ],
  },
  {
    heading: 'Assessments',
    items: [
      { label: 'Test Creator', href: '/teacher/test-creator', icon: FileCheck, hint: 'Build tests' },
      { label: 'Homework', href: '/teacher/homework', icon: ClipboardList, hint: 'Assign homework' },
      { label: 'Rubric Scorer', href: '/teacher/rubric', icon: NotebookPen, hint: 'Score with rubrics' },
      { label: 'Grade Distribution', href: '/teacher/grade-distribution', icon: BarChart3, hint: 'Grade spread' },
    ],
  },
  {
    heading: 'Students',
    items: [
      { label: 'At-Risk Students', href: '/teacher/at-risk', icon: ShieldAlert, hint: 'Intervention plans' },
      { label: 'Learning Paths', href: '/teacher/learning-paths', icon: Route, hint: 'Per-student paths' },
      { label: 'Student Portfolio', href: '/teacher/portfolio', icon: GraduationCap, hint: 'Student portfolios' },
      { label: 'Attendance', href: '#', icon: CalendarCheck, disabled: true, hint: 'Not built yet' },
      { label: 'Student Overview', href: '#', icon: Users, disabled: true, hint: 'Not built yet' },
    ],
  },
  {
    heading: 'Reports & Insights',
    items: [
      { label: 'Mark Predictor', href: '/teacher/mark-predictor', icon: BrainCircuit, hint: 'Predicted marks' },
      { label: 'Emotion Report', href: '/teacher/emotion-report', icon: Smile, hint: 'Class mood' },
      { label: 'Energy Map', href: '/teacher/energy-map', icon: Zap, hint: 'Attention by period' },
      { label: 'Attendance Patterns', href: '/teacher/absence-patterns', icon: UserX, hint: 'Attendance trends' },
      { label: 'Growth Tracker', href: '/teacher/growth', icon: TrendingUp, hint: 'Your development' },
    ],
  },
  {
    heading: 'Communication',
    items: [
      { label: 'Parent Hub', href: '/teacher/parent-hub', icon: MessageSquare, hint: 'Message parents' },
      { label: 'Meetings', href: '/teacher/meetings', icon: Calendar, hint: 'Schedule meetings' },
      { label: 'Feedback', href: '/teacher/feedback', icon: Activity, hint: 'Quick pulse checks' },
    ],
  },
]

export const STUDENT_NAV: NavSection[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard, hint: 'Your overview' },
      { label: 'Progress', href: '/student/progress', icon: TrendingUp, hint: 'Marks over time' },
      { label: 'Streak', href: '/student/streak', icon: Flame, hint: 'Daily study streak' },
    ],
  },
  {
    heading: 'Learn',
    items: [
      { label: 'Study', href: '/student/study', icon: BookOpen, hint: 'Study material' },
      { label: 'Lectures', href: '/student/lectures', icon: Video, hint: 'Recorded lectures' },
      { label: 'Schedule', href: '/student/schedule', icon: Clock, hint: 'Your timetable' },
    ],
  },
  {
    heading: 'Practice',
    items: [
      { label: 'Quiz', href: '/student/quiz', icon: Brain, hint: 'Practice quizzes' },
      { label: 'Exam Simulator', href: '/student/simulator', icon: Zap, hint: 'Timed mock exams' },
      { label: 'Past Papers', href: '/student/past-papers', icon: FileText, hint: 'Board past papers' },
      { label: 'Brain Gym', href: '/student/brain-gym', icon: Gamepad2, hint: 'Memory drills' },
      { label: 'Essay Lab', href: '/student/essay', icon: PenLine, hint: 'Essay practice' },
      { label: 'Exams', href: '/student/exams', icon: CalendarRange, hint: 'Upcoming exams' },
    ],
  },
  {
    heading: 'AI Tools',
    items: [
      { label: 'AI Ask', href: '/student/ai-ask', icon: Sparkles, hint: 'Ask a question' },
      { label: 'AI Checker', href: '/student/ai-checker', icon: ShieldCheck, hint: 'Check your work' },
    ],
  },
  {
    heading: 'Community',
    items: [
      { label: 'Toppers', href: '/student/toppers', icon: Trophy, hint: 'Leaderboard' },
      { label: 'Board News', href: '/student/board-news', icon: Newspaper, hint: 'BISE updates' },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Help Desk', href: '/student/helpdesk', icon: MessageSquare, hint: 'Get help' },
      { label: 'Feedback', href: '/student/feedback', icon: HeartHandshake, hint: 'Tell us anything' },
      { label: 'Checkout', href: '/student/checkout', icon: CreditCard, hint: 'Plan & billing' },
    ],
  },
]

/* The admin list still lives in components/admin/nav.ts (the admin header
   already depends on it) and is adapted here.

   `/admin` is the portal index, so it must match exactly — without this every
   `/admin/*` route would also light up "Live Pulse" in the sidebar. The other
   portals declare `exact` inline; admin gets it applied on the way through. */
export const ADMIN_NAV: NavSection[] = RAW_ADMIN_NAV.map((section) => ({
  heading: section.heading,
  items: section.items.map((item) => ({
    ...item,
    exact: item.href === '/admin',
  })),
}))

export const PORTAL_ICONS = { Bell }
