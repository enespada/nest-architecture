import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserBlockedWhereDTO {
  @ApiPropertyOptional({
    description: 'Filter by full name (case-insensitive partial match)',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Filter by username (case-insensitive partial match)',
  })
  @IsString()
  @IsOptional()
  userName?: string;
}
