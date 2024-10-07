import {
  UserOrderBy,
  UserRelations,
} from '@infrastructure/user/entities/user.entity';
import { PageOptionsDTO as PageOptionsDTO } from '@core/database/dto/pagination-options.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { User } from '@domain/user/models/user.model';

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

  @ApiProperty({ required: false })
  @IsOptional()
  where?: Partial<User>;
}
