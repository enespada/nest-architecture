import { UserService } from '@application/user/user.service';
import { LoginRequestDTO } from '@controller/auth/dto/login-request.dto';
import { RegisterRequestDTO } from '@controller/auth/dto/register-request.dto';
import { SessionDeviceType } from '@domain/auth/enums/session-device-type.enum';
import { SignOutRequestDTO } from '@controller/auth/dto/sign-out-request.dto';
import { MailService } from '@core/services/mail/mail.service';
import { SessionService } from '@core/services/session/session.service';
import { AuthRepository } from '@domain/auth/auth.repository';
import { SessionDevice } from '@domain/auth/models/session-device.model';
import { User } from '@domain/user/models/user.model';
import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';

const JWT_SECRET: string = 'unit-test-secret';

function buildMockUserService(): jest.Mocked<Partial<UserService>> {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
  };
}

function buildMockMailService(): jest.Mocked<Partial<MailService>> {
  return {};
}

function buildMockSessionService(): {
  createToken: jest.Mock;
  decrypt: jest.Mock;
} {
  return {
    createToken: jest.fn(),
    decrypt: jest.fn(),
  };
}

function buildMockConfigService(): { get: jest.Mock } {
  return {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'httpConfig.token.secret') {
        return JWT_SECRET;
      }

      return undefined;
    }),
  };
}

function buildMockAuthRepository(): jest.Mocked<AuthRepository> {
  return {
    upsertSessionDevice: jest.fn(),
    findByRefreshToken: jest.fn(),
    deleteSessionDevice: jest.fn(),
  };
}

function buildLoginRequestDto(
  overrides?: Partial<LoginRequestDTO>,
): LoginRequestDTO {
  return {
    email: 'user@example.com',
    password: 'plain-password',
    device: {
      deviceId: 'device-123',
      sessionDeviceType: SessionDeviceType.IOS,
      name: 'John iPhone',
    },
    ...overrides,
  };
}

function buildSessionDevice(overrides?: Partial<SessionDevice>): SessionDevice {
  return new SessionDevice(
    overrides?.userId ?? 'user-123',
    overrides?.deviceId ?? 'device-123',
    overrides?.sessionDeviceType ?? SessionDeviceType.IOS,
    overrides?.name ?? 'John iPhone',
    overrides?.accessToken ?? 'persisted-access-token',
    overrides?.refreshToken ?? 'persisted-refresh-token',
  );
}

function buildRegisterRequestDto(
  overrides?: Partial<RegisterRequestDTO>,
): RegisterRequestDTO {
  return {
    email: 'register@example.com',
    firstName: 'Register',
    lastName: 'User',
    password: 'plain-password',
    ...overrides,
  };
}

function buildRefreshToken(overrides?: jwt.JwtPayload): string {
  return jwt.sign(
    {
      sub: 'token-user-id',
      refresh: true,
      ...overrides,
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
}

describe('AuthService', () => {
  let service: AuthService;
  let sessionService: ReturnType<typeof buildMockSessionService>;
  let authRepository: jest.Mocked<AuthRepository>;
  let userService: jest.Mocked<Partial<UserService>>;

  async function createTestingModule(): Promise<TestingModule> {
    userService = buildMockUserService();
    const mockMailService: jest.Mocked<Partial<MailService>> =
      buildMockMailService();

    sessionService = buildMockSessionService();
    authRepository = buildMockAuthRepository();

    return Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: MailService, useValue: mockMailService },
        { provide: SessionService, useValue: sessionService },
        { provide: ConfigService, useValue: buildMockConfigService() },
        {
          provide: 'AuthRepository',
          useValue: authRepository,
        },
      ],
    }).compile();
  }

  describe('login', () => {
    it('generates tokens and persists the session device payload', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const loginRequestDto: LoginRequestDTO = buildLoginRequestDto();
      const persistedUser: User = {
        id: 'user-123',
        password: 'encrypted-password',
      } as User;

      userService.findOne?.mockResolvedValue(persistedUser);
      sessionService.decrypt.mockReturnValue('plain-password');
      sessionService.createToken
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      authRepository.upsertSessionDevice.mockResolvedValue(
        buildSessionDevice({
          userId: 'user-123',
          deviceId: loginRequestDto.device.deviceId,
          sessionDeviceType: loginRequestDto.device.sessionDeviceType,
          name: loginRequestDto.device.name,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      );

      const result = await service.login(loginRequestDto);

      expect(sessionService.createToken).toHaveBeenNthCalledWith(1, {
        id: 'user-123',
      });
      expect(sessionService.createToken).toHaveBeenNthCalledWith(
        2,
        { id: 'user-123' },
        true,
      );
      expect(authRepository.upsertSessionDevice).toHaveBeenCalledWith({
        userId: 'user-123',
        deviceId: loginRequestDto.device.deviceId,
        sessionDeviceType: loginRequestDto.device.sessionDeviceType,
        name: loginRequestDto.device.name,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
  });

  describe('signOut', () => {
    it('deletes the matching device session', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const signOutRequestDto: SignOutRequestDTO = {
        refreshToken: buildRefreshToken({ sub: 'payload-user-id' }),
        deviceId: 'device-123',
      };
      const userId: string = 'payload-user-id';
      const accessToken: string = 'access-token';

      authRepository.findByRefreshToken.mockResolvedValue(
        buildSessionDevice({
          userId,
          deviceId: 'device-123',
          accessToken,
          refreshToken: signOutRequestDto.refreshToken,
        }),
      );

      await service.signOut(signOutRequestDto, userId, accessToken);

      expect(authRepository.findByRefreshToken).toHaveBeenCalledWith(
        signOutRequestDto.refreshToken,
      );
      expect(authRepository.deleteSessionDevice).toHaveBeenCalledWith({
        userId,
        deviceId: 'device-123',
        accessToken,
      });
    });

    it('rejects when the refresh token belongs to another authenticated session', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const signOutRequestDto: SignOutRequestDTO = {
        refreshToken: buildRefreshToken({ sub: 'payload-user-id' }),
        deviceId: 'device-123',
      };
      const userId: string = 'payload-user-id';
      const accessToken: string = 'authenticated-access-token';

      authRepository.findByRefreshToken.mockResolvedValue(
        buildSessionDevice({
          userId,
          deviceId: 'device-123',
          accessToken: 'different-access-token',
          refreshToken: signOutRequestDto.refreshToken,
        }),
      );

      await expect(
        service.signOut(signOutRequestDto, userId, accessToken),
      ).rejects.toThrow(
        new ForbiddenException(
          'Refresh token does not belong to authenticated user',
        ),
      );

      expect(authRepository.deleteSessionDevice).not.toHaveBeenCalled();
    });

    it('rejects when the refresh token does not exist', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const signOutRequestDto: SignOutRequestDTO = {
        refreshToken: buildRefreshToken({ sub: 'payload-user-id' }),
        deviceId: 'device-123',
      };
      const userId: string = 'payload-user-id';
      const accessToken: string = 'access-token';

      authRepository.findByRefreshToken.mockResolvedValue(null);

      await expect(
        service.signOut(signOutRequestDto, userId, accessToken),
      ).rejects.toThrow(new ForbiddenException('Session device not found'));

      expect(authRepository.deleteSessionDevice).not.toHaveBeenCalled();
    });

    it('rejects when the refresh token belongs to another device', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const signOutRequestDto: SignOutRequestDTO = {
        refreshToken: buildRefreshToken({ sub: 'payload-user-id' }),
        deviceId: 'device-123',
      };
      const userId: string = 'payload-user-id';
      const accessToken: string = 'access-token';

      authRepository.findByRefreshToken.mockResolvedValue(
        buildSessionDevice({
          userId,
          deviceId: 'different-device',
          refreshToken: signOutRequestDto.refreshToken,
        }),
      );

      await expect(
        service.signOut(signOutRequestDto, userId, accessToken),
      ).rejects.toThrow(
        new ForbiddenException(
          'Refresh token does not belong to authenticated user',
        ),
      );

      expect(authRepository.deleteSessionDevice).not.toHaveBeenCalled();
    });

    it('rejects when the refresh token is invalid', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);

      await expect(
        service.signOut(
          {
            refreshToken: 'invalid-refresh-token',
            deviceId: 'device-999',
          },
          'payload-user-id',
          'access-token',
        ),
      ).rejects.toThrow(new ForbiddenException('Invalid refresh token'));

      expect(authRepository.deleteSessionDevice).not.toHaveBeenCalled();
    });

    it('rejects when the provided token is not a refresh token', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);

      const nonRefreshToken: string = jwt.sign({ sub: 'user-id' }, JWT_SECRET, {
        expiresIn: '1h',
      });

      await expect(
        service.signOut(
          {
            refreshToken: nonRefreshToken,
            deviceId: 'device-111',
          },
          'payload-user-id',
          'access-token',
        ),
      ).rejects.toThrow(new ForbiddenException('Invalid refresh token'));

      expect(authRepository.deleteSessionDevice).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('delegates the request DTO fields to userService.create', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const registerRequestDto: RegisterRequestDTO = buildRegisterRequestDto();
      const createdUser: User = {
        id: 'user-789',
        ...registerRequestDto,
      } as User;

      userService.create?.mockResolvedValue(createdUser);

      const result: User = await service.register(registerRequestDto);

      expect(userService.create).toHaveBeenCalledWith(registerRequestDto);
      expect(result).toBe(createdUser);
    });
  });

  describe('refresh', () => {
    it('rejects when the refresh token is missing', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const user: User = { id: 'user-123' } as User;

      await expect(service.refresh(user, '')).rejects.toThrow(
        new ForbiddenException('Refresh token is required'),
      );

      expect(authRepository.findByRefreshToken).not.toHaveBeenCalled();
    });

    it('rejects when no session device exists for the refresh token', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const user: User = { id: 'user-123' } as User;

      authRepository.findByRefreshToken.mockResolvedValue(null);

      await expect(service.refresh(user, 'refresh-token')).rejects.toThrow(
        new ForbiddenException('Session device not found'),
      );
      expect(authRepository.findByRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
    });

    it('rejects when the session device belongs to another user', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const user: User = { id: 'user-123' } as User;

      authRepository.findByRefreshToken.mockResolvedValue(
        buildSessionDevice({
          userId: 'another-user',
          refreshToken: 'refresh-token',
        }),
      );

      await expect(service.refresh(user, 'refresh-token')).rejects.toThrow(
        new ForbiddenException(
          'Refresh token does not belong to authenticated user',
        ),
      );

      expect(authRepository.upsertSessionDevice).not.toHaveBeenCalled();
    });

    it('returns tokens and updates the persisted access token', async () => {
      const module: TestingModule = await createTestingModule();
      service = module.get(AuthService);
      const user: User = { id: 'user-123' } as User;
      const sessionDevice: SessionDevice = buildSessionDevice({
        userId: 'user-123',
        deviceId: 'device-123',
        sessionDeviceType: SessionDeviceType.ANDROID,
        name: 'Pixel 9',
        accessToken: 'old-access-token',
        refreshToken: 'refresh-token',
      });

      authRepository.findByRefreshToken.mockResolvedValue(sessionDevice);
      sessionService.createToken.mockReturnValue('new-access-token');
      authRepository.upsertSessionDevice.mockResolvedValue(
        buildSessionDevice({
          userId: 'user-123',
          deviceId: 'device-123',
          sessionDeviceType: SessionDeviceType.ANDROID,
          name: 'Pixel 9',
          accessToken: 'new-access-token',
          refreshToken: 'refresh-token',
        }),
      );

      const result: { accessToken: string; refreshToken: string } =
        await service.refresh(user, 'refresh-token');

      expect(authRepository.findByRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(sessionService.createToken).toHaveBeenCalledTimes(1);
      expect(sessionService.createToken).toHaveBeenCalledWith(user);
      expect(authRepository.upsertSessionDevice).toHaveBeenCalledWith({
        userId: 'user-123',
        deviceId: 'device-123',
        sessionDeviceType: SessionDeviceType.ANDROID,
        name: 'Pixel 9',
        accessToken: 'new-access-token',
        refreshToken: 'refresh-token',
      });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'refresh-token',
      });
    });
  });
});
