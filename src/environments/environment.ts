import { ENV } from '@core/constants/constants';
import { version, name } from 'package.json';
import { EnvironmentDTO } from './dto/environment.dto';
import { MailConfigDTO } from './dto/mail-config.dto';
import { HttpConfigDTO } from './dto/http-config.dto';
import { SwaggerDTO } from './dto/swagger.dto';
import { SecureDTO } from './dto/secure.dto';
import { DatabaseDTO } from './dto/database.dto';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();
const env: ENV = (process.env.NODE_ENV?.toUpperCase() ?? ENV.DEV) as ENV;

export default () => ({
  environment: {
    env,
    development: env === ENV.DEV,
    preproduction: env === ENV.PRE,
    production: env === ENV.PROD,
  } as EnvironmentDTO,
  mailConfig: {
    host: process.env.MAIL_HOST,
    secure: false,
    service: process.env.MAIL_SERVICE,
    port: parseInt(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      ciphers: process.env.MAIL_CIPHERS,
    },
  } as MailConfigDTO,
  httpConfig: {
    globalPrefix: 'api',
    apiVersion: 'v1',
    port: parseInt(process.env.APP_PORT),
    hostname: process.env.APP_HOSTNAME,
    url:
      env === ENV.DEV
        ? `${process.env.APP_HOSTNAME}:${parseInt(process.env.APP_PORT)}`
        : process.env.APP_HOSTNAME,
    name: process.env.APP_NAME ?? name,
    encriptionKey: process.env.ENCRYPTION_KEY,
    token: {
      expirationTime: process.env.TOKEN_EXPIRE_TIME,
      refreshExpirationTime: process.env.TOKEN_EXPIRE_TIME_REFRESH,
      passwordExpirationTime: process.env.TOKEN_EXPIRE_TIME_PASSWORD,
      type: process.env.TOKEN_TYPE,
      secret: process.env.TOKEN_SECRET,
    },
  } as HttpConfigDTO,
  swagger: {
    title: 'API_TITLE',
    description: `API_DESCRIPTION`,
    version,
    authLocation: 'header',
    customHtmlTitle: 'Swagger - API_TITLE API',
    username: process.env.SWAGGER_USERNAME,
    password: process.env.SWAGGER_PASSWORD,
    prefix: 'docs',
  } as SwaggerDTO,
  secure: {
    rateLimitConfig: {
      windowMs: 5 * 60 * 1000,
      max: 500,
    },
    payloadSizeLimit: '10mb',
  } as SecureDTO,
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOSTNAME,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: env === ENV.DEV,
    entities: [join(__dirname, '..', `app/api/**/**.entity{.ts,.js}`)],
    synchronize: env === ENV.DEV,
  } as DatabaseDTO,
});
