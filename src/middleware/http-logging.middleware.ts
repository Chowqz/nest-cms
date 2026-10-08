import {
  Inject,
  Injectable,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { getHttpRequestLog, sanitizeForLog } from '../utils/log.util'

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    const startedAt = Date.now()
    const requestLog = getHttpRequestLog(request)

    response.locals.requestStartedAt = startedAt
    this.logger.log({
      level: 'info',
      message: 'HTTP request received',
      event: 'http.request.received',
      ...requestLog,
    })

    response.once('finish', () => {
      const responseBody = sanitizeForLog(response.locals.httpLogResponseBody)
      const error = response.locals.httpLogError
      const hasError = Boolean(error) || response.statusCode >= 400
      const log = {
        event: hasError ? 'http.request.failed' : 'http.request.completed',
        ...requestLog,
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt,
        responseBody,
      }

      if (hasError) {
        this.logger.error({
          message: 'HTTP request failed',
          ...log,
          error,
        })
        return
      }

      this.logger.log({
        level: 'info',
        message: 'HTTP request completed',
        ...log,
      })
    })

    next()
  }
}
