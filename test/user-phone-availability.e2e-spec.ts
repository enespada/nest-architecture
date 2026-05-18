import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');

import { UserController } from '../src/api/user/user.controller';
import { PhoneAvailabilityQueryDTO } from '../src/application/user/dto/phone-availability-query.dto';
import { PhoneAvailabilityResponseDTO } from '../src/application/user/dto/phone-availability-response.dto';
import { UserService } from '../src/application/user/user.service';
import { ExceptionFilter } from '../src/core/exceptions/global.exception';
import { CustomLoggerService } from '../src/core/services/logger/logger.service';

const VALID_QUERY: PhoneAvailabilityQueryDTO = {
  phonePreffix: '+34',
  phone: '600000123',
};

const SERVICE_RESPONSE: PhoneAvailabilityResponseDTO = {
  available: true,
};

const mockUserService: {
  isPhoneAvailable: jest.Mock<
    Promise<PhoneAvailabilityResponseDTO>,
    [PhoneAvailabilityQueryDTO]
  >;
} = {
  isPhoneAvailable: jest.fn<
    Promise<PhoneAvailabilityResponseDTO>,
    [PhoneAvailabilityQueryDTO]
  >(),
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
    controllers: [UserController],
    providers: [
      { provide: UserService, useValue: mockUserService },
      { provide: CustomLoggerService, useValue: mockLogger },
      ExceptionFilter,
    ],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

describe('User phone availability contract (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService.isPhoneAvailable.mockResolvedValue(SERVICE_RESPONSE);
  });

  describe('GET /users/phone-available', () => {
    it('returns 200 with the service response for a valid query', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/phone-available')
        .query(VALID_QUERY)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(SERVICE_RESPONSE);
    });

    it('returns 400 when phonePreffix is missing', async () => {
      await request(app.getHttpServer())
        .get('/users/phone-available')
        .query({ phone: VALID_QUERY.phone })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('returns 400 when phone is missing', async () => {
      await request(app.getHttpServer())
        .get('/users/phone-available')
        .query({ phonePreffix: VALID_QUERY.phonePreffix })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('returns 400 when phonePreffix is an empty string', async () => {
      await request(app.getHttpServer())
        .get('/users/phone-available')
        .query({
          phonePreffix: '',
          phone: VALID_QUERY.phone,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('returns 400 when phone is an empty string', async () => {
      await request(app.getHttpServer())
        .get('/users/phone-available')
        .query({
          phonePreffix: VALID_QUERY.phonePreffix,
          phone: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('delegates to userService.isPhoneAvailable with phonePreffix and phone', async () => {
      await request(app.getHttpServer())
        .get('/users/phone-available')
        .query(VALID_QUERY)
        .expect(HttpStatus.OK);

      expect(mockUserService.isPhoneAvailable).toHaveBeenCalledWith(
        expect.objectContaining<PhoneAvailabilityQueryDTO>({
          phonePreffix: VALID_QUERY.phonePreffix,
          phone: VALID_QUERY.phone,
        }),
      );
    });
  });
});
