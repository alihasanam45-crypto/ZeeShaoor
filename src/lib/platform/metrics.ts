/**
 * In-process metrics registry.
 *
 * Deliberately dependency-free and bounded: a fixed-size ring buffer per series
 * so memory stays flat no matter how long the process lives. This is the source
 * behind /api/system/metrics and the admin health page.
 *
 * Scope note: metrics are per server process. With several instances behind a
 * load balancer each reports its own slice, which is the correct behaviour for
 * a health probe. Cross-instance aggregation belongs in a real TSDB
 * (Prometheus/Datadog) — `snapshot()` is shaped to export cleanly into one.
 */

const RING_CAPACITY = 500

export type MetricKind = 'api' | 'db' | 'ai' | 'job' | 'auth'

export interface Sample {
  /** Epoch millis when the observation completed. */
  at: number
  /** Duration in milliseconds. */
  ms: number
  ok: boolean
}

interface Series {
  name: string
  kind: MetricKind
  samples: Sample[]
  /** Write cursor for the ring buffer. */
  cursor: number
  total: number
  failures: number
}

interface Counter {
  name: string
  value: number
}

interface MetricsState {
  series: Map<string, Series>
  counters: Map<string, Counter>
  slowQueries: SlowEvent[]
  recentErrors: ErrorEvent[]
  startedAt: number
}

export interface SlowEvent {
  at: number
  kind: MetricKind
  name: string
  ms: number
  meta?: Record<string, unknown>
}

export interface ErrorEvent {
  at: number
  name: string
  code: string
  message: string
  route?: string
}

declare global {
  // eslint-disable-next-line no-var
  var __zeeMetrics: MetricsState | undefined
}

const state: MetricsState = globalThis.__zeeMetrics ?? {
  series: new Map(),
  counters: new Map(),
  slowQueries: [],
  recentErrors: [],
  startedAt: Date.now(),
}
globalThis.__zeeMetrics = state

/** Observations slower than this are captured in the slow-event log. */
export const SLOW_THRESHOLD_MS: Record<MetricKind, number> = {
  api: 1_000,
  db: 300,
  ai: 1_500,
  job: 5_000,
  auth: 800,
}

const MAX_SLOW_EVENTS = 100
const MAX_ERROR_EVENTS = 100

function seriesKey(kind: MetricKind, name: string): string {
  return `${kind}:${name}`
}

export function observe(
  kind: MetricKind,
  name: string,
  ms: number,
  ok = true,
  meta?: Record<string, unknown>,
): void {
  const key = seriesKey(kind, name)
  let series = state.series.get(key)
  if (!series) {
    series = { name, kind, samples: new Array<Sample>(RING_CAPACITY), cursor: 0, total: 0, failures: 0 }
    state.series.set(key, series)
  }

  series.samples[series.cursor] = { at: Date.now(), ms, ok }
  series.cursor = (series.cursor + 1) % RING_CAPACITY
  series.total += 1
  if (!ok) series.failures += 1

  if (ms >= SLOW_THRESHOLD_MS[kind]) {
    state.slowQueries.unshift({ at: Date.now(), kind, name, ms: Math.round(ms), meta })
    if (state.slowQueries.length > MAX_SLOW_EVENTS) state.slowQueries.length = MAX_SLOW_EVENTS
  }
}

export function increment(name: string, by = 1): void {
  const existing = state.counters.get(name)
  if (existing) existing.value += by
  else state.counters.set(name, { name, value: by })
}

export function recordError(event: Omit<ErrorEvent, 'at'>): void {
  state.recentErrors.unshift({ ...event, at: Date.now() })
  if (state.recentErrors.length > MAX_ERROR_EVENTS) state.recentErrors.length = MAX_ERROR_EVENTS
  increment('errors.total')
  increment(`errors.${event.code}`)
}

/** Times an async operation, recording duration and outcome either way. */
export async function timed<T>(
  kind: MetricKind,
  name: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>,
): Promise<T> {
  const started = performance.now()
  try {
    const result = await fn()
    observe(kind, name, performance.now() - started, true, meta)
    return result
  } catch (err) {
    observe(kind, name, performance.now() - started, false, meta)
    throw err
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  // Nearest-rank: index of the smallest value at or above the p-th percentile.
  const rank = Math.ceil((p / 100) * sorted.length)
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))]
}

export interface SeriesStats {
  name: string
  kind: MetricKind
  count: number
  totalObserved: number
  errorRate: number
  avgMs: number
  p50Ms: number
  p95Ms: number
  p99Ms: number
  maxMs: number
  lastAt: number | null
}

function summarise(series: Series, windowMs?: number): SeriesStats {
  const cutoff = windowMs ? Date.now() - windowMs : 0
  const live = series.samples.filter((s): s is Sample => Boolean(s) && s.at >= cutoff)
  const durations = live.map((s) => s.ms).sort((a, b) => a - b)
  const failures = live.filter((s) => !s.ok).length

  return {
    name: series.name,
    kind: series.kind,
    count: live.length,
    totalObserved: series.total,
    errorRate: live.length === 0 ? 0 : round(failures / live.length, 4),
    avgMs: durations.length === 0 ? 0 : round(durations.reduce((a, b) => a + b, 0) / durations.length, 1),
    p50Ms: round(percentile(durations, 50), 1),
    p95Ms: round(percentile(durations, 95), 1),
    p99Ms: round(percentile(durations, 99), 1),
    maxMs: durations.length === 0 ? 0 : round(durations[durations.length - 1], 1),
    lastAt: live.length === 0 ? null : Math.max(...live.map((s) => s.at)),
  }
}

function round(n: number, dp = 2): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

export interface MetricsSnapshot {
  uptimeMs: number
  collectedAt: string
  series: SeriesStats[]
  counters: Record<string, number>
  slowEvents: SlowEvent[]
  recentErrors: ErrorEvent[]
  totals: {
    requests: number
    errors: number
    errorRate: number
    avgLatencyMs: number
    p95LatencyMs: number
  }
}

export function snapshot(options: { windowMs?: number } = {}): MetricsSnapshot {
  const series = [...state.series.values()]
    .map((s) => summarise(s, options.windowMs))
    .sort((a, b) => b.p95Ms - a.p95Ms)

  const apiSeries = series.filter((s) => s.kind === 'api')
  const apiCount = apiSeries.reduce((sum, s) => sum + s.count, 0)
  const apiErrors = apiSeries.reduce((sum, s) => sum + s.count * s.errorRate, 0)
  const weightedAvg = apiCount === 0
    ? 0
    : apiSeries.reduce((sum, s) => sum + s.avgMs * s.count, 0) / apiCount

  return {
    uptimeMs: Date.now() - state.startedAt,
    collectedAt: new Date().toISOString(),
    series,
    counters: Object.fromEntries([...state.counters.values()].map((c) => [c.name, c.value])),
    slowEvents: state.slowQueries.slice(0, 25),
    recentErrors: state.recentErrors.slice(0, 25),
    totals: {
      requests: apiCount,
      errors: Math.round(apiErrors),
      errorRate: apiCount === 0 ? 0 : round(apiErrors / apiCount, 4),
      avgLatencyMs: round(weightedAvg, 1),
      p95LatencyMs: apiSeries.length === 0 ? 0 : round(Math.max(...apiSeries.map((s) => s.p95Ms)), 1),
    },
  }
}

/** Test/ops hook — drops every collected observation. */
export function resetMetrics(): void {
  state.series.clear()
  state.counters.clear()
  state.slowQueries.length = 0
  state.recentErrors.length = 0
  state.startedAt = Date.now()
}
