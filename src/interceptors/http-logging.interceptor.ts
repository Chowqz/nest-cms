import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Response } from 'express'
import { Observable, tap } from 'rxjs'
import { sanitizeForLog } from '../utils/log.util'

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle()
    }

    const httpContext = context.switchToHttp()
    const response = httpContext.getResponse<Response>()

    return next.handle().pipe(
      tap((responseBody) => {
        response.locals.httpLogResponseBody = sanitizeForLog(responseBody)
      }),
    )
  }
}
