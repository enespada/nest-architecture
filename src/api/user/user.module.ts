import { UserService } from '@application/user/user.service';
import { JwtModule } from '@core/middlewares/jwt/jwt.module';
import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { LoggerModule } from '@core/services/logger/logger.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/user/models/user.model';
import { UsersController } from './user.controller';
import { SessionModule } from '@core/services/session/session.module';
import { UserRepositoryImpl } from '@infrastructure/user/user.repository.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SessionModule,
    LoggerModule,
    forwardRef(() => JwtModule),
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    { provide: 'UserRepository', useClass: UserRepositoryImpl },
    UserRepositoryImpl,
    PasswordEncrypted,
  ],
  exports: [UserService, UserRepositoryImpl],
})
export class UserModule {}
