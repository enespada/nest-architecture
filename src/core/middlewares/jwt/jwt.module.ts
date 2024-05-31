import { forwardRef, Module } from '@nestjs/common';
import { JwtRefreshStrategy } from './refresh/jwt-refresh.strategy';
import { JwtUserStrategy } from './user/jwt-user.strategy';
import { UserModule } from '@controller/user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [],
  providers: [JwtUserStrategy, JwtRefreshStrategy],
  exports: [JwtUserStrategy, JwtRefreshStrategy],
})
export class JwtModule {}
