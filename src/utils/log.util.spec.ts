/// <reference types="jest" />

import { sanitizeForLog } from './log.util'

describe('sanitizeForLog', () => {
  it('redacts secrets in nested objects', () => {
    expect(
      sanitizeForLog({
        password: 'password',
        profile: {
          accessToken: 'token',
          name: 'Ada',
        },
      }),
    ).toEqual({
      password: '[REDACTED]',
      profile: {
        accessToken: '[REDACTED]',
        name: 'Ada',
      },
    })
  })

  it('handles circular values without throwing', () => {
    const value: Record<string, unknown> = {}
    value.self = value

    expect(sanitizeForLog(value)).toEqual({
      self: '[Circular reference]',
    })
  })
})
