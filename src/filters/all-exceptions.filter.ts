import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { BusinessException } from '../exceptions/business.exception'
import { sanitizeForLog, serializeError } from '../utils/log.util'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private getHttpMessage(exception: HttpException) {
    const exceptionResponse = exception.getResponse()

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse
    }

    const message = (exceptionResponse as Record<string, unknown>)?.message

    if (Array.isArray(message)) {
      return message.join('; ')
    }

    if (typeof message === 'string') {
      return message
    }

    return exception.message
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const message =
      exception instanceof Error
        ? exception.stack || exception.message
        : String(exception)

    if (exception instanceof BusinessException) {
      const responseBody = {
        code: exception.bizCode,
        msg: exception.message,
        data: null,
      }

      this.sendExceptionResponse(
        response,
        HttpStatus.OK,
        responseBody,
        exception,
      )
      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const responseBody = {
        code: status,
        msg: this.getHttpMessage(exception),
        data: null,
      }

      this.sendExceptionResponse(response, status, responseBody, exception)
      return
    }

    const responseBody = {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      msg: message,
      data: null,
    }

    this.sendExceptionResponse(
      response,
      HttpStatus.INTERNAL_SERVER_ERROR,
      responseBody,
      exception,
    )
  }

  private sendExceptionResponse(
    response: Response,
    statusCode: number,
    responseBody: Record<string, unknown>,
    exception: unknown,
  ) {
    response.locals.httpLogResponseBody = sanitizeForLog(responseBody)
    response.locals.httpLogError = serializeError(exception)
    response.status(statusCode).json(responseBody)
  }
}
