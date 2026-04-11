import { AuthModule } from '@controller/auth/auth.module';
import { UserBlockedModule } from '@controller/user-blocked/user-blocked.module';
import { UserModule } from '@controller/user/user.module';
import { AppLoggerMiddleware } from '@core/middlewares/logger.middleware';
import { LoggerModule } from '@core/services/logger/logger.module';
import environment from '@environments/environment';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [environment] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
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
