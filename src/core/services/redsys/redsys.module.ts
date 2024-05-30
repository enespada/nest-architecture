import { Module } from '@nestjs/common';
import { RedsysService } from './redsys.service';

@Module({
  imports: [],
  providers: [RedsysService],
  exports: [RedsysService],
})
export class RedsysModule {}
