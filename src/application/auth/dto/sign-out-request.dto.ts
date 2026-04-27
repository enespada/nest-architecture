import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignOutRequestDTO {
  @ApiProperty({
    description: 'Refresh token used to close the active session',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({
    description: 'Device identifier associated with the session being revoked',
    example: 'device-123',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
