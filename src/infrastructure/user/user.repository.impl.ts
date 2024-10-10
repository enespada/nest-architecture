import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  changeToLike,
  combineObjectsArray,
  nestDottedObject,
} from '@core/utils/utils';
import { User } from '@domain/user/models/user.model';
import { UserRepository } from '@domain/user/user.repository';
import { CreateUserPayloadDTO } from '@application/user/dto/create-user-payload.dto';
import { UpdateUserPayloadDTO } from '@application/user/dto/update-user-payload.dto';
import { UserPageOptionsDTO } from '@application/user/dto/user-pagination-options.dto';
import { UserEntity, UserWhere } from './entities/user.entity';
import {
  FindManyOptions,
  FindOneOptions,
} from '@domain/shared/interfaces/find-options.interface';
import { FindOptionsMapper } from '@infrastructure/shared/mappers/find-options.mapper';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
      this.userRepository.count({
        order: {
          [userPageOptionsDto.orderBy]: userPageOptionsDto.order,
        },
        where: where,
        relations: userPageOptionsDto.relations as unknown as Array<string>,
      }),
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
    const userEntities: UserEntity[] =
      await this.userRepository.find(typeOrmOptions);
    return userEntities.map((ue: UserEntity) => UserMapper.entityToModel(ue));
  }

  async findOne(options: FindOneOptions<User>): Promise<User> {
    const typeOrmOptions =
      FindOptionsMapper.mapFindOneOptionsToTypeOrmOptions(options);
    const userEntity: UserEntity =
      await this.userRepository.findOne(typeOrmOptions);
    if (!userEntity) {
      throw new BadRequestException('User not found');
    }
    return UserMapper.entityToModel(userEntity);
  }

  async findById(id: string): Promise<User> {
    const userEntity: UserEntity = await this.userRepository.findOne({
      where: { id },
    });
    if (!userEntity) {
      throw new BadRequestException('User not found');
    }
    return UserMapper.entityToModel(userEntity);
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
