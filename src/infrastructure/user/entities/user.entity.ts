import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';
import {
  AbstractEntity,
  AbstractOrderBy,
  AbstractWhere,
} from '@core/database/entity/abstract.entity';
import { UserBlockedEntity } from '@infrastructure/user-blocked/entities/user-blocked.entity';

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

  // Never eagerly loaded — use UserRelations enum to request them explicitly
  @OneToMany(() => UserBlockedEntity, (ub) => ub.blocker)
  blockedUsers?: UserBlockedEntity[];

  @OneToMany(() => UserBlockedEntity, (ub) => ub.blocked)
  blockedBy?: UserBlockedEntity[];
}

export const defaultUserValues: Array<UserEntity> = [];

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

//--------------------------------------------Relations-------------------------------------------------------------
export enum UserRelations {
  blockedUsers = 'blockedUsers',
  blockedBy = 'blockedBy',
}
