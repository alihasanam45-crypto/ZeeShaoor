'use client'

import { useState } from 'react'
import { Bell, Focus } from 'lucide-react'
import PortalShell from '@/components/shell/PortalShell'
import { cn } from '@/components/ui/cn'
import AIAssistOrb from './AIAssistOrb'
import NotificationHub, { SEED_NOTIFICATIONS, type HubNotification } from './NotificationHub'

/**
 * Student portal frame.
 *
 * Runs on the shared `AppShell` (via `PortalShell`) so the student portal now
 * matches the teacher and admin portals exactly, and contributes its own
 * portal-specific extras through the header and overlay slots.
 *
 * Focus Mode is redefined here. It used to only narrow the sidebar, which the
 * shell's own persisted collapse control already does better. It now does what
 * the name promises: silences the ambient distractions — the AI orb and the
 * notification bell — so a student mid-revision is not pulled away.
 */
export default function StudentShell({ children }: { children: React.ReactNode }) {
  const [focusMode, setFocusMode] = useState(false)
  const [hubOpen, setHubOpen] = useState(false)
  const [notifications, setNotifications] = useState<HubNotification[]>(SEED_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => n.unread).length

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))

  return (
    <PortalShell
      brand={{ title: 'ZeeShaoor.pk', subtitle: 'Student Portal', href: '/student/dashboard' }}
      portal="student"
      role="Student"
      // Dashboard widgets dim themselves in focus mode via
      // `group-data-[focus=on]/shell:*`, so the shell root must keep exposing
      // both the group name and the state attribute.
      rootClassName="group/shell"
      rootData={{ 'data-focus': focusMode ? 'on' : 'off' }}
      headerActions={
        <>
          <button
            onClick={() => setFocusMode((v) => !v)}
            aria-pressed={focusMode}
            title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode — hides notifications and the AI orb'}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-medium transition-colors',
              focusMode
                ? 'bg-accent-soft text-accent-text'
                : 'text-fg-subtle hover:bg-surface-hover hover:text-fg',
            )}
          >
            <Focus className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span className="hidden lg:inline">{focusMode ? 'Focus on' : 'Focus'}</span>
          </button>

          {!focusMode && (
            <button
              onClick={() => setHubOpen(true)}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              className="relative rounded-xl p-2 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-fg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
        </>
      }
      overlays={
        <>
          <NotificationHub
            open={hubOpen}
            notifications={notifications}
            onClose={() => setHubOpen(false)}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />
          {!focusMode && <AIAssistOrb />}
        </>
      }
    >
      {children}
    </PortalShell>
  )
}
