import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'
import { BusinessException } from '../exceptions/business.exception'
import { STATUS_CODES } from 'http'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    console.log(exception)
    if (exception instanceof BusinessException) {
      response.status(HttpStatus.OK).json({
        code: exception.bizCode,
        msg: exception.message,
        data: null,
      })
      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      response.status(status).send(STATUS_CODES[status] ?? 'Error')
      return
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    )
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send(STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR])
  }
}
