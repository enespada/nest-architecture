import { UserBlockedPaginationOptionsDTO } from '@application/user-blocked/dto/user-blocked-pagination-options.dto';
import { User } from '@domain/user/models/user.model';

export interface UserBlockedRepository {
  /**
   * Persists a block relation from blocker to blocked.
   * Throws if the relation already exists or if blockerId === blockedId.
   */
  block(blockerId: string, blockedId: string): Promise<void>;

  /**
   * Removes an existing block relation from blocker to blocked.
   * Throws if the relation does not exist.
   */
  unblock(blockerId: string, blockedId: string): Promise<void>;

  /**
   * Returns true when blockerId has an active block against blockedId.
   */
  isBlocking(blockerId: string, blockedId: string): Promise<boolean>;

  /**
   * Returns the paginated list of users blocked by blockerId.
   * Applies optional fullName / userName filters from the DTO.
   * The result does NOT use PageDTO to keep the Flutter client contract flat:
   * the response body is consumed as response.data ?? [].
   */
  paginateBlocked(
    blockerId: string,
    userBlockedPaginationOptionsDto: UserBlockedPaginationOptionsDTO,
  ): Promise<{ items: User[]; total: number }>;
}
