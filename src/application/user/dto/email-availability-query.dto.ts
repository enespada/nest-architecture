import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailAvailabilityQueryDTO {
  @ApiProperty({ description: 'Email to check availability for' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
