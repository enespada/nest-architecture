import { AuthModule } from '@controller/auth/auth.module';
import { UserBlockedModule } from '@controller/user-blocked/user-blocked.module';
import { UserModule } from '@controller/user/user.module';
import { AppLoggerMiddleware } from '@core/middlewares/logger.middleware';
import { ENV } from '@core/constants/constants';
import { LoggerModule } from '@core/services/logger/logger.module';
import environment from '@environments/environment';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { buildDatabaseOptions } from '@infrastructure/shared/database/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

const env: ENV = (process.env.NODE_ENV?.toUpperCase() ?? ENV.DEV) as ENV;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [environment] }),
    TypeOrmModule.forRoot(buildDatabaseOptions(env)),
    UserModule,
    UserBlockedModule,
    AuthModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
