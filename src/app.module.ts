import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { DemoModule } from './demo/demo.module'
import { RoleModule } from './role/role.module'
import { connectionParams } from './config/orm.config'
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './guards/jwt.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || `development`}`, '.env'],
    }),
    TypeOrmModule.forRoot(connectionParams),
    UserModule,
    DemoModule,
    RoleModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
