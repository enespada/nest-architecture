import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '@domain/user/models/user.model';
import { UserBlockedRepository } from '@domain/user-blocked/user-blocked.repository';
import { UserBlockedPaginationOptionsDTO } from '@application/user-blocked/dto/user-blocked-pagination-options.dto';
import { UserBlockedEntity } from './entities/user-blocked.entity';
import { UserEntity } from '@infrastructure/user/entities/user.entity';
import { UserMapper } from '@infrastructure/user/mappers/user.mapper';

@Injectable()
export class UserBlockedRepositoryImpl implements UserBlockedRepository {
  constructor(
    @InjectRepository(UserBlockedEntity)
    private readonly userBlockedRepository: Repository<UserBlockedEntity>,
  ) {}

  async block(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new BadRequestException('A user cannot block themselves');
    }

    const existing = await this.userBlockedRepository.findOne({
      where: { blockerId, blockedId },
    });
    if (existing) {
      // Relation already exists — treat as idempotent success
      return;
    }

    const entity = this.userBlockedRepository.create({ blockerId, blockedId });
    await this.userBlockedRepository.insert(entity);
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    const existing = await this.userBlockedRepository.findOne({
      where: { blockerId, blockedId },
    });
    if (!existing) {
      // Relation does not exist — treat as idempotent success
      return;
    }

    await this.userBlockedRepository.delete({ blockerId, blockedId });
  }

  async isBlocking(blockerId: string, blockedId: string): Promise<boolean> {
    const count = await this.userBlockedRepository.count({
      where: { blockerId, blockedId },
    });
    return count > 0;
  }

  async paginateBlocked(
    blockerId: string,
    userBlockedPaginationOptionsDto: UserBlockedPaginationOptionsDTO,
  ): Promise<{ items: User[]; total: number }> {
    const limit = userBlockedPaginationOptionsDto.limit ?? 10;
    const offset = userBlockedPaginationOptionsDto.offset ?? 0;
    const nameFilter =
      userBlockedPaginationOptionsDto.where?.fullName ??
      userBlockedPaginationOptionsDto.where?.userName;

    // Resolve blocked user IDs for this blocker via a single subquery-style join.
    // We join UserBlockedEntity → UserEntity on blockedId to filter and paginate
    // in one pass, then batch-fetch reverse-block flags.
    const qb = this.userBlockedRepository.manager
      .createQueryBuilder(UserEntity, 'u')
      .innerJoin(
        UserBlockedEntity,
        'ub',
        'ub.blockedId = u.id AND ub.blockerId = :blockerId',
        { blockerId },
      );

    if (nameFilter) {
      qb.andWhere(
        '(LOWER(u.firstName) LIKE LOWER(:name) OR LOWER(u.lastName) LIKE LOWER(:name))',
        { name: `%${nameFilter}%` },
      );
    }

    const [total, blockedEntities] = await Promise.all([
      qb.getCount(),
      qb.skip(offset).take(limit).getMany(),
    ]);

    if (blockedEntities.length === 0) {
      return { items: [], total };
    }

    // Batch-fetch the reverse direction: do any of the blocked users also block the blocker?
    const blockedUserIds = blockedEntities.map((u) => u.id);
    const reverseRows = await this.userBlockedRepository.find({
      where: { blockerId: In(blockedUserIds), blockedId: blockerId },
    });
    const reverseSet = new Set(reverseRows.map((r) => r.blockerId));

    const items = blockedEntities.map((u) =>
      UserMapper.entityToModel(u, {
        // The authenticated user (blockerId) has blocked each of these users
        isBlockedByLogged: true,
        // True when the blocked user has also blocked the authenticated user
        blockedLogged: reverseSet.has(u.id),
      }),
    );

    return { items, total };
  }
}
