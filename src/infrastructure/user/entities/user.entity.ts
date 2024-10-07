import { CreateUserDTO } from '@application/user/dto/create-user.dto';
import {
  AbstractEntity,
  AbstractOrderBy,
  AbstractWhere,
} from '@core/database/entity/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';

@Entity()
export class UserEntity extends AbstractEntity {
  @Column({ unique: true })
  @ApiProperty()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false })
  password: string;
}

export const defaultUserValues: Array<CreateUserDTO> = [];

//--------------------------------------------Where-------------------------------------------------------------
enum UserWhereEnum {
  email = 'email',
  firstName = 'firstName',
  lastName = 'lastName',
}
export type UserWhere = UserWhereEnum | AbstractWhere;
export const UserWhere = { ...UserWhereEnum, ...AbstractWhere };

//--------------------------------------------OrderBy-------------------------------------------------------------
enum UserOrderByEnum {
  email = 'email',
  firstName = 'firstName',
  lastName = 'lastName',
}
export type UserOrderBy = UserOrderByEnum | AbstractOrderBy;
export const UserOrderBy = { ...UserOrderByEnum, ...AbstractOrderBy };

export enum UserRelations {}
