import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserBlockedRepository } from '@domain/user-blocked/user-blocked.repository';
import { UserRepository } from '@domain/user/user.repository';
import { User } from '@domain/user/models/user.model';
import { UserBlockedPaginationOptionsDTO } from './dto/user-blocked-pagination-options.dto';

@Injectable()
export class UserBlockedService {
  constructor(
    @Inject('UserBlockedRepository')
    private readonly userBlockedRepository: UserBlockedRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Blocks a user on behalf of the authenticated user.
   * Validates that the caller is not trying to block themselves and that
   * the target user exists before delegating to the repository.
   */
  async block(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new BadRequestException('A user cannot block themselves');
    }
    // Ensure the target exists; repository throws BadRequestException if not
    await this.userRepository.findById(blockedId);
    await this.userBlockedRepository.block(blockerId, blockedId);
  }

  /**
   * Removes an active block relation on behalf of the authenticated user.
   * Validates existence of the target user before delegating to the repository.
   */
  async unblock(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new BadRequestException('A user cannot unblock themselves');
    }
    // Ensure the target exists; repository throws BadRequestException if not
    await this.userRepository.findById(blockedId);
    await this.userBlockedRepository.unblock(blockerId, blockedId);
  }

  /**
   * Returns whether the authenticated user is currently blocking the given user.
   */
  async isBlocking(blockerId: string, blockedId: string): Promise<boolean> {
    return this.userBlockedRepository.isBlocking(blockerId, blockedId);
  }

  /**
   * Returns a paginated flat list of users blocked by the authenticated user.
   * The response shape { items, total } is intentionally kept flat to match
   * the Flutter client contract (response.data ?? []).
   */
  async paginateBlocked(
    blockerId: string,
    dto: UserBlockedPaginationOptionsDTO,
  ): Promise<{ items: User[]; total: number }> {
    return this.userBlockedRepository.paginateBlocked(blockerId, dto);
  }
}
