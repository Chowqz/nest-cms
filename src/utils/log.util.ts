import { Request } from 'express'

const MAX_ARRAY_LENGTH = 20
const MAX_OBJECT_KEYS = 50
const MAX_STRING_LENGTH = 2_000
const MAX_DEPTH = 5
const SENSITIVE_KEY_PATTERN =
  /password|passwd|token|secret|authorization|cookie|api[-_]?key|credential/i

export function sanitizeForLog(value: unknown): unknown {
  return sanitize(value, new WeakSet<object>(), 0)
}

export function getHttpRequestLog(request: Request): Record<string, unknown> {
  return {
    method: request.method,
    path: request.originalUrl || request.url,
    ip: request.ip || request.socket.remoteAddress,
    userAgent: sanitizeForLog(request.headers['user-agent']),
    params: sanitizeForLog(request.params),
    query: sanitizeForLog(request.query),
    requestBody: sanitizeForLog(request.body),
  }
}

export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeForLog(error.message),
      stack: sanitizeForLog(error.stack),
    }
  }

  return {
    message: sanitizeForLog(error),
  }
}

function sanitize(
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    return truncate(value)
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return typeof value === 'bigint' ? value.toString() : value
  }

  if (typeof value === 'symbol' || typeof value === 'function') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Buffer.isBuffer(value)) {
    return `[Buffer: ${value.length} bytes]`
  }

  if (value instanceof Error) {
    return serializeError(value)
  }

  if (depth >= MAX_DEPTH) {
    return '[Max depth reached]'
  }

  if (Array.isArray(value)) {
    const items = value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((item) => sanitize(item, seen, depth + 1))

    if (value.length > MAX_ARRAY_LENGTH) {
      items.push(`[${value.length - MAX_ARRAY_LENGTH} more items]`)
    }

    return items
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular reference]'
    }

    seen.add(value)

    try {
      const entries = Object.entries(value)
      const sanitized: Record<string, unknown> = {}

      for (const [key, item] of entries.slice(0, MAX_OBJECT_KEYS)) {
        sanitized[key] = SENSITIVE_KEY_PATTERN.test(key)
          ? '[REDACTED]'
          : sanitize(item, seen, depth + 1)
      }

      if (entries.length > MAX_OBJECT_KEYS) {
        sanitized._truncated = `${entries.length - MAX_OBJECT_KEYS} more keys`
      }

      return sanitized
    } catch {
      return '[Unserializable object]'
    }
  }

  return String(value)
}

function truncate(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}...[truncated]`
}
