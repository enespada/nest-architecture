import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @Validate(PasswordEncrypted)
  @IsOptional()
  password?: string;
}
