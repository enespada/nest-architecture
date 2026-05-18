import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');

import { AuthController } from '../src/api/auth/auth.controller';
import { RegisterRequestDTO } from '../src/application/auth/dto/register-request.dto';
import { AuthService } from '../src/application/auth/auth.service';
import { ExceptionFilter } from '../src/core/exceptions/global.exception';
import { CustomLoggerService } from '../src/core/services/logger/logger.service';
import { User } from '../src/domain/user/models/user.model';

const VALID_REGISTER_BODY: RegisterRequestDTO = {
  email: 'register@test.com',
  username: 'register-user',
  firstName: 'Register',
  lastName: 'User',
  phonePreffix: '+34',
  phone: '600000100',
  language: 'es',
  birthDate: '1990-05-20',
  password: 'SecurePass123',
};

const VALID_REGISTER_BODY_WITHOUT_PHONE: Omit<
  RegisterRequestDTO,
  'phone' | 'phonePreffix'
> = {
  email: 'register-no-phone@test.com',
  username: 'register-no-phone-user',
  firstName: 'Register',
  lastName: 'NoPhone',
  language: 'es',
  birthDate: '1990-05-20',
  password: 'SecurePass123',
};

const REGISTERED_USER = new User(
  'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
  VALID_REGISTER_BODY.email,
  VALID_REGISTER_BODY.username,
  VALID_REGISTER_BODY.firstName,
  VALID_REGISTER_BODY.lastName,
  VALID_REGISTER_BODY.phonePreffix,
  VALID_REGISTER_BODY.phone,
  VALID_REGISTER_BODY.language,
  VALID_REGISTER_BODY.birthDate,
  'hashed-password',
);

const REGISTERED_USER_WITHOUT_PHONE = new User(
  'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
  VALID_REGISTER_BODY_WITHOUT_PHONE.email,
  VALID_REGISTER_BODY_WITHOUT_PHONE.username,
  VALID_REGISTER_BODY_WITHOUT_PHONE.firstName,
  VALID_REGISTER_BODY_WITHOUT_PHONE.lastName,
  null,
  null,
  VALID_REGISTER_BODY_WITHOUT_PHONE.language,
  VALID_REGISTER_BODY_WITHOUT_PHONE.birthDate,
  'hashed-password',
);

const mockAuthService: {
  login: jest.Mock;
  register: jest.Mock<Promise<User>, [RegisterRequestDTO]>;
  refresh: jest.Mock;
  signOut: jest.Mock;
} = {
  login: jest.fn(),
  register: jest.fn<Promise<User>, [RegisterRequestDTO]>(),
  refresh: jest.fn(),
  signOut: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

async function createApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: mockAuthService },
      { provide: CustomLoggerService, useValue: mockLogger },
      ExceptionFilter,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

describe('Auth register contract (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.register.mockResolvedValue(REGISTERED_USER);
  });

  describe('POST /auth/register', () => {
    it('returns 200 and includes phonePreffix, phone, and language in the response contract', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(VALID_REGISTER_BODY)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: REGISTERED_USER.id,
          email: VALID_REGISTER_BODY.email,
          username: VALID_REGISTER_BODY.username,
          firstName: VALID_REGISTER_BODY.firstName,
          lastName: VALID_REGISTER_BODY.lastName,
          phonePreffix: VALID_REGISTER_BODY.phonePreffix,
          phone: VALID_REGISTER_BODY.phone,
          language: VALID_REGISTER_BODY.language,
          birthDate: VALID_REGISTER_BODY.birthDate,
        }),
      );
    });

    it('delegates to authService.register with the full register contract including the new fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(VALID_REGISTER_BODY)
        .expect(HttpStatus.CREATED);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining<RegisterRequestDTO>({
          email: VALID_REGISTER_BODY.email,
          username: VALID_REGISTER_BODY.username,
          firstName: VALID_REGISTER_BODY.firstName,
          lastName: VALID_REGISTER_BODY.lastName,
          phonePreffix: VALID_REGISTER_BODY.phonePreffix,
          phone: VALID_REGISTER_BODY.phone,
          language: VALID_REGISTER_BODY.language,
          birthDate: VALID_REGISTER_BODY.birthDate,
          password: VALID_REGISTER_BODY.password,
        }),
      );
    });

    it('returns 201 when phone and phonePreffix are omitted', async () => {
      mockAuthService.register.mockResolvedValueOnce(
        REGISTERED_USER_WITHOUT_PHONE,
      );

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(VALID_REGISTER_BODY_WITHOUT_PHONE)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: REGISTERED_USER_WITHOUT_PHONE.id,
          email: VALID_REGISTER_BODY_WITHOUT_PHONE.email,
          username: VALID_REGISTER_BODY_WITHOUT_PHONE.username,
          firstName: VALID_REGISTER_BODY_WITHOUT_PHONE.firstName,
          lastName: VALID_REGISTER_BODY_WITHOUT_PHONE.lastName,
          phonePreffix: null,
          phone: null,
          language: VALID_REGISTER_BODY_WITHOUT_PHONE.language,
          birthDate: VALID_REGISTER_BODY_WITHOUT_PHONE.birthDate,
        }),
      );
    });

    it('returns 201 when phone and phonePreffix are both null', async () => {
      mockAuthService.register.mockResolvedValueOnce(
        REGISTERED_USER_WITHOUT_PHONE,
      );

      const bodyWithNulls = {
        ...VALID_REGISTER_BODY_WITHOUT_PHONE,
        phone: null,
        phonePreffix: null,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(bodyWithNulls)
        .expect(HttpStatus.CREATED);
    });

    it('returns 201 when phone and phonePreffix are sent as empty strings', async () => {
      mockAuthService.register.mockResolvedValueOnce(
        REGISTERED_USER_WITHOUT_PHONE,
      );

      const bodyWithEmptyStrings = {
        ...VALID_REGISTER_BODY_WITHOUT_PHONE,
        phone: '',
        phonePreffix: '',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(bodyWithEmptyStrings)
        .expect(HttpStatus.CREATED);
    });

    it('returns 400 when one of the new required fields is missing', () => {
      const invalidBody: Omit<RegisterRequestDTO, 'language'> = {
        email: VALID_REGISTER_BODY.email,
        username: VALID_REGISTER_BODY.username,
        firstName: VALID_REGISTER_BODY.firstName,
        lastName: VALID_REGISTER_BODY.lastName,
        phonePreffix: VALID_REGISTER_BODY.phonePreffix,
        phone: VALID_REGISTER_BODY.phone,
        birthDate: VALID_REGISTER_BODY.birthDate,
        password: VALID_REGISTER_BODY.password,
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidBody)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
