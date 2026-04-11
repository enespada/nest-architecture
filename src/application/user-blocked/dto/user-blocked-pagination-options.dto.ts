import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { UserBlockedWhereDTO } from './user-blocked-where.dto';

/**
 * Pagination options for GET users/blocked/paginate.
 * Uses limit/offset directly (no PageOptionsDTO) to match the Flutter client contract:
 * the client reads response.data ?? [] and does not expect a nested data.data structure.
 */
export class UserBlockedPaginationOptionsDTO {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
    description: 'Number of items per page',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
    description: 'Number of items to skip',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  readonly offset?: number = 0;

  @ApiPropertyOptional({ type: UserBlockedWhereDTO })
  @ValidateNested()
  @Type(() => UserBlockedWhereDTO)
  @IsOptional()
  where?: UserBlockedWhereDTO;
}
