import { UsersService } from '@application/users/users.service';
import { JwtModule } from '@core/middlewares/jwt/jwt.module';
import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { LoggerModule } from '@core/services/logger/logger.module';
import { UsersDomainService } from '@domain/users/users.domain';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { SessionModule } from '@core/services/session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SessionModule,
    LoggerModule,
    forwardRef(() => JwtModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersDomainService, PasswordEncrypted],
  exports: [UsersService, UsersDomainService],
})
export class UsersModule {}
