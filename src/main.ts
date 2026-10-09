import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { TransformInterceptor } from './interceptors/transform.interceptor'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { HttpLoggingInterceptor } from './interceptors/http-logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(
    new HttpLoggingInterceptor(),
    new TransformInterceptor(),
  )
  app.useGlobalFilters(app.get(AllExceptionsFilter))
  await app.listen(process.env.PORT || 3000)
}
bootstrap()
