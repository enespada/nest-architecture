import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty()
  @IsUUID()
  id: string;

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
