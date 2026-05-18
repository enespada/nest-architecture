import { ENV } from '@core/constants/constants';
import { SessionDeviceEntity } from '@infrastructure/auth/entities/session-device.entity';
import { UserEntity } from '@infrastructure/user/entities/user.entity';
import { UserBlockedEntity } from '@infrastructure/user-blocked/entities/user-blocked.entity';
import { InitialSchema1714399200000 } from './migrations/1714399200000-initial-schema';
import { AddUserPhoneLanguage1714399200001 } from './migrations/1714399200001-add-user-phone-language';
import { AdjustUserPhoneOptional1714399200002 } from './migrations/1714399200002-adjust-user-phone-optional';
import { DataSourceOptions } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { join } from 'path';

export const typeOrmEntities: DataSourceOptions['entities'] = [
  UserEntity,
  UserBlockedEntity,
  SessionDeviceEntity,
];

const isTsRuntime: boolean = __filename.endsWith('.ts');

export const typeOrmMigrations: string[] = [
  join(
    process.cwd(),
    ...(isTsRuntime
      ? ['src', 'infrastructure', 'shared', 'database', 'migrations', '*.ts']
      : [
          'dist',
          'src',
          'infrastructure',
          'shared',
          'database',
          'migrations',
          '*.js',
        ]),
  ),
];

export const typeOrmMigrationClasses: DataSourceOptions['migrations'] = [
  InitialSchema1714399200000,
  AddUserPhoneLanguage1714399200001,
  AdjustUserPhoneOptional1714399200002,
];

export function buildDatabaseOptions(env: ENV): MysqlConnectionOptions {
  return {
    type: process.env.DATABASE_TYPE as MysqlConnectionOptions['type'],
    host: process.env.DATABASE_HOSTNAME,
    port: parseInt(process.env.DATABASE_PORT as string, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: env === ENV.DEV,
    entities: typeOrmEntities,
    migrations: typeOrmMigrationClasses,
    synchronize: false,
    migrationsRun: env === ENV.DEV,
  };
}
