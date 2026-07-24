'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from './cn'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: number
  message: string
  description?: string
  type: ToastType
  /** ms before auto-dismiss. `0` keeps it until dismissed. */
  duration: number
}

type ShowToastOptions = {
  description?: string
  duration?: number
}

type ToastContextValue = {
  showToast: (message: string, type?: ToastType, options?: ShowToastOptions) => number
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const CONFIG: Record<
  ToastType,
  { Icon: typeof CheckCircle2; ring: string; iconColor: string; role: 'status' | 'alert' }
> = {
  success: {
    Icon: CheckCircle2,
    ring: 'ring-success-soft',
    iconColor: 'text-success-text',
    role: 'status',
  },
  error: {
    Icon: XCircle,
    ring: 'ring-danger-soft',
    iconColor: 'text-danger-text',
    role: 'alert',
  },
  warning: {
    Icon: AlertTriangle,
    ring: 'ring-warning-soft',
    iconColor: 'text-warning-text',
    role: 'alert',
  },
  info: {
    Icon: Info,
    ring: 'ring-accent-soft',
    iconColor: 'text-accent-text',
    role: 'status',
  },
}

/**
 * Toast host.
 *
 * Improvements over the previous implementation:
 *  - theme-aware surfaces instead of a hardcoded near-black card
 *  - timers are tracked in a ref and cleared on unmount (they leaked before)
 *  - errors use `role="alert"`, successes `role="status"`, so failures
 *    interrupt a screen reader and routine confirmations do not
 *  - each toast is dismissible, and hovering the stack pauses auto-dismiss
 *  - the viewport is bottom-right on desktop and top on mobile, where the
 *    bottom edge collides with browser chrome and thumbs
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const nextId = useRef(0)

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const scheduleDismiss = useCallback(
    (id: number, duration: number) => {
      if (duration <= 0) return
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), duration),
      )
    },
    [dismissToast],
  )

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options: ShowToastOptions = {}) => {
      // Date.now() collided when two toasts fired in the same millisecond,
      // producing duplicate React keys. A counter cannot collide.
      const id = ++nextId.current
      // Errors linger: they usually carry something the user must act on.
      const duration = options.duration ?? (type === 'error' ? 8000 : 4500)

      setToasts((prev) => [...prev, { id, message, description: options.description, type, duration }])
      scheduleDismiss(id, duration)
      return id
    },
    [scheduleDismiss],
  )

  // Clear every pending timer if the provider unmounts mid-flight.
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [])

  const pauseAll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current.clear()
  }, [])

  const resumeAll = useCallback(() => {
    setToasts((current) => {
      current.forEach((t) => {
        if (!timers.current.has(t.id)) scheduleDismiss(t.id, t.duration)
      })
      return current
    })
  }, [scheduleDismiss])

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        // `pointer-events-none` on the viewport lets clicks pass through the
        // empty area; each card re-enables them for itself.
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:bottom-0 sm:right-0 sm:top-auto sm:items-end"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((toast) => {
          const { Icon, ring, iconColor, role } = CONFIG[toast.type]
          return (
            <div
              key={toast.id}
              role={role}
              onMouseEnter={pauseAll}
              onMouseLeave={resumeAll}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-surface-overlay p-3.5 shadow-overlay ring-1 ring-inset',
                'animate-slide-up',
                ring,
              )}
            >
              <Icon className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', iconColor)} aria-hidden />

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-snug text-fg">{toast.message}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-fg-subtle">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="-m-1 shrink-0 rounded-md p-1 text-fg-faint transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
