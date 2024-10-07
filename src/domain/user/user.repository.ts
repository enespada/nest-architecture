import { CreateUserPayloadDTO } from '@application/user/dto/create-user-payload.dto';
import { UserPageOptionsDTO } from '@application/user/dto/user-pagination-options.dto';
import { User } from './models/user.model';
import {
  FindManyOptions,
  FindOneOptions,
} from '../shared/interfaces/find-options.interface';
import { UpdateUserPayloadDTO } from '@application/user/dto/update-user-payload.dto';

export interface UserRepository {
  create(createUserPayloadDto: CreateUserPayloadDTO): Promise<User>;
  paginate(userPageOptionsDto: UserPageOptionsDTO): Promise<any>;
  find(options: FindManyOptions<User>): Promise<User[]>;
  findOne(options: FindOneOptions<User>): Promise<User>;
  findById(id: string): Promise<User>;
  update(
    userId: string,
    updateUserPayloadDto: UpdateUserPayloadDTO,
  ): Promise<User>;
  remove(id: string): Promise<void>;
}
