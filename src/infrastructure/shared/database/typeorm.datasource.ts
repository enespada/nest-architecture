import { ENV } from '@core/constants/constants';
import {
  buildDatabaseOptions,
  typeOrmEntities,
  typeOrmMigrations,
} from './typeorm.config';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const env: ENV = (process.env.NODE_ENV?.toUpperCase() ?? ENV.DEV) as ENV;

const dataSource: DataSource = new DataSource({
  ...buildDatabaseOptions(env),
  entities: typeOrmEntities,
  migrations: typeOrmMigrations,
  migrationsRun: false,
});

export default dataSource;
