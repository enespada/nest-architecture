import { UserBlockedService } from '@application/user-blocked/user-blocked.service';
import { LoggerModule } from '@core/services/logger/logger.module';
import { UserBlockedRepositoryImpl } from '@infrastructure/user-blocked/user-blocked.repository.impl';
import { UserBlockedEntity } from '@infrastructure/user-blocked/entities/user-blocked.entity';
import { UserEntity } from '@infrastructure/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBlockedController } from './user-blocked.controller';
import { UserModule } from '@controller/user/user.module';

@Module({
  imports: [
    // Register both entities: UserBlockedEntity for @InjectRepository injection,
    // UserEntity so the EntityManager in paginateBlocked can resolve the target table.
    TypeOrmModule.forFeature([UserBlockedEntity, UserEntity]),
    // UserModule exports 'UserRepository', consumed by UserBlockedService.
    // No circular dependency risk: UserModule has no dependency on UserBlockedModule.
    UserModule,
    LoggerModule,
  ],
  controllers: [UserBlockedController],
  providers: [
    UserBlockedService,
    { provide: 'UserBlockedRepository', useClass: UserBlockedRepositoryImpl },
  ],
  exports: [UserBlockedService, 'UserBlockedRepository'],
})
export class UserBlockedModule {}
