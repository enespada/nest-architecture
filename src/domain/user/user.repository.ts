import { CreateUserPayloadDTO } from '@application/user/dto/create-user-payload.dto';
import { UpdateUserPayloadDTO } from '@application/user/dto/update-user-payload.dto';
import { UserPageOptionsDTO } from '@application/user/dto/user-pagination-options.dto';
import { User } from './models/user.model';
import {
  FindManyOptions,
  FindOneOptions,
} from '@domain/shared/interfaces/find-options.interface';

export interface UserRepository {
  create(createUserPayloadDto: CreateUserPayloadDTO): Promise<User>;
  /**
   * Returns a paginated result. When loggedUserId is provided the repository
   * must populate isBlockedByLogged and blockedLogged on each returned User.
   */
  paginate(
    userPageOptionsDto: UserPageOptionsDTO,
    loggedUserId?: string,
  ): Promise<any>;
  find(options: FindManyOptions<User>): Promise<User[]>;
  /**
   * Finds a single user. When loggedUserId is provided the repository
   * must populate isBlockedByLogged and blockedLogged on the returned User.
   */
  findOne(options: FindOneOptions<User>, loggedUserId?: string): Promise<User>;
  /**
   * Finds a user by primary key. When loggedUserId is provided the repository
   * must populate isBlockedByLogged and blockedLogged on the returned User.
   */
  findById(id: string, loggedUserId?: string): Promise<User>;
  update(
    userId: string,
    updateUserPayloadDto: UpdateUserPayloadDTO,
  ): Promise<User>;
  remove(id: string): Promise<void>;
}
