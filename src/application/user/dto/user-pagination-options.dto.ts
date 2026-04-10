import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import {
  UserOrderBy,
  UserRelations,
} from '@infrastructure/user/entities/user.entity';
import { PageOptionsDTO } from '@core/database/dto/pagination-options.dto';
import { UserWhereDTO } from './user-where.dto';

export class UserPageOptionsDTO extends PageOptionsDTO {
  @ApiProperty({ enum: UserOrderBy, default: UserOrderBy.id, required: false })
  @IsEnum(UserOrderBy)
  @IsOptional()
  readonly orderBy?: UserOrderBy = UserOrderBy.id;

  @ApiProperty({
    isArray: true,
    enum: UserRelations,
    default: [],
    required: false,
  })
  @IsEnum(UserRelations, { each: true })
  @IsOptional()
  @Transform((data) => (Array.isArray(data.value) ? data.value : [data.value]))
  readonly relations?: Array<UserRelations> = [];

  @ApiProperty({ type: UserWhereDTO, required: false })
  @ValidateNested()
  @Type(() => UserWhereDTO)
  @IsOptional()
  where?: UserWhereDTO;
}
