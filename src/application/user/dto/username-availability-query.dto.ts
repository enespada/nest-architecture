import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UsernameAvailabilityQueryDTO {
  @ApiProperty({ description: 'Username to check availability for' })
  @IsString()
  @IsNotEmpty()
  username: string;
}
