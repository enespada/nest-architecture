import { UserBlocked } from '@domain/user-blocked/models/user-blocked.model';
import { UserBlockedEntity } from '../entities/user-blocked.entity';

export class UserBlockedMapper {
  // AbstractEntity stores createdAt as Unix epoch seconds (bigint → number).
  // The domain model expects a JavaScript Date, so multiply by 1000.
  static entityToModel(entity: UserBlockedEntity): UserBlocked {
    return new UserBlocked(
      entity.id,
      entity.blockerId,
      entity.blockedId,
      new Date(Number(entity.createdAt) * 1000),
    );
  }

  static modelToEntity(model: UserBlocked): UserBlockedEntity {
    return {
      id: model.id,
      blockerId: model.blockerId,
      blockedId: model.blockedId,
    } as UserBlockedEntity;
  }
}
