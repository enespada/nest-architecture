import {
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');

import { AuthController } from '../src/api/auth/auth.controller';
import { LoginResponseDto } from '../src/application/auth/dto/login-response.dto';
import { AuthService } from '../src/application/auth/auth.service';
import { ExceptionFilter } from '../src/core/exceptions/global.exception';
import { JwtRefreshGuard } from '../src/core/middlewares/jwt/refresh/jwt-refresh.guard';
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

const REFRESH_TOKEN = 'raw-refresh-token';

const REFRESH_RESPONSE: LoginResponseDto = {
  accessToken: 'new-access-token',
  refreshToken: REFRESH_TOKEN,
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
  signOut: jest.Mock;
} = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn<Promise<LoginResponseDto>, [User, string]>(),
  signOut: jest.fn(),
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
    .overrideGuard(JwtRefreshGuard)
    .useValue(guardOverride)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

describe('Auth refresh contract (e2e)', () => {
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
    mockAuthService.refresh.mockResolvedValue(REFRESH_RESPONSE);
  });

  describe('GET /auth/refresh', () => {
    it('returns 200 and the refreshed token pair when authenticated', async () => {
      const response = await request(authApp.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${REFRESH_TOKEN}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(REFRESH_RESPONSE);
    });

    it('delegates to authService.refresh with the authenticated user and raw refresh token', async () => {
      await request(authApp.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${REFRESH_TOKEN}`)
        .expect(HttpStatus.OK);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        AUTHENTICATED_USER,
        REFRESH_TOKEN,
      );
    });

    it('falls back to request.user.token when request.token is not available', async () => {
      await request(fallbackTokenApp.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${REFRESH_TOKEN}`)
        .expect(HttpStatus.OK);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        expect.objectContaining({
          id: AUTHENTICATED_USER.id,
          token: REFRESH_TOKEN,
        }),
        REFRESH_TOKEN,
      );
    });

    it('returns 401 when authentication is missing', () => {
      return request(unauthApp.getHttpServer())
        .get('/auth/refresh')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns 403 when the service cannot resolve a session device', () => {
      mockAuthService.refresh.mockRejectedValueOnce(
        new ForbiddenException('Session device not found'),
      );

      return request(authApp.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${REFRESH_TOKEN}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
