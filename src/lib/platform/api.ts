/**
 * Route-handler wrapper.
 *
 * This is composition, not a new framework: authentication, rate limiting and
 * audit stay in `lib/security/rbac`, and error shaping stays in
 * `lib/security/errors`. What this adds is the observability every handler
 * would otherwise repeat by hand — a correlation id, a latency sample, a
 * structured log line, and an error record for the health dashboard.
 *
 * Handlers return plain data and it is wrapped in the standard
 * `{ success, data }` envelope. Returning a `NextResponse` directly (file
 * downloads, custom headers) passes straight through untouched.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { handleApiError, apiSuccess } from '@/lib/security/errors'
import { requireApiRole, type UserRole, type ZeeTokenPayload } from '@/lib/security/rbac'
import type { RateLimitPreset } from '@/lib/security/rate-limit'
import { logger, type ChildLogger } from './logger'
import { observe, recordError, increment } from './metrics'

export interface ApiContext<P = Record<string, string>> {
  req: NextRequest
  /** Present whenever `roles` is configured; `null` on public endpoints. */
  user: ZeeTokenPayload
  /** Resolved dynamic route params. */
  params: P
  /** Correlation id, also returned to the caller as `x-request-id`. */
  requestId: string
  /** Logger pre-stamped with requestId, route, user and role. */
  log: ChildLogger
  /** Parsed query string of the incoming request. */
  query: URLSearchParams
}

export interface ApiConfig {
  /** Roles permitted to call this handler. */
  roles: readonly UserRole[]
  /** Stable metric/log name, e.g. 'GET /api/analytics/question-bank'. */
  name: string
  /** Throttle bucket. Defaults to 'standard'; `false` disables. */
  rateLimit?: RateLimitPreset | false
}

type Handler<P> = (ctx: ApiContext<P>) => Promise<unknown>

/**
 * Next 16 passes dynamic params as a promise. Accepting the promise shape
 * keeps the wrapper compatible with both static and dynamic segments.
 */
type RouteArgs<P> = { params?: Promise<P> } | undefined

export function withApi<P = Record<string, string>>(
  config: ApiConfig,
  handler: Handler<P>,
): (req: NextRequest, args?: RouteArgs<P>) => Promise<NextResponse> {
  return async function route(req: NextRequest, args?: RouteArgs<P>): Promise<NextResponse> {
    const started = performance.now()
    // Reuse an upstream correlation id when a proxy or client supplies one, so
    // a single trace spans the whole request chain.
    const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID()

    const guard = await requireApiRole(config.roles, {
      rateLimit: config.rateLimit,
      action: config.name,
    })

    if (guard instanceof NextResponse) {
      const ms = performance.now() - started
      observe('api', config.name, ms, false)
      increment(`api.rejected.${guard.status}`)
      logger.warn('api.rejected', {
        requestId,
        route: config.name,
        status: guard.status,
        durationMs: Math.round(ms),
      })
      guard.headers.set('x-request-id', requestId)
      return guard
    }

    const { user } = guard
    const log = logger.child({
      requestId,
      route: config.name,
      userId: user.id,
      role: user.role,
    })

    try {
      const params = ((await args?.params) ?? {}) as P

      const result = await handler({
        req,
        user,
        params,
        requestId,
        log,
        query: req.nextUrl.searchParams,
      })

      const ms = performance.now() - started
      observe('api', config.name, ms, true)
      log.info('api.ok', { durationMs: Math.round(ms) })

      const response = result instanceof NextResponse ? result : apiSuccess(result)
      response.headers.set('x-request-id', requestId)
      response.headers.set('server-timing', `handler;dur=${ms.toFixed(1)}`)
      return response
    } catch (err) {
      const ms = performance.now() - started
      observe('api', config.name, ms, false)

      const response = handleApiError(err, config.name)
      recordError({
        name: err instanceof Error ? err.name : 'UnknownError',
        // `handleApiError` has already mapped the throw to a client-safe code;
        // mirroring it here keeps the dashboard and the client in agreement.
        code: String((await response.clone().json().catch(() => ({}))).error ?? 'INTERNAL_ERROR'),
        message: err instanceof Error ? err.message : String(err),
        route: config.name,
      })
      log.error('api.failed', {
        durationMs: Math.round(ms),
        status: response.status,
        err,
      })

      response.headers.set('x-request-id', requestId)
      return response
    }
  }
}
