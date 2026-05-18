import { User } from '@domain/user/models/user.model';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static entityToModel(
    userEntity: UserEntity,
    flags?: { isBlockedByLogged?: boolean; blockedLogged?: boolean },
  ): User {
    return {
      id: userEntity.id,
      email: userEntity.email,
      username: userEntity.username,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      phonePreffix: userEntity.phonePreffix,
      phone: userEntity.phone,
      language: userEntity.language,
      birthDate: userEntity.birthDate,
      password: userEntity.password,
      isBlockedByLogged: flags?.isBlockedByLogged,
      blockedLogged: flags?.blockedLogged,
    } as User;
  }

  static modelToEntity(user: User): UserEntity {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phonePreffix: user.phonePreffix,
      phone: user.phone,
      language: user.language,
      birthDate: user.birthDate,
      password: user.password,
    } as UserEntity;
  }
}
