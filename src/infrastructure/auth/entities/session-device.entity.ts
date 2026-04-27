import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Unique } from 'typeorm';
import {
  AbstractEntity,
  AbstractOrderBy,
  AbstractWhere,
} from '@core/database/entity/abstract.entity';
import { SessionDeviceType } from '@domain/auth/enums/session-device-type.enum';

@Entity()
@Unique(['refreshToken'])
@Unique(['userId', 'deviceId'])
export class SessionDeviceEntity extends AbstractEntity {
  @Column()
  @ApiProperty()
  userId: string;

  @Column()
  @ApiProperty()
  deviceId: string;

  @Column({ type: 'enum', enum: SessionDeviceType })
  @ApiProperty({ enum: SessionDeviceType, enumName: 'SessionDeviceType' })
  sessionDeviceType: SessionDeviceType;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', length: 512 })
  @ApiProperty()
  accessToken: string;

  @Column({ type: 'varchar', length: 512 })
  @ApiProperty()
  refreshToken: string;
}

//--------------------------------------------Where-------------------------------------------------------------
enum SessionDeviceWhereEnum {
  userId = 'userId',
  deviceId = 'deviceId',
  sessionDeviceType = 'sessionDeviceType',
  name = 'name',
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
}
export type SessionDeviceWhere = SessionDeviceWhereEnum | AbstractWhere;
export const SessionDeviceWhere = {
  ...SessionDeviceWhereEnum,
  ...AbstractWhere,
};

//--------------------------------------------OrderBy-------------------------------------------------------------
enum SessionDeviceOrderByEnum {
  userId = 'userId',
  deviceId = 'deviceId',
  sessionDeviceType = 'sessionDeviceType',
  name = 'name',
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
}
export type SessionDeviceOrderBy = SessionDeviceOrderByEnum | AbstractOrderBy;
export const SessionDeviceOrderBy = {
  ...SessionDeviceOrderByEnum,
  ...AbstractOrderBy,
};
