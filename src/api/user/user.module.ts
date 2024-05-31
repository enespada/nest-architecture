import { UserService } from '@application/users/user.service';
import { JwtModule } from '@core/middlewares/jwt/jwt.module';
import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { LoggerModule } from '@core/services/logger/logger.module';
import { UserDomainService } from '@domain/user/user.domain';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/user/entities/user.entity';
import { UsersController } from './user.controller';
import { SessionModule } from '@core/services/session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SessionModule,
    LoggerModule,
    forwardRef(() => JwtModule),
  ],
  controllers: [UsersController],
  providers: [UserService, UserDomainService, PasswordEncrypted],
  exports: [UserService, UserDomainService],
})
export class UserModule {}
