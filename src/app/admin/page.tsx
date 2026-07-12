'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Users, Server, Wallet, Smile, Activity, AlertTriangle, ShieldAlert,
  Zap, ArrowUpRight, ArrowDownRight, Cpu, Database, Megaphone, HeartPulse,
} from 'lucide-react'

type Metric = {
  key: string
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: React.ElementType
  color: string
  bg: string
  trend: 'up' | 'down'
  trendPct: number
  min: number
  max: number
  jitter: number
}

type AnomalyEvent = {
  id: number
  severity: 'critical' | 'warning' | 'info'
  message: string
  time: string
}

type LoginPoint = { time: string; logins: number }

const CARD = 'rounded-[2rem] border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-md'

// Deterministic seeds so the server and client render identical first paint.
const INITIAL_METRICS: Metric[] = [
  { key: 'students', label: 'Active Students', value: 847, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 'up', trendPct: 12, min: 700, max: 1000, jitter: 14 },
  { key: 'load', label: 'AI Server Load', value: 42, suffix: '%', icon: Server, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: 'down', trendPct: 6, min: 20, max: 96, jitter: 8 },
  { key: 'fees', label: "Today's Fees Collected", value: 184500, prefix: 'Rs ', icon: Wallet, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: 'up', trendPct: 9, min: 150000, max: 400000, jitter: 6500 },
  { key: 'mood', label: 'School Mood', value: 82, suffix: '%', icon: Smile, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 'up', trendPct: 5, min: 55, max: 98, jitter: 3 },
]

const SEED_ANOMALIES: AnomalyEvent[] = [
  { id: 1, severity: 'critical', message: 'Login rate dropped 71% below baseline at 15:00 — node-03 investigated', time: 'moments ago' },
  { id: 2, severity: 'warning', message: '500 chat records auto-delete in 2 hours (TTL orchestrator)', time: '4 min ago' },
  { id: 3, severity: 'info', message: 'New Past Paper uploaded — Biology 10th, Punjab Board', time: '9 min ago' },
  { id: 4, severity: 'warning', message: 'AI request spike from Class 9-B — 3× daily average', time: '12 min ago' },
  { id: 5, severity: 'info', message: 'Auto-backup completed — 234 MB stored to archive', time: '21 min ago' },
  { id: 6, severity: 'critical', message: 'Database replication lag reached 12s — self-recovered', time: '26 min ago' },
  { id: 7, severity: 'info', message: 'AI Content Filter updated to v3.2 across all classes', time: '38 min ago' },
]

const LIVE_FEED_POOL: { severity: AnomalyEvent['severity']; message: string }[] = [
  { severity: 'info', message: 'Quiz submission spike detected — Class 10-A Physics' },
  { severity: 'warning', message: 'Teacher session timeout threshold reached on node-02' },
  { severity: 'info', message: 'New student registration batch synced to MongoDB Atlas' },
  { severity: 'critical', message: 'Server load spiked to 89% on node-03 — autoscaling engaged' },
  { severity: 'info', message: 'Parent report batch generated for Class 8 — 42 PDFs' },
  { severity: 'warning', message: 'Cache hit rate dipped below 60% — AI cost watch active' },
  { severity: 'info', message: 'Bandwidth usage at 67% capacity — nominal' },
]

const QUICK_ACTIONS = [
  { label: 'AI Control', hint: 'Limits, cache & cost', href: '/admin/ai-control', icon: Cpu, accent: 'text-cyan-400 bg-cyan-500/10 group-hover:bg-cyan-500/20' },
  { label: 'Data Bank', hint: 'Question bank manager', href: '/admin/data-bank', icon: Database, accent: 'text-indigo-400 bg-indigo-500/10 group-hover:bg-indigo-500/20' },
  { label: 'Broadcast', hint: 'Emergency messaging', href: '/admin/broadcast', icon: Megaphone, accent: 'text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20' },
  { label: 'Portal Health', hint: 'Uptime & error rates', href: '/admin/health', icon: HeartPulse, accent: 'text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20' },
]

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

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
    <span className="tabular-nums">
      {prefix}{displayed.toLocaleString('en-US')}{suffix}
    </span>
  )
}

const SEVERITY_STYLE: Record<AnomalyEvent['severity'], { chrome: string; icon: string }> = {
  critical: { chrome: 'border-red-500/15 bg-red-500/5', icon: 'text-red-400' },
  warning: { chrome: 'border-amber-500/15 bg-amber-500/5', icon: 'text-amber-400' },
  info: { chrome: 'border-slate-700/50 bg-slate-800/40', icon: 'text-indigo-400' },
}

export default function LiveSchoolPulse() {
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS)
  const [loginData, setLoginData] = useState<LoginPoint[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(SEED_ANOMALIES)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const nextId = useRef(SEED_ANOMALIES.length + 1)

  // Random data is generated only on the client, after hydration.
  useEffect(() => {
    setLoginData(generateLoginData())
    setLastSync(clock())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          const drift = Math.round((Math.random() - 0.45) * m.jitter)
          return {
            ...m,
            value: clamp(m.value + drift, m.min, m.max),
            trend: drift >= 0 ? 'up' : 'down',
            trendPct: clamp(m.trendPct + (Math.random() > 0.5 ? 1 : -1), 1, 30),
          }
        }),
      )
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Live School Pulse</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Real-time command center{lastSync ? ` · synced ${lastSync}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
          All systems operational
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`${CARD} p-6 transition-colors hover:border-slate-700`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-xl p-2.5 ${m.bg}`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  m.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {m.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {m.trendPct}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className={`${CARD} p-8 xl:col-span-2`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Logins Per Hour</h2>
            </div>
            {anomalyIndex >= 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
                <AlertTriangle className="h-3 w-3" />
                Anomaly detected at {loginData[anomalyIndex].time}
              </div>
            )}
          </div>
          <div className="h-64">
            {loginData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loginData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="logins"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#loginGradient)"
                    dot={(props) => {
                      const { key, cx, cy, index } = props as { key?: string; cx?: number; cy?: number; index?: number }
                      const isAnomaly = index !== undefined && index === anomalyIndex
                      return isAnomaly ? (
                        <circle key={key} cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#7f1d1d" strokeWidth={2} />
                      ) : (
                        <circle key={key} cx={cx} cy={cy} r={0} fill="transparent" />
                      )
                    }}
                    activeDot={{ r: 4, fill: '#6366f1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={`${CARD} flex min-h-[22rem] flex-col p-8`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Anomaly Detection</h2>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                criticalCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {criticalCount} critical
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {anomalies.map((event, i) => {
              const style = SEVERITY_STYLE[event.severity]
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={`flex items-start gap-3 rounded-xl border p-2.5 text-xs ${style.chrome}`}
                >
                  <div className={`mt-0.5 shrink-0 ${style.icon}`}>
                    {event.severity === 'critical' ? (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    ) : event.severity === 'warning' ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <Activity className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="leading-relaxed text-slate-300">{event.message}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-600">{event.time}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`${CARD} group flex items-center gap-4 p-6 transition-colors hover:border-slate-700`}
          >
            <div className={`rounded-xl p-3 transition-colors ${action.accent}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="truncate text-xs text-slate-500">{action.hint}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
