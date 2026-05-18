import {
  ExecutionContext,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');

import { AuthController } from '../src/api/auth/auth.controller';
import { LoginResponseDto } from '../src/application/auth/dto/login-response.dto';
import { SignOutRequestDTO } from '../src/application/auth/dto/sign-out-request.dto';
import { AuthService } from '../src/application/auth/auth.service';
import { ExceptionFilter } from '../src/core/exceptions/global.exception';
import { JwtUserGuard } from '../src/core/middlewares/jwt/user/jwt-user.guard';
import { CustomLoggerService } from '../src/core/services/logger/logger.service';
import { User } from '../src/domain/user/models/user.model';

const AUTHENTICATED_USER = new User(
  'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
  'auth@test.com',
  'auth-user',
  'Auth',
  'User',
  '+34',
  '600000001',
  'es',
  '1990-05-20',
  'hashed',
);

const ACCESS_TOKEN = 'raw-access-token';

const VALID_BODY = {
  refreshToken: 'raw-refresh-token',
  deviceId: 'device-123',
};

const authenticatedGuard = {
  canActivate: (ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authorizationHeader: string | undefined =
      request.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    request.user = AUTHENTICATED_USER;
    request.token = authorizationHeader.replace(/^Bearer\s+/u, '');
    return true;
  },
};

const rejectedGuard = {
  canActivate: () => {
    throw new UnauthorizedException();
  },
};

const fallbackTokenGuard = {
  canActivate: (ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authorizationHeader: string | undefined =
      request.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    request.user = {
      ...AUTHENTICATED_USER,
      token: authorizationHeader.replace(/^Bearer\s+/u, ''),
    };

    return true;
  },
};

const mockAuthService: {
  login: jest.Mock;
  register: jest.Mock;
  refresh: jest.Mock<Promise<LoginResponseDto>, [User, string]>;
  signOut: jest.Mock<Promise<void>, [SignOutRequestDTO, string, string]>;
} = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn<Promise<LoginResponseDto>, [User, string]>(),
  signOut: jest.fn<Promise<void>, [SignOutRequestDTO, string, string]>(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

async function createApp(guardOverride: object): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: mockAuthService },
      { provide: CustomLoggerService, useValue: mockLogger },
      ExceptionFilter,
    ],
  })
    .overrideGuard(JwtUserGuard)
    .useValue(guardOverride)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

describe('Auth sign-out contract (e2e)', () => {
  let authApp: INestApplication;
  let unauthApp: INestApplication;
  let fallbackTokenApp: INestApplication;

  beforeAll(async () => {
    authApp = await createApp(authenticatedGuard);
    unauthApp = await createApp(rejectedGuard);
    fallbackTokenApp = await createApp(fallbackTokenGuard);
  });

  afterAll(async () => {
    await authApp.close();
    await unauthApp.close();
    await fallbackTokenApp.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.signOut.mockResolvedValue(undefined);
  });

  describe('POST /auth/sign-out', () => {
    it('returns 204 with a valid Authorization header and valid body', async () => {
      await request(authApp.getHttpServer())
        .post('/auth/sign-out')
        .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
        .send(VALID_BODY)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('returns 401 when authentication is missing', () => {
      return request(unauthApp.getHttpServer())
        .post('/auth/sign-out')
        .send(VALID_BODY)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns 400 when the body is invalid', () => {
      return request(authApp.getHttpServer())
        .post('/auth/sign-out')
        .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('delegates to authService.signOut with the request DTO plus auth context', async () => {
      await request(authApp.getHttpServer())
        .post('/auth/sign-out')
        .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
        .send(VALID_BODY)
        .expect(HttpStatus.NO_CONTENT);

      expect(mockAuthService.signOut).toHaveBeenCalledWith(
        expect.objectContaining<SignOutRequestDTO>({
          refreshToken: VALID_BODY.refreshToken,
          deviceId: VALID_BODY.deviceId,
        }),
        AUTHENTICATED_USER.id,
        ACCESS_TOKEN,
      );
    });

    it('falls back to request.user.token when request.token is not available', async () => {
      await request(fallbackTokenApp.getHttpServer())
        .post('/auth/sign-out')
        .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
        .send(VALID_BODY)
        .expect(HttpStatus.NO_CONTENT);

      expect(mockAuthService.signOut).toHaveBeenCalledWith(
        expect.objectContaining<SignOutRequestDTO>({
          refreshToken: VALID_BODY.refreshToken,
          deviceId: VALID_BODY.deviceId,
        }),
        AUTHENTICATED_USER.id,
        ACCESS_TOKEN,
      );
    });
  });
});
