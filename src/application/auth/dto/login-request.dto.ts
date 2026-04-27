import { SessionDeviceType } from '@domain/auth/enums/session-device-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class LoginDeviceDTO {
  @ApiProperty({ description: 'Stable identifier for the client device' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Client device platform associated with the session',
    enum: SessionDeviceType,
    enumName: 'SessionDeviceType',
  })
  @IsEnum(SessionDeviceType)
  sessionDeviceType: SessionDeviceType;

  @ApiProperty({
    description: 'Human-readable device name shown in session management',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class LoginRequestDTO {
  @ApiProperty({ description: 'User email used to authenticate the session' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password used to authenticate the session',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Device metadata associated with the login session',
    type: LoginDeviceDTO,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => LoginDeviceDTO)
  sessionDevice: LoginDeviceDTO;
}
