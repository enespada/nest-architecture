import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/models/user.model';
import { SessionService } from '../../core/services/session/session.service';
import { EmailAvailabilityQueryDTO } from './dto/email-availability-query.dto';
import { UserPageOptionsDTO } from './dto/user-pagination-options.dto';
import { FindOneOptions } from '../../domain/shared/interfaces/find-options.interface';
import { UsernameAvailabilityQueryDTO } from './dto/username-availability-query.dto';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const userFixture = new User(
  'user-uuid-1',
  'john@example.com',
  'john_doe',
  'John',
  'Doe',
  '+34',
  '600123123',
  'es',
  '1990-05-20',
  'encrypted-pass',
);

const createUserDtoFixture = {
  email: 'john@example.com',
  username: 'john_doe',
  firstName: 'John',
  lastName: 'Doe',
  phonePreffix: '+34',
  phone: '600123123',
  language: 'es',
  birthDate: '1990-05-20',
  password: 'plain-pass',
};

const updateUserDtoFixture = {
  email: 'john.updated@example.com',
  username: 'john_updated',
  firstName: 'Johnny',
  lastName: 'Doe',
  phonePreffix: '+1',
  phone: '555000111',
  language: 'en',
  birthDate: '1990-05-21',
  password: 'new-plain-pass',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    create: jest.fn(),
    paginate: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    isUsernameAvailable: jest.fn(),
    isEmailAvailable: jest.fn(),
    isPhoneAvailable: jest.fn(),
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('UserService — contextual reads', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let sessionService: { encrypt: jest.Mock };

  beforeEach(async () => {
    userRepository = buildMockUserRepository();

    sessionService = {
      encrypt: jest.fn().mockReturnValue('encrypted'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepository', useValue: userRepository },
        { provide: SessionService, useValue: sessionService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------

  describe('create', () => {
    it('forwards the expanded payload and encrypted password to the repository', async () => {
      userRepository.create.mockResolvedValue(userFixture);

      const result = await service.create(createUserDtoFixture);

      expect(sessionService.encrypt).toHaveBeenCalledTimes(1);
      expect(sessionService.encrypt).toHaveBeenCalledWith('plain-pass');
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'john@example.com',
        username: 'john_doe',
        firstName: 'John',
        lastName: 'Doe',
        phonePreffix: '+34',
        phone: '600123123',
        language: 'es',
        birthDate: '1990-05-20',
        password: 'encrypted',
      });
      expect(result).toBe(userFixture);
    });
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------

  describe('update', () => {
    it('forwards the expanded payload and encrypted password to the repository', async () => {
      const updatedUser = new User(
        'user-uuid-1',
        'john.updated@example.com',
        'john_updated',
        'Johnny',
        'Doe',
        '+1',
        '555000111',
        'en',
        '1990-05-21',
        'encrypted',
      );
      userRepository.findById.mockResolvedValue(userFixture);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-uuid-1', updateUserDtoFixture);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith('user-uuid-1');
      expect(sessionService.encrypt).toHaveBeenCalledTimes(1);
      expect(sessionService.encrypt).toHaveBeenCalledWith('new-plain-pass');
      expect(userRepository.update).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledWith('user-uuid-1', {
        email: 'john.updated@example.com',
        username: 'john_updated',
        firstName: 'Johnny',
        lastName: 'Doe',
        phonePreffix: '+1',
        phone: '555000111',
        language: 'en',
        birthDate: '1990-05-21',
        password: 'encrypted',
      });
      expect(result).toBe(updatedUser);
    });
  });

  // -------------------------------------------------------------------------
  // findById
  // -------------------------------------------------------------------------

  describe('findById', () => {
    it('forwards loggedUserId to the repository', async () => {
      const loggedUserId = 'logged-uuid-1';
      userRepository.findById.mockResolvedValue(userFixture);

      const result = await service.findById('user-uuid-1', loggedUserId);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(
        'user-uuid-1',
        loggedUserId,
      );
      expect(result).toBe(userFixture);
    });

    it('forwards undefined loggedUserId when called without the argument', async () => {
      userRepository.findById.mockResolvedValue(userFixture);

      await service.findById('user-uuid-1');

      expect(userRepository.findById).toHaveBeenCalledWith(
        'user-uuid-1',
        undefined,
      );
    });

    it('returns the user returned by the repository', async () => {
      const enriched = new User(
        'user-uuid-1',
        'john@example.com',
        'john_doe',
        'John',
        'Doe',
        '+34',
        '600123123',
        'es',
        '1990-05-20',
        'encrypted-pass',
        true,
        false,
      );
      userRepository.findById.mockResolvedValue(enriched);

      const result = await service.findById('user-uuid-1', 'logged-uuid-1');

      expect(result.isBlockedByLogged).toBe(true);
      expect(result.blockedLogged).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // findOne
  // -------------------------------------------------------------------------

  describe('findOne', () => {
    it('forwards loggedUserId and options to the repository', async () => {
      const loggedUserId = 'logged-uuid-2';
      const options: FindOneOptions<User> = {
        where: { email: 'john@example.com' },
      };
      userRepository.findOne.mockResolvedValue(userFixture);

      const result = await service.findOne(options, loggedUserId);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        options,
        loggedUserId,
      );
      expect(result).toBe(userFixture);
    });

    it('uses empty options object when called with no arguments', async () => {
      userRepository.findOne.mockResolvedValue(userFixture);

      await service.findOne();

      expect(userRepository.findOne).toHaveBeenCalledWith({}, undefined);
    });

    it('forwards undefined loggedUserId when only options are provided', async () => {
      const options: FindOneOptions<User> = {
        where: { email: 'john@example.com' },
      };
      userRepository.findOne.mockResolvedValue(userFixture);

      await service.findOne(options);

      expect(userRepository.findOne).toHaveBeenCalledWith(options, undefined);
    });
  });

  // -------------------------------------------------------------------------
  // paginate
  // -------------------------------------------------------------------------

  describe('paginate', () => {
    it('forwards loggedUserId to the repository and wraps result in PageDTO', async () => {
      const loggedUserId = 'logged-uuid-3';
      const dto = new UserPageOptionsDTO();
      userRepository.paginate.mockResolvedValue({
        totalItems: 1,
        entities: [userFixture],
      });

      const result = await service.paginate(dto, loggedUserId);

      expect(userRepository.paginate).toHaveBeenCalledTimes(1);
      expect(userRepository.paginate).toHaveBeenCalledWith(dto, loggedUserId);
      expect(result.data).toEqual([userFixture]);
      expect(result.meta.totalItems).toBe(1);
    });

    it('forwards undefined loggedUserId when called without it', async () => {
      const dto = new UserPageOptionsDTO();
      userRepository.paginate.mockResolvedValue({
        totalItems: 0,
        entities: [],
      });

      const result = await service.paginate(dto);

      expect(userRepository.paginate).toHaveBeenCalledWith(dto, undefined);
      expect(result.data).toEqual([]);
    });

    it('propagates block-context fields returned by the repository for each user', async () => {
      const loggedUserId = 'logged-uuid-4';
      const dto = new UserPageOptionsDTO();
      const blockedUser = new User(
        'user-uuid-2',
        'jane@example.com',
        'jane_doe',
        'Jane',
        'Doe',
        '+34',
        '600987987',
        'es',
        '1992-08-14',
        'encrypted-pass',
        true,
        false,
      );
      userRepository.paginate.mockResolvedValue({
        totalItems: 1,
        entities: [blockedUser],
      });

      const result = await service.paginate(dto, loggedUserId);
      const users = result.data as User[];

      expect(users[0].isBlockedByLogged).toBe(true);
      expect(users[0].blockedLogged).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // isUsernameAvailable
  // -------------------------------------------------------------------------

  describe('isUsernameAvailable', () => {
    it('returns available: true when the repository reports the username is free', async () => {
      userRepository.isUsernameAvailable.mockResolvedValue(true);
      const dto: UsernameAvailabilityQueryDTO = { username: 'free_user' };

      const result = await service.isUsernameAvailable(dto);

      expect(userRepository.isUsernameAvailable).toHaveBeenCalledTimes(1);
      expect(userRepository.isUsernameAvailable).toHaveBeenCalledWith(
        'free_user',
      );
      expect(result).toEqual({ available: true });
    });

    it('returns available: false when the repository reports the username is taken', async () => {
      userRepository.isUsernameAvailable.mockResolvedValue(false);
      const dto: UsernameAvailabilityQueryDTO = { username: 'taken_user' };

      const result = await service.isUsernameAvailable(dto);

      expect(result).toEqual({ available: false });
    });
  });

  // -------------------------------------------------------------------------
  // isEmailAvailable
  // -------------------------------------------------------------------------

  describe('isEmailAvailable', () => {
    it('returns available: true when the repository reports the email is free', async () => {
      userRepository.isEmailAvailable.mockResolvedValue(true);
      const dto: EmailAvailabilityQueryDTO = { email: 'free@example.com' };

      const result = await service.isEmailAvailable(dto);

      expect(userRepository.isEmailAvailable).toHaveBeenCalledTimes(1);
      expect(userRepository.isEmailAvailable).toHaveBeenCalledWith(
        'free@example.com',
      );
      expect(result).toEqual({ available: true });
    });

    it('returns available: false when the repository reports the email is taken', async () => {
      userRepository.isEmailAvailable.mockResolvedValue(false);
      const dto: EmailAvailabilityQueryDTO = { email: 'taken@example.com' };

      const result = await service.isEmailAvailable(dto);

      expect(result).toEqual({ available: false });
    });
  });
});
