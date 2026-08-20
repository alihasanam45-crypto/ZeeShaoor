'use client'

// Client-only: the `icon` fields are React components and must not cross the
// server→client boundary. See components/shell/nav.ts for the full rationale.

import type { ElementType } from 'react'
import {
  Activity, Heart, HeartPulse, Network, TrendingUp,
  Cpu, BrainCircuit, Dna, ShieldCheck,
  BookOpen, FileText, Database, Upload, Calendar, Clock,
  Award, DollarSign, Megaphone, MessageSquareWarning,
  HeartPulse as Pulse, Trash2, Download, Archive, Fingerprint,
} from 'lucide-react'

export type AdminNavItem = { label: string; href: string; icon: ElementType; hint?: string }
export type AdminNavSection = { heading: string; items: AdminNavItem[] }

// Grouped exactly per the v7.0 blueprint: Monitoring, AI Control,
// Content Management, System Health — covering all 20 admin features.
export const ADMIN_NAV: AdminNavSection[] = [
  {
    heading: 'Monitoring',
    items: [
      { label: 'Live Pulse', href: '/admin', icon: Activity, hint: 'Real-time school dashboard' },
      { label: 'Student Wellbeing', href: '/admin/wellbeing', icon: Heart, hint: 'Crisis detection AI' },
      { label: 'Teacher Wellbeing', href: '/admin/teacher-wellbeing', icon: HeartPulse, hint: 'Burnout monitor' },
      { label: 'Connectivity Map', href: '/admin/connectivity', icon: Network, hint: 'Teacher–student engagement' },
      { label: 'Growth', href: '/admin/growth', icon: TrendingUp, hint: 'Enrollment & usage trends' },
    ],
  },
  {
    heading: 'AI Control',
    items: [
      { label: 'AI Usage Controller', href: '/admin/ai-control', icon: Cpu, hint: 'Limits, cache & cost' },
      { label: 'Predictions', href: '/admin/predictions', icon: BrainCircuit, hint: 'Problems before they happen' },
      { label: 'School DNA', href: '/admin/school-dna', icon: Dna, hint: 'What makes this school unique' },
      { label: 'Board Readiness', href: '/admin/board-readiness', icon: ShieldCheck, hint: 'Exam readiness score' },
    ],
  },
  {
    heading: 'Content Management',
    items: [
      { label: 'CSV Books', href: '/admin/books', icon: BookOpen, hint: 'Class 5–12 content' },
      { label: 'Past Paper Vault', href: '/admin/past-papers', icon: FileText, hint: 'Permanent paper archive' },
      { label: 'Data Bank', href: '/admin/data-bank', icon: Database, hint: 'Question bank' },
      { label: 'Upload Centre', href: '/admin/upload', icon: Upload, hint: 'Batch uploads' },
      { label: 'Academic Calendar', href: '/admin/calendar', icon: Calendar, hint: 'Terms, exams & holidays' },
      { label: 'Timetable AI', href: '/admin/timetable', icon: Clock, hint: 'Staff timetable optimizer' },
      { label: 'Awards Engine', href: '/admin/awards', icon: Award, hint: 'Scholarships & awards' },
      { label: 'Fee Automation', href: '/admin/fees', icon: DollarSign, hint: 'Reminders & receipts' },
      { label: 'Broadcast', href: '/admin/broadcast', icon: Megaphone, hint: 'Emergency messaging' },
      { label: 'Complaint Box', href: '/admin/complaints', icon: MessageSquareWarning, hint: 'Anonymous complaints' },
    ],
  },
  {
    heading: 'System Health',
    items: [
      { label: 'Portal Health', href: '/admin/health', icon: Pulse, hint: 'Uptime, errors & queries' },
      { label: 'Auto-Delete', href: '/admin/auto-delete', icon: Trash2, hint: 'TTL orchestrator' },
      { label: 'Data Exports', href: '/admin/exports', icon: Download, hint: 'CSV / Excel / PDF' },
      { label: 'Legacy Archive', href: '/admin/archive', icon: Archive, hint: 'Year-end archiver' },
      { label: 'System IDs', href: '/admin/system-ids', icon: Fingerprint, hint: 'Accounts & credentials' },
    ],
  },
]
