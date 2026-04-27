import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';

import { UserModule } from '@controller/user/user.module';
import { MailModule } from '@core/services/mail/mail.module';
import { LoggerModule } from '@core/services/logger/logger.module';
import { SessionService } from '@core/services/session/session.service';
import { AuthService } from '@application/auth/auth.service';
import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { AuthRepositoryImpl } from '@infrastructure/auth/auth.repository.impl';
import { SessionDeviceEntity } from '@infrastructure/auth/entities/session-device.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionDeviceEntity]),
    UserModule,
    MailModule,
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    PasswordEncrypted,
    {
      provide: 'AuthRepository',
      useClass: AuthRepositoryImpl,
    },
  ],
})
export class AuthModule {}
