import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import {
  AbstractEntity,
  AbstractOrderBy,
  AbstractWhere,
} from '@core/database/entity/abstract.entity';
import { UserEntity } from '@infrastructure/user/entities/user.entity';

@Entity()
@Unique(['blockerId', 'blockedId'])
export class UserBlockedEntity extends AbstractEntity {
  @Column()
  @ApiProperty()
  blockerId: string;

  @Column()
  @ApiProperty()
  blockedId: string;

  // Relation objects for joins — loaded only when explicitly requested via relations[]
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockerId' })
  blocker: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockedId' })
  blocked: UserEntity;
}

//--------------------------------------------Where-------------------------------------------------------------
enum UserBlockedWhereEnum {
  blockerId = 'blockerId',
  blockedId = 'blockedId',
}
export type UserBlockedWhere = UserBlockedWhereEnum | AbstractWhere;
export const UserBlockedWhere = { ...UserBlockedWhereEnum, ...AbstractWhere };

//--------------------------------------------OrderBy-------------------------------------------------------------
enum UserBlockedOrderByEnum {
  blockerId = 'blockerId',
  blockedId = 'blockedId',
}
export type UserBlockedOrderBy = UserBlockedOrderByEnum | AbstractOrderBy;
export const UserBlockedOrderBy = {
  ...UserBlockedOrderByEnum,
  ...AbstractOrderBy,
};

//--------------------------------------------Relations-------------------------------------------------------------
export enum UserBlockedRelations {
  blocker = 'blocker',
  blocked = 'blocked',
}
