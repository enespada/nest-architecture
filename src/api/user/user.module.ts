import { UserService } from '@application/user/user.service';
import { JwtModule } from '@core/middlewares/jwt/jwt.module';
import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { LoggerModule } from '@core/services/logger/logger.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { SessionModule } from '@core/services/session/session.module';
import { UserRepositoryImpl } from '@infrastructure/user/user.repository.impl';
import { UserEntity } from '@infrastructure/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    SessionModule,
    LoggerModule,
    forwardRef(() => JwtModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: 'UserRepository', useClass: UserRepositoryImpl },
    PasswordEncrypted,
  ],
  exports: [UserService, 'UserRepository'],
})
export class UserModule {}
