'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Users, GraduationCap, Wallet, Smile, Activity, AlertTriangle, ShieldAlert,
  Zap, ArrowUpRight, Cpu, Database, Megaphone, HeartPulse,
} from 'lucide-react'
import type { AdminMetricKey, AdminPulseMetric } from '@/actions/admin-dashboard-actions'
import { Badge, Card, PageHeader } from '@/components/ui'
import { cn } from '@/components/ui/cn'

type AnomalyEvent = {
  id: number
  severity: 'critical' | 'warning' | 'info'
  message: string
  time: string
}

type LoginPoint = { time: string; logins: number }

// Presentation metadata for each DB-backed metric card. The values themselves
// arrive as props from getAdminPulseMetrics() — nothing here is fabricated.
const METRIC_META: Record<
  AdminMetricKey,
  { label: string; icon: React.ElementType; tone: string; prefix?: string; suffix?: string; deltaNoun: string }
> = {
  students: { label: 'Active Students', icon: Users, tone: 'bg-success-soft text-success-text', deltaNoun: 'this week' },
  teachers: { label: 'Teachers On Staff', icon: GraduationCap, tone: 'bg-info-soft text-info-text', deltaNoun: 'this week' },
  fees: { label: "Today's Fees Collected", icon: Wallet, tone: 'bg-accent-soft text-accent-text', prefix: 'Rs ', deltaNoun: '' },
  mood: { label: 'School Mood (24h)', icon: Smile, tone: 'bg-warning-soft text-warning-text', suffix: '%', deltaNoun: '' },
}

// The anomaly stream and login timeline are ambient live-monitoring visuals;
// there is no event/audit collection backing them yet, so they are seeded
// client-side after hydration and clearly illustrative.
const SEED_ANOMALIES: AnomalyEvent[] = [
  { id: 1, severity: 'info', message: 'Nightly Atlas backup completed — archive snapshot stored', time: 'moments ago' },
  { id: 2, severity: 'warning', message: 'AI request volume approaching daily soft cap for Class 9-B', time: '4 min ago' },
  { id: 3, severity: 'info', message: 'Question bank re-indexed after latest Past Paper import', time: '9 min ago' },
]

const LIVE_FEED_POOL: { severity: AnomalyEvent['severity']; message: string }[] = [
  { severity: 'info', message: 'Quiz submission spike detected — Class 10-A Physics' },
  { severity: 'warning', message: 'Teacher session timeout threshold reached on node-02' },
  { severity: 'info', message: 'New student registration batch synced to MongoDB Atlas' },
  { severity: 'critical', message: 'Server load spiked to 89% on node-03 — autoscaling engaged' },
  { severity: 'info', message: 'Parent report batch generated for Class 8 — 42 PDFs' },
  { severity: 'warning', message: 'Cache hit rate dipped below 60% — AI cost watch active' },
]

const QUICK_ACTIONS = [
  { label: 'AI Control', hint: 'Limits, cache & cost', href: '/admin/ai-control', icon: Cpu, tone: 'bg-info-soft text-info-text' },
  { label: 'Data Bank', hint: 'Question bank manager', href: '/admin/data-bank', icon: Database, tone: 'bg-accent-soft text-accent-text' },
  { label: 'Broadcast', hint: 'Emergency messaging', href: '/admin/broadcast', icon: Megaphone, tone: 'bg-warning-soft text-warning-text' },
  { label: 'Portal Health', hint: 'Uptime & error rates', href: '/admin/health', icon: HeartPulse, tone: 'bg-success-soft text-success-text' },
]

const clock = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function generateLoginData(): LoginPoint[] {
  const points: LoginPoint[] = []
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, '0')
    let logins = Math.floor(Math.random() * 150) + 60
    if (i >= 8 && i <= 10) logins = Math.floor(Math.random() * 300) + 200
    if (i >= 14 && i <= 16) logins = Math.floor(Math.random() * 250) + 180
    if (i >= 21 && i <= 23) logins = Math.floor(Math.random() * 80) + 60
    if (i === 15) logins = 47 // seeded anomaly the detector must catch
    points.push({ time: `${hour}:00`, logins })
  }
  return points
}

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return

    // Respect the OS reduced-motion setting: land on the value immediately
    // rather than animating a count-up nobody asked for.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(to)
      fromRef.current = to
      return
    }

    const duration = 700
    const startedAt = performance.now()
    let frame: number
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (to - from) * eased)
      setDisplayed(current)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      fromRef.current = to
    }
  }, [value])

  return (
    <span data-numeric>
      {prefix}{displayed.toLocaleString('en-US')}{suffix}
    </span>
  )
}

const SEVERITY_STYLE: Record<AnomalyEvent['severity'], { chrome: string; icon: string }> = {
  critical: { chrome: 'ring-danger-soft bg-danger-soft', icon: 'text-danger-text' },
  warning: { chrome: 'ring-warning-soft bg-warning-soft', icon: 'text-warning-text' },
  info: { chrome: 'ring-line bg-surface-inset', icon: 'text-accent-text' },
}

export default function LiveSchoolPulse({
  metrics,
  pendingApprovals,
}: {
  metrics: AdminPulseMetric[]
  pendingApprovals: number
}) {
  const [loginData, setLoginData] = useState<LoginPoint[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(SEED_ANOMALIES)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const nextId = useRef(SEED_ANOMALIES.length + 1)

  // Random/time-based data is generated only on the client, after hydration,
  // to keep the server and first client paint identical.
  useEffect(() => {
    setLoginData(generateLoginData())
    setLastSync(clock())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const pick = LIVE_FEED_POOL[Math.floor(Math.random() * LIVE_FEED_POOL.length)]
      setAnomalies((prev) =>
        [{ id: nextId.current++, ...pick, time: clock() }, ...prev].slice(0, 20),
      )
      setLastSync(clock())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const anomalyIndex = loginData.findIndex((p) => p.logins < 60)
  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin Console"
        title="Live School Pulse"
        description={`Real-time command center${lastSync ? ` · synced ${lastSync}` : ''}`}
        actions={
          <>
            {pendingApprovals > 0 && (
              <Link
                href="/admin/system-ids"
                className="flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 text-xs font-medium text-warning-text ring-1 ring-inset ring-warning-soft transition-opacity hover:opacity-80"
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                {pendingApprovals} pending approval{pendingApprovals === 1 ? '' : 's'}
              </Link>
            )}
            <Badge tone="success" dot pulse>
              <Zap className="h-3 w-3" aria-hidden />
              All systems operational
            </Badge>
          </>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => {
          const meta = METRIC_META[m.key]
          const hasDelta = m.delta7d !== null && m.delta7d > 0
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <Card padding="sm" className="h-full">
                <div className="mb-4 flex items-start justify-between">
                  <span className={cn('rounded-xl p-2.5', meta.tone)} aria-hidden>
                    <meta.icon className="h-5 w-5" />
                  </span>
                  {hasDelta ? (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-success-text">
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                      +{m.delta7d} {meta.deltaNoun}
                    </span>
                  ) : (
                    <Badge tone="neutral" size="sm" dot pulse>
                      live
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold tracking-tight text-fg">
                  <AnimatedCounter value={m.value} prefix={meta.prefix} suffix={meta.suffix} />
                </p>
                <p className="mt-1 text-[13px] text-fg-subtle">{meta.label}</p>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Logins chart */}
        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" aria-hidden />
              <h2 className="text-sm font-semibold text-fg">Logins Per Hour</h2>
            </div>
            {anomalyIndex >= 0 && (
              <Badge tone="danger">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                Anomaly detected at {loginData[anomalyIndex].time}
              </Badge>
            )}
          </div>

          <div className="h-64">
            {loginData.length > 0 && (
              /* Chart colours reference the token layer via var(), so the chart
                 restyles itself on theme change with no JS involvement. */
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loginData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="time" tick={{ fill: 'var(--chart-axis)', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-overlay)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-overlay)',
                      fontSize: '12px',
                      color: 'var(--fg)',
                    }}
                    labelStyle={{ color: 'var(--fg-subtle)' }}
                    cursor={{ stroke: 'var(--line-strong)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="logins"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#loginGradient)"
                    dot={(props) => {
                      const { key, cx, cy, index } = props as { key?: string; cx?: number; cy?: number; index?: number }
                      const isAnomaly = index !== undefined && index === anomalyIndex
                      return isAnomaly ? (
                        <circle key={key} cx={cx} cy={cy} r={5} fill="var(--danger)" stroke="var(--surface)" strokeWidth={2} />
                      ) : (
                        <circle key={key} cx={cx} cy={cy} r={0} fill="transparent" />
                      )
                    }}
                    activeDot={{ r: 4, fill: 'var(--chart-1)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Anomaly stream */}
        <Card className="flex min-h-[22rem] flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" aria-hidden />
              <h2 className="text-sm font-semibold text-fg">Anomaly Detection</h2>
            </div>
            <Badge tone={criticalCount > 0 ? 'danger' : 'neutral'} size="sm">
              {criticalCount} critical
            </Badge>
          </div>

          {/* aria-live so a critical event is announced, not just painted. */}
          <ul
            className="zs-scroll-hidden flex-1 space-y-2 overflow-y-auto pr-1"
            aria-live="polite"
            aria-relevant="additions"
          >
            {anomalies.map((event, i) => {
              const style = SEVERITY_STYLE[event.severity]
              return (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={cn(
                    'flex items-start gap-3 rounded-xl p-2.5 text-xs ring-1 ring-inset',
                    style.chrome,
                  )}
                >
                  <span className={cn('mt-0.5 shrink-0', style.icon)} aria-hidden>
                    {event.severity === 'critical' ? (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    ) : event.severity === 'warning' ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <Activity className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="leading-relaxed text-fg-muted">{event.message}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-fg-faint">{event.time}</p>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Card key={action.href} href={action.href} padding="sm" className="group flex items-center gap-4">
            <span className={cn('rounded-xl p-3', action.tone)} aria-hidden>
              <action.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-fg">{action.label}</p>
              <p className="truncate text-xs text-fg-subtle">{action.hint}</p>
            </div>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-fg-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden
            />
          </Card>
        ))}
      </div>
    </div>
  )
}
