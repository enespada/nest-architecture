import {
  User,
  UserOrderBy,
  UserRelations,
} from '@controller/users/entities/user.entity';
import { PageOptionsDto } from '@core/database/dto/pagination-options.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class UserPageOptionsDto extends PageOptionsDto {
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
