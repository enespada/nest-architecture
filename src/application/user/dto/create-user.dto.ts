import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({ description: 'Email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Unique username of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Phone preffix of the user', required: false })
  @Transform(({ value }: { value: unknown }) =>
    value === '' || value === null ? undefined : value,
  )
  @ValidateIf(
    (createUserDto: CreateUserDTO) => createUserDto.phone !== undefined,
  )
  @IsString()
  @IsNotEmpty()
  phonePreffix?: string;

  @ApiProperty({ description: 'Phone of the user', required: false })
  @Transform(({ value }: { value: unknown }) =>
    value === '' || value === null ? undefined : value,
  )
  @ValidateIf(
    (createUserDto: CreateUserDTO) => createUserDto.phonePreffix !== undefined,
  )
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ApiProperty({ description: 'Language of the user' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    description: 'Birth date of the user in YYYY-MM-DD format',
    example: '1990-05-20',
  })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
