import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { DemoModule } from './demo/demo.module'
import { RoleModule } from './role/role.module'
import { connectionParams } from './config/orm.config'
import { AuthModule } from './auth/auth.module'
import { JwtGuard } from './guards/jwt.guard'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'
import { HttpLoggingMiddleware } from './middleware/http-logging.middleware'
import { WinstonModule } from 'nest-winston'
import { Console } from 'winston/lib/winston/transports'
import * as winston from 'winston'
import { utilities } from 'nest-winston'
import 'winston-daily-rotate-file'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || `development`}`, '.env'],
    }),
    TypeOrmModule.forRoot(connectionParams),
    WinstonModule.forRootAsync({
      useFactory: () => {
        return {
          transports: [
            new Console({
              level: 'info',
              format: winston.format.combine(
                winston.format.timestamp(),
                utilities.format.nestLike(),
              ),
            }),
            new winston.transports.DailyRotateFile({
              level: 'info',
              dirname: 'logs',
              filename: `info-%DATE%.log`,
              datePattern: 'YYYY-MM-DD-HH',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple(),
              ),
            }),
            new winston.transports.DailyRotateFile({
              level: 'error',
              dirname: 'logs',
              filename: `error-%DATE%.log`,
              datePattern: 'YYYY-MM-DD-HH',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple(),
              ),
            }),
          ],
        }
      },
      inject: [ConfigService],
    }),
    UserModule,
    DemoModule,
    RoleModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AllExceptionsFilter,
    HttpLoggingMiddleware,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*')
  }
}
