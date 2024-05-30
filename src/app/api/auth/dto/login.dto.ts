import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';

export class LoginDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordEncrypted)
  password: string;
}
