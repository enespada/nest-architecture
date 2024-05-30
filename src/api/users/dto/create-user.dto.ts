import { PasswordEncrypted } from '@core/middlewares/validation/password.validation';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @Validate(PasswordEncrypted)
  @IsNotEmpty()
  password: string;
}
