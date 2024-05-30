import { AbstractEntity } from '@core/database/entity/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';

@Entity()
export class User extends AbstractEntity {
  @Column()
  @ApiProperty()
  email: string;

  @Column()
  @ApiProperty()
  password: string;
}

export enum UserOrderBy {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  email = 'email',
}

export enum UserRelations {}
