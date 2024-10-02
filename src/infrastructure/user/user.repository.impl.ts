import { CreateUserPayloadDTO } from '@controller/user/dto/create-user-payload.dto';
import { UpdateUserPayloadDTO } from '@controller/user/dto/update-user-payload.dto';
import { UserPageOptionsDTO } from '@controller/user/dto/user-pagination-options.dto';
import {
  changeToLike,
  combineObjectsArray,
  nestDottedObject,
} from '@core/utils/utils';
import { User } from '@domain/user/models/user.model';
import { UserRepository } from '@domain/user/user.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWhere } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FindManyOptions } from '@domain/user/interfaces/find-many-options.interface';
import { FindOneOptions } from '@domain/user/interfaces/find-one-options.interface';
import { FindOptionsMapper } from '@infrastructure/utils/find-options-mapper.util';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserPayloadDto: CreateUserPayloadDTO): Promise<User> {
    const user = this.userRepository.create(createUserPayloadDto);
    await this.userRepository.insert(user);
    return await this.findById(user.id);
  }

  async paginate(userPageOptionsDto: UserPageOptionsDTO): Promise<any> {
    const where = userPageOptionsDto.where
      ? combineObjectsArray(
          Object.entries(userPageOptionsDto.where).map(([k, v]) => {
            const relationTrace: string = UserWhere[k];
            const obj = { [relationTrace]: changeToLike(v) };
            return nestDottedObject(obj);
          }),
        )
      : {};

    const [totalItems, entities] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.find({
        order: {
          [userPageOptionsDto.orderBy]: userPageOptionsDto.order,
        },
        where: where,
        skip: userPageOptionsDto.skip,
        take: userPageOptionsDto.take,
        relations: userPageOptionsDto.relations as unknown as Array<string>,
      }),
    ]);

    return { totalItems, entities };
  }

  async find(options: FindManyOptions<User>): Promise<User[]> {
    const typeOrmOptions =
      FindOptionsMapper.mapFindManyOptionsToTypeOrmOptions(options);
    return await this.userRepository.find(typeOrmOptions);
  }

  async findOne(options: FindOneOptions<User>): Promise<User> {
    const typeOrmOptions =
      FindOptionsMapper.mapFindOneOptionsToTypeOrmOptions(options);
    return await this.userRepository.findOne(typeOrmOptions);
  }

  async findById(id: string): Promise<User> {
    const user: User = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async update(
    userId: string,
    updateUserPayloadDTO: UpdateUserPayloadDTO,
  ): Promise<User> {
    await this.userRepository.update(userId, updateUserPayloadDTO);
    return await this.findById(userId);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete({ id });
  }
}
