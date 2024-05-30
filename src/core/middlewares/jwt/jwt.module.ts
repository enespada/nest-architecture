import { UsersModule } from '@controller/users/users.module';
import { forwardRef, Module } from '@nestjs/common';
import { JwtRefreshStrategy } from './refresh/jwt-refresh.strategy';
import { JwtUserStrategy } from './user/jwt-user.strategy';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [],
  providers: [JwtUserStrategy, JwtRefreshStrategy],
  exports: [JwtUserStrategy, JwtRefreshStrategy],
})
export class JwtModule {}
