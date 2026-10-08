/// <reference types="jest" />

jest.mock('@nestjs/common', () => ({
  Inject: () => () => undefined,
  Injectable: () => (target: unknown) => target,
}))

jest.mock('nest-winston', () => ({
  WINSTON_MODULE_NEST_PROVIDER: 'NestWinston',
}))

import { EventEmitter } from 'node:events'
import type { LoggerService } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { HttpLoggingMiddleware } from './http-logging.middleware'

describe('HttpLoggingMiddleware', () => {
  const createRequest = () =>
    ({
      method: 'POST',
      originalUrl: '/auth/signin',
      url: '/auth/signin',
      ip: '127.0.0.1',
      headers: {},
      params: {},
      query: {},
      body: { username: 'ada' },
    }) as unknown as Request

  const createResponse = () =>
    Object.assign(new EventEmitter(), {
      locals: {},
      statusCode: 200,
    }) as unknown as Response

  it('logs a completed response when it finishes', () => {
    const logger: jest.Mocked<LoggerService> = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }
    const middleware = new HttpLoggingMiddleware(logger)
    const response = createResponse()
    const next = jest.fn() as NextFunction

    middleware.use(createRequest(), response, next)
    response.locals.httpLogResponseBody = { code: 0, msg: 'success' }
    response.emit('finish')

    expect(response.locals.requestStartedAt).toEqual(expect.any(Number))
    expect(logger.log).toHaveBeenCalledTimes(2)
    expect(logger.log).toHaveBeenLastCalledWith(
      expect.objectContaining({
        event: 'http.request.completed',
        statusCode: 200,
        responseBody: { code: 0, msg: 'success' },
      }),
    )
    expect(logger.error).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('logs an exception response when it finishes', () => {
    const logger: jest.Mocked<LoggerService> = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }
    const middleware = new HttpLoggingMiddleware(logger)
    const response = createResponse()
    const next = jest.fn() as NextFunction

    middleware.use(createRequest(), response, next)
    response.statusCode = 401
    response.locals.httpLogResponseBody = {
      code: 401,
      msg: 'Unauthorized',
      data: null,
    }
    response.locals.httpLogError = {
      name: 'UnauthorizedException',
      message: 'Unauthorized',
    }
    response.emit('finish')

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'http.request.failed',
        statusCode: 401,
        responseBody: {
          code: 401,
          msg: 'Unauthorized',
          data: null,
        },
      }),
    )
  })
})
