import { CreateUserDTO } from '@controller/user/dto/create-user.dto';
import { UpdateUserDTO } from '@controller/user/dto/update-user.dto';
import { UserPageOptionsDTO } from '@controller/user/dto/user-pagination-options.dto';
import {
  changeToLike,
  combineObjectsArray,
  nestDottedObject,
} from '@core/utils/utils';
import { User, UserWhere } from '@domain/user/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class UserDomainService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDTO) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.insert(user);
  }

  async paginate(userPageOptionsDto: UserPageOptionsDTO) {
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

  async find(options: FindManyOptions<User>) {
    return await this.userRepository.find(options);
  }

  async findOne(options: FindOneOptions<User>) {
    return await this.userRepository.findOne(options);
  }

  async findById(id: string) {
    const user: User = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async update(userId: string, updateUserDTO: UpdateUserDTO) {
    return await this.userRepository.update(userId, updateUserDTO);
  }

  async remove(id: string) {
    return await this.userRepository.delete({ id });
  }
}
