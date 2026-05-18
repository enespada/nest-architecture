import { ApiProperty } from '@nestjs/swagger';

export class UsernameAvailabilityResponseDTO {
  @ApiProperty({ description: 'Whether the username is available' })
  available: boolean;
}
