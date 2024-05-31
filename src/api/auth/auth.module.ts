import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

import { UserModule } from '../user/user.module';
import { MailModule } from '@core/services/mail/mail.module';
import { LoggerModule } from '@core/services/logger/logger.module';
import { SessionService } from '@core/services/session/session.service';
import { AuthService } from '@application/auth/auth.service';
import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';

@Module({
  imports: [UserModule, MailModule, LoggerModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, PasswordEncrypted],
})
export class AuthModule {}
