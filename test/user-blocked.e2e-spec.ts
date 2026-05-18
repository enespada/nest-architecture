/**
 * E2e tests for the user-blocked lifecycle and contextual block-flag responses.
 *
 * TECHNICAL BLOCKER — Wave 5 not yet complete:
 *   UserBlockedModule (src/api/user-blocked/user-blocked.module.ts) does not
 *   exist and AppModule does not register it. Because the full AppModule cannot
 *   resolve UserBlockedController, these tests wire a custom TestingModule that
 *   declares both UserBlockedController and UserController with mocked services.
 *   Once task 5A+5B land, the custom module can be swapped for AppModule and
 *   these tests will exercise the real DB layer end-to-end.
 */

import {
  ExecutionContext,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');

// Relative imports so the test file itself does not depend on moduleNameMapper.
// Internal path aliases used by each source file are resolved via
// moduleNameMapper in jest-e2e.json.
import { UserBlockedController } from '../src/api/user-blocked/user-blocked.controller';
import { UserController } from '../src/api/user/user.controller';
import { UserBlockedService } from '../src/application/user-blocked/user-blocked.service';
import { UserService } from '../src/application/user/user.service';
import { ExceptionFilter } from '../src/core/exceptions/global.exception';
import { JwtUserGuard } from '../src/core/middlewares/jwt/user/jwt-user.guard';
import { CustomLoggerService } from '../src/core/services/logger/logger.service';
import { User } from '../src/domain/user/models/user.model';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const LOGGED_USER = new User(
  'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
  'logged@test.com',
  'logged-user',
  'Logged',
  'User',
  '+34',
  '600000010',
  'es',
  '1990-05-20',
  'hashed',
);

const OTHER_USER_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';

const OTHER_USER = new User(
  OTHER_USER_ID,
  'other@test.com',
  'other-user',
  'Other',
  'User',
  '+34',
  '600000011',
  'en',
  '1991-06-21',
  'hashed',
  true, // isBlockedByLogged — LOGGED_USER has blocked OTHER_USER
  false, // blockedLogged
);

// ── Guard mocks ───────────────────────────────────────────────────────────────

// Simulates a valid JWT: injects LOGGED_USER into request.user
const passGuard = {
  canActivate: (ctx: ExecutionContext) => {
    ctx.switchToHttp().getRequest().user = LOGGED_USER;
    return true;
  },
};

// Simulates a missing/invalid JWT
const rejectGuard = {
  canActivate: () => {
    throw new UnauthorizedException();
  },
};

// ── Service mocks ─────────────────────────────────────────────────────────────

const mockUserBlockedService = {
  block: jest.fn<Promise<void>, [string, string]>(),
  unblock: jest.fn<Promise<void>, [string, string]>(),
  paginateBlocked: jest.fn<
    Promise<{ items: User[]; total: number }>,
    [string, any]
  >(),
};

const mockUserService = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn<Promise<User>, [any, string?]>(),
  findById: jest.fn<Promise<User>, [string, string?]>(),
  paginate: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Minimal logger stub required by ExceptionFilter
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

// ── App factory ───────────────────────────────────────────────────────────────

async function createApp(guardOverride: object): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [UserBlockedController, UserController],
    providers: [
      { provide: UserBlockedService, useValue: mockUserBlockedService },
      { provide: UserService, useValue: mockUserService },
      // Required so ExceptionFilter (used by both controllers) can be resolved
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

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('UserBlocked lifecycle (e2e)', () => {
  let authApp: INestApplication; // authenticated context
  let unauthApp: INestApplication; // unauthenticated context

  beforeAll(async () => {
    authApp = await createApp(passGuard);
    unauthApp = await createApp(rejectGuard);
  });

  afterAll(async () => {
    await authApp.close();
    await unauthApp.close();
  });

  beforeEach(() => {
    // Reset call records; implementations are re-set below
    jest.clearAllMocks();

    mockUserBlockedService.block.mockResolvedValue(undefined);
    mockUserBlockedService.unblock.mockResolvedValue(undefined);
    mockUserBlockedService.paginateBlocked.mockResolvedValue({
      items: [OTHER_USER],
      total: 1,
    });

    mockUserService.findOne.mockResolvedValue(LOGGED_USER);
    mockUserService.findById.mockResolvedValue(OTHER_USER);
    mockUserService.find.mockResolvedValue([]);
    mockUserService.paginate.mockResolvedValue({
      data: [OTHER_USER],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 1,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  });

  // ── POST /users/blocked/:id ────────────────────────────────────────────────

  describe('POST /users/blocked/:id — block a user', () => {
    it('returns 204 when the authenticated user blocks another user', async () => {
      await request(authApp.getHttpServer())
        .post(`/users/blocked/${OTHER_USER_ID}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('delegates to userBlockedService.block with blockerId=loggedUserId and blockedId=param', async () => {
      await request(authApp.getHttpServer())
        .post(`/users/blocked/${OTHER_USER_ID}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(mockUserBlockedService.block).toHaveBeenCalledWith(
        LOGGED_USER.id,
        OTHER_USER_ID,
      );
    });

    it('returns 401 when not authenticated', () => {
      return request(unauthApp.getHttpServer())
        .post(`/users/blocked/${OTHER_USER_ID}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns 400 for a non-UUID path parameter', () => {
      return request(authApp.getHttpServer())
        .post('/users/blocked/not-a-uuid')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // ── DELETE /users/blocked/:id ──────────────────────────────────────────────

  describe('DELETE /users/blocked/:id — unblock a user', () => {
    it('returns 204 when the authenticated user unblocks another user', async () => {
      await request(authApp.getHttpServer())
        .delete(`/users/blocked/${OTHER_USER_ID}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('delegates to userBlockedService.unblock with correct ids', async () => {
      await request(authApp.getHttpServer())
        .delete(`/users/blocked/${OTHER_USER_ID}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(mockUserBlockedService.unblock).toHaveBeenCalledWith(
        LOGGED_USER.id,
        OTHER_USER_ID,
      );
    });

    it('returns 401 when not authenticated', () => {
      return request(unauthApp.getHttpServer())
        .delete(`/users/blocked/${OTHER_USER_ID}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  // ── GET /users/blocked/paginate ────────────────────────────────────────────

  describe('GET /users/blocked/paginate — list blocked users', () => {
    it('returns 200 with a flat User array (not nested in data.data)', async () => {
      const res = await request(authApp.getHttpServer())
        .get('/users/blocked/paginate')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(OTHER_USER_ID);
    });

    it('each array item carries the isBlockedByLogged flag', async () => {
      const res = await request(authApp.getHttpServer())
        .get('/users/blocked/paginate')
        .expect(HttpStatus.OK);

      expect(res.body[0].isBlockedByLogged).toBe(true);
    });

    it('delegates to paginateBlocked using the authenticated user id', async () => {
      await request(authApp.getHttpServer())
        .get('/users/blocked/paginate')
        .expect(HttpStatus.OK);

      expect(mockUserBlockedService.paginateBlocked).toHaveBeenCalledWith(
        LOGGED_USER.id,
        expect.any(Object),
      );
    });

    it('respects limit and offset query params', async () => {
      await request(authApp.getHttpServer())
        .get('/users/blocked/paginate?limit=5&offset=10')
        .expect(HttpStatus.OK);

      expect(mockUserBlockedService.paginateBlocked).toHaveBeenCalledWith(
        LOGGED_USER.id,
        expect.objectContaining({ limit: 5, offset: 10 }),
      );
    });

    it('returns 401 when not authenticated', () => {
      return request(unauthApp.getHttpServer())
        .get('/users/blocked/paginate')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  // ── GET /users/paginate — block-flag awareness ─────────────────────────────

  describe('GET /users/paginate — requires auth, threads loggedUserId', () => {
    it('returns 401 when not authenticated', () => {
      return request(unauthApp.getHttpServer())
        .get('/users/paginate')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns 200 and passes the authenticated user id to paginate', async () => {
      await request(authApp.getHttpServer())
        .get('/users/paginate')
        .expect(HttpStatus.OK);

      expect(mockUserService.paginate).toHaveBeenCalledWith(
        expect.any(Object),
        LOGGED_USER.id,
      );
    });
  });

  // ── GET /users/me — block-flag awareness ──────────────────────────────────

  describe('GET /users/me — authenticated profile with block context', () => {
    it('returns 200 and passes loggedUserId to findOne for block-flag computation', async () => {
      const meWithFlags = new User(
        LOGGED_USER.id,
        LOGGED_USER.email,
        LOGGED_USER.username,
        LOGGED_USER.firstName,
        LOGGED_USER.lastName,
        LOGGED_USER.phonePreffix,
        LOGGED_USER.phone,
        LOGGED_USER.language,
        LOGGED_USER.birthDate,
        LOGGED_USER.password,
        false, // isBlockedByLogged — a user cannot block themselves
        false, // blockedLogged
      );
      mockUserService.findOne.mockResolvedValueOnce(meWithFlags);

      const res = await request(authApp.getHttpServer())
        .get('/users/me')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(LOGGED_USER.id);
      expect(mockUserService.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: LOGGED_USER.id } }),
        LOGGED_USER.id,
      );
    });
  });

  // ── GET /users/:id — block-flag awareness ─────────────────────────────────

  describe('GET /users/:id — contextual read with isBlockedByLogged / blockedLogged', () => {
    it('returns 200 with user data including both block flags', async () => {
      const res = await request(authApp.getHttpServer())
        .get(`/users/${OTHER_USER_ID}`)
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(OTHER_USER_ID);
      expect(res.body.isBlockedByLogged).toBe(true);
      expect(res.body.blockedLogged).toBe(false);
    });

    it('delegates findById with loggedUserId so the repository can compute flags', async () => {
      await request(authApp.getHttpServer())
        .get(`/users/${OTHER_USER_ID}`)
        .expect(HttpStatus.OK);

      expect(mockUserService.findById).toHaveBeenCalledWith(
        OTHER_USER_ID,
        LOGGED_USER.id,
      );
    });

    it('returns 401 when not authenticated', () => {
      return request(unauthApp.getHttpServer())
        .get(`/users/${OTHER_USER_ID}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
