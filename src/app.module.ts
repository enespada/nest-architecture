import { AuthModule } from '@controller/auth/auth.module';
import { UsersModule } from '@controller/users/users.module';
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
    UsersModule,
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
