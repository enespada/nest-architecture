import { ApiProperty } from '@nestjs/swagger';

export class EmailAvailabilityResponseDTO {
  @ApiProperty({ description: 'Whether the email is available' })
  available: boolean;
}
