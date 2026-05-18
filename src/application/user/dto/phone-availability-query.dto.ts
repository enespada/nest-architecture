import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneAvailabilityQueryDTO {
  @ApiProperty({ description: 'Phone preffix to check availability for' })
  @IsString()
  @IsNotEmpty()
  phonePreffix: string;

  @ApiProperty({ description: 'Phone to check availability for' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
