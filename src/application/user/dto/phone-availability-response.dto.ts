import { ApiProperty } from '@nestjs/swagger';

export class PhoneAvailabilityResponseDTO {
  @ApiProperty({ description: 'Whether the phone is available' })
   available: boolean;
}
