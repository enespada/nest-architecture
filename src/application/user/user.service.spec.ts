import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/models/user.model';
import { SessionService } from '../../core/services/session/session.service';
import { UserPageOptionsDTO } from './dto/user-pagination-options.dto';
import { FindOneOptions } from '../../domain/shared/interfaces/find-options.interface';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const userFixture = new User(
  'user-uuid-1',
  'john@example.com',
  'John',
  'Doe',
  'encrypted-pass',
);

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
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('UserService — contextual reads', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    userRepository = buildMockUserRepository();

    const mockSessionService = {
      encrypt: jest.fn().mockReturnValue('encrypted'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepository', useValue: userRepository },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
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
        'John',
        'Doe',
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
        'Jane',
        'Doe',
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
});
