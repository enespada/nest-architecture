import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserBlockedRepository } from '@domain/user-blocked/user-blocked.repository';
import { UserRepository } from '@domain/user/user.repository';
import { User } from '@domain/user/models/user.model';
import { UserBlockedPaginationOptionsDTO } from '@application/user-blocked/dto/user-blocked-pagination-options.dto';
import { UserBlockedService } from './user-blocked.service';

// Creates a minimal valid User stub for test assertions
function makeUser(id: string): User {
  return new User(id, `${id}@test.com`, 'Test', 'User', 'hashed-pw');
}

describe('UserBlockedService', () => {
  let service: UserBlockedService;
  let userBlockedRepo: jest.Mocked<UserBlockedRepository>;
  let userRepo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const userBlockedRepoMock: jest.Mocked<UserBlockedRepository> = {
      block: jest.fn().mockResolvedValue(undefined),
      unblock: jest.fn().mockResolvedValue(undefined),
      isBlocking: jest.fn().mockResolvedValue(false),
      paginateBlocked: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    };

    const userRepoMock: jest.Mocked<UserRepository> = {
      create: jest.fn(),
      paginate: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserBlockedService,
        { provide: 'UserBlockedRepository', useValue: userBlockedRepoMock },
        { provide: 'UserRepository', useValue: userRepoMock },
      ],
    }).compile();

    service = module.get(UserBlockedService);
    userBlockedRepo = module.get('UserBlockedRepository');
    userRepo = module.get('UserRepository');
  });

  // ─── block ───────────────────────────────────────────────────────────────────

  describe('block', () => {
    const BLOCKER = 'blocker-uuid';
    const BLOCKED = 'blocked-uuid';

    it('should verify target existence and delegate to the repository on success', async () => {
      userRepo.findById.mockResolvedValueOnce(makeUser(BLOCKED));

      await service.block(BLOCKER, BLOCKED);

      expect(userRepo.findById).toHaveBeenCalledWith(BLOCKED);
      expect(userBlockedRepo.block).toHaveBeenCalledWith(BLOCKER, BLOCKED);
    });

    it('should throw BadRequestException when a user tries to block themselves', async () => {
      await expect(service.block(BLOCKER, BLOCKER)).rejects.toThrow(
        BadRequestException,
      );
      // Self-block must be rejected before any repository call
      expect(userRepo.findById).not.toHaveBeenCalled();
      expect(userBlockedRepo.block).not.toHaveBeenCalled();
    });

    it('should propagate the exception when the target user does not exist', async () => {
      userRepo.findById.mockRejectedValueOnce(
        new BadRequestException('User not found'),
      );

      await expect(service.block(BLOCKER, BLOCKED)).rejects.toThrow(
        BadRequestException,
      );
      // Repository block must not be called when the target is missing
      expect(userBlockedRepo.block).not.toHaveBeenCalled();
    });
  });

  // ─── unblock ─────────────────────────────────────────────────────────────────

  describe('unblock', () => {
    const BLOCKER = 'blocker-uuid';
    const BLOCKED = 'blocked-uuid';

    it('should verify target existence and delegate to the repository on success', async () => {
      userRepo.findById.mockResolvedValueOnce(makeUser(BLOCKED));

      await service.unblock(BLOCKER, BLOCKED);

      expect(userRepo.findById).toHaveBeenCalledWith(BLOCKED);
      expect(userBlockedRepo.unblock).toHaveBeenCalledWith(BLOCKER, BLOCKED);
    });

    it('should throw BadRequestException when a user tries to unblock themselves', async () => {
      await expect(service.unblock(BLOCKER, BLOCKER)).rejects.toThrow(
        BadRequestException,
      );
      expect(userBlockedRepo.unblock).not.toHaveBeenCalled();
    });
  });

  // ─── paginateBlocked ─────────────────────────────────────────────────────────

  describe('paginateBlocked', () => {
    it('should delegate pagination to the repository and return its result unchanged', async () => {
      const BLOCKER = 'blocker-uuid';
      const dto = new UserBlockedPaginationOptionsDTO();
      const expected = { items: [makeUser('other-uuid')], total: 1 };
      userBlockedRepo.paginateBlocked.mockResolvedValueOnce(expected);

      const result = await service.paginateBlocked(BLOCKER, dto);

      expect(userBlockedRepo.paginateBlocked).toHaveBeenCalledWith(
        BLOCKER,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });
});
