import { NestFactory, Reflector } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import * as basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express-serve-static-core';
import { json } from 'body-parser';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { HttpConfigDTO } from '@environments/dto/http-config.dto';
import { SwaggerDTO } from '@environments/dto/swagger.dto';
import { EnvironmentDTO } from '@environments/dto/environment.dto';
import { swaggerCss } from '@assets/swagger.css';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SecureDTO } from '@environments/dto/secure.dto';
import { AppModule } from './app.module';
import { CustomLoggerService } from '@core/services/logger/logger.service';
import { useContainer } from 'class-validator';
import { ENV } from '@core/constants/constants';

const env = (process.env.NODE_ENV as ENV) ?? ENV.DEV;

async function createNestServer(expressInstance?: Express): Promise<void> {
  // Create Express Server Instance
  const server = expressInstance;

  // Create Nest Server Instance
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    {
      logger:
        env === ENV.DEV ? ['debug', 'error', 'log', 'verbose', 'warn'] : false,
    },
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);
  const environment = configService.get<EnvironmentDTO>('environment');
  const httpConfig = configService.get<HttpConfigDTO>('httpConfig');
  const secure = configService.get<SecureDTO>('secure');
  const swaggerConfig = configService.get('swagger');

  // Swagger Config
  !environment.production && setupSwagger(app, httpConfig, swaggerConfig);

  // Configure security middlewares
  app.enableCors();
  app.use(compression());
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(rateLimit(secure.rateLimitConfig));
  app.use(json({ limit: secure.payloadSizeLimit }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));

  // Add a global prefix to the API
  const globalPrefix = `${httpConfig.globalPrefix}/${httpConfig.apiVersion}`;
  !environment.production &&
    app.setGlobalPrefix(globalPrefix, {
      exclude: ['health'],
    });

  app.resolve(CustomLoggerService).then((logger: CustomLoggerService) => {
    logger.context = 'APP';
    logger.log(`APPLICATION: ${httpConfig.name}`);
    logger.log(`VERSION: ${httpConfig.apiVersion}`);
    logger.log(`ENVIRONMENT: ${environment.env}`);

    app.listen(httpConfig.port, async () => {
      logger.log(`HTTP - Server listening on: ${httpConfig.url}`);
      logger.log(
        `Swagger - Docs available on: ${httpConfig.url}/${httpConfig.globalPrefix}/${httpConfig.apiVersion}/${swaggerConfig.prefix}`,
      );
    });
  });
}

function setupSwagger(
  app: NestExpressApplication,
  httpConfig: HttpConfigDTO,
  swaggerConfig: SwaggerDTO,
) {
  app.useStaticAssets('src/assets', {
    prefix: `/api/static`,
  });

  const swaggerDocsUrl = `/${httpConfig.globalPrefix}/${httpConfig.apiVersion}/${swaggerConfig.prefix}`;

  app.use(
    [swaggerDocsUrl],
    basicAuth({
      challenge: true,
      users: {
        [swaggerConfig.username]: swaggerConfig.password,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(`<div>${swaggerConfig.description}</div>`)
    .setVersion(swaggerConfig.version)
    .addServer(
      `${httpConfig.url}/${httpConfig.globalPrefix}/${httpConfig.apiVersion}`,
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerDocsUrl, app, document, {
    customSiteTitle: swaggerConfig.title,
    customCss: swaggerCss,
    customJs: '/api/static/swagger.js',
    customfavIcon: '/api/static/favicon.ico',
  });
}

const expressServer = express();

createNestServer(expressServer);
