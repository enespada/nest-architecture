import { CreateUserDTO } from '@controller/user/dto/create-user.dto';
import { AbstractEntity } from '@core/database/entity/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';

@Entity()
export class User extends AbstractEntity {
  @Column({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ select: false })
  @ApiProperty()
  password: string;
}

export const defaultUserValues: Array<CreateUserDTO> = [];

export enum UserWhere {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  email = 'email',
}

export enum UserOrderBy {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  email = 'email',
}

export enum UserRelations {}
