import { User } from '@domain/user/models/user.model';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static entityToModel(userEntity: UserEntity): User {
    return {
      id: userEntity.id,
      email: userEntity.email,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      password: userEntity.password,
    } as User;
  }

  static modelToEntity(user: User): UserEntity {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
    } as UserEntity;
  }
}
