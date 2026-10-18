/**
 * Uniform, non-leaking API responses.
 *
 * Returning `error.message` to a client hands out schema field names, index
 * names, file paths and driver versions. Mongoose duplicate-key errors are the
 * worst offender: they echo the colliding value back verbatim. Everything here
 * logs the detail server-side and returns a stable code to the caller.
 */

import { NextResponse } from 'next/server'

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'INTERNAL_ERROR'

const STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 400,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  INTERNAL_ERROR: 500,
}

/** Client-safe wording. Deliberately vague about *why* something was refused. */
const MESSAGE: Record<ErrorCode, string> = {
  UNAUTHORIZED: 'Authentication required.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_FAILED: 'The submitted data is invalid.',
  CONFLICT: 'That record already exists.',
  RATE_LIMITED: 'Too many requests. Please slow down.',
  PAYLOAD_TOO_LARGE: 'Request body is too large.',
  UNSUPPORTED_MEDIA_TYPE: 'Unsupported content type.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
}

export interface ApiErrorOptions {
  /** Field-level messages. Safe to expose — they describe the caller's input. */
  fieldErrors?: Record<string, string>
  /** Overrides the canned message. Must not contain server internals. */
  message?: string
  /** Extra response headers, e.g. `Retry-After`. */
  headers?: Record<string, string>
}

export function apiError(code: ErrorCode, options: ApiErrorOptions = {}): NextResponse {
  const body: Record<string, unknown> = {
    success: false,
    error: code,
    message: options.message ?? MESSAGE[code],
  }
  if (options.fieldErrors && Object.keys(options.fieldErrors).length > 0) {
    body.fieldErrors = options.fieldErrors
  }

  return NextResponse.json(body, {
    status: STATUS[code],
    headers: {
      // Authorization-dependent responses must never land in a shared cache.
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...options.headers,
    },
  })
}

export function apiSuccess<T>(data: T, init: { status?: number; headers?: Record<string, string> } = {}) {
  return NextResponse.json(
    { success: true, data },
    {
      status: init.status ?? 200,
      headers: {
        // Per-user data is private by default; opt in to caching explicitly.
        'Cache-Control': 'private, no-store',
        ...init.headers,
      },
    },
  )
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: number }).code === 11000
  )
}

function isValidationError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: string }).name === 'ValidationError'
  )
}

/**
 * Terminal catch handler for route handlers.
 *
 * Recognizes the sentinel errors thrown by the RBAC guards so server actions
 * and routes converge on the same status codes, logs everything else with a
 * correlation id, and returns an opaque 500.
 */
export function handleApiError(err: unknown, context: string): NextResponse {
  const message = err instanceof Error ? err.message : String(err)

  if (message === 'UNAUTHORIZED') return apiError('UNAUTHORIZED')
  if (message.startsWith('FORBIDDEN')) return apiError('FORBIDDEN')
  if (message === 'NOT_FOUND') return apiError('NOT_FOUND')
  if (message === 'RATE_LIMITED') return apiError('RATE_LIMITED')

  if (isDuplicateKeyError(err)) return apiError('CONFLICT')

  if (isValidationError(err)) {
    // Mongoose validator messages name the offending field, which is the
    // caller's own input — safe, and far more useful than a bare 400.
    const fieldErrors: Record<string, string> = {}
    const errors = (err as { errors?: Record<string, { message?: string }> }).errors ?? {}
    for (const [field, detail] of Object.entries(errors)) {
      fieldErrors[field] = detail?.message ?? 'Invalid value.'
    }
    return apiError('VALIDATION_FAILED', { fieldErrors })
  }

  const incidentId = crypto.randomUUID()
  console.error(`[api-error] ${context} incident=${incidentId}`, err)

  return apiError('INTERNAL_ERROR', {
    message: `Something went wrong. Reference: ${incidentId}`,
  })
}

// --------- Body parsing -----------------------------------------------------

const MAX_JSON_BYTES = 1_000_000 // 1 MB

/**
 * Parse a JSON body with a hard size ceiling and strict content-type check.
 * Returns a NextResponse on failure so handlers can `instanceof` and bail.
 *
 * The content-type requirement doubles as CSRF defence: `application/json`
 * is not a form-submittable type, so a cross-origin `<form>` post cannot
 * reach a handler that insists on it.
 */
export async function readJsonBody(req: Request): Promise<unknown | NextResponse> {
  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return apiError('UNSUPPORTED_MEDIA_TYPE', {
      message: 'Content-Type must be application/json.',
    })
  }

  const declared = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) {
    return apiError('PAYLOAD_TOO_LARGE')
  }

  let raw: string
  try {
    raw = await req.text()
  } catch {
    return apiError('VALIDATION_FAILED', { message: 'Could not read request body.' })
  }

  // Re-check after reading: content-length is client-supplied and may lie.
  if (raw.length > MAX_JSON_BYTES) return apiError('PAYLOAD_TOO_LARGE')

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return apiError('VALIDATION_FAILED', { message: 'Request body is not valid JSON.' })
  }
}
