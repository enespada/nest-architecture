import { CreateUserPayloadDTO } from '@controller/user/dto/create-user-payload.dto';
import { UpdateUserDTO as UpdateUserPayloadDTO } from '@controller/user/dto/update-user.dto';
import { UserPageOptionsDTO } from '@controller/user/dto/user-pagination-options.dto';
import { User } from './models/user.model';
import { FindManyOptions } from './interfaces/find-many-options.interface';
import { FindOneOptions } from './interfaces/find-one-options.interface';

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
