import { CreateUserDto } from '@controller/users/dto/create-user.dto';
import { UpdateUserDto } from '@controller/users/dto/update-user.dto';
import { UserPageOptionsDto } from '@controller/users/dto/user-pagination-options.dto';
import { User } from '@domain/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class UsersDomainService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.insert(user);
  }

  async update(updateUserDto: UpdateUserDto) {
    const user = this.userRepository.create(updateUserDto);
    return await this.userRepository.update(user.id, user);
  }

  async remove(id: number) {
    return await this.userRepository.delete({ id });
  }

  async paginate(userPageOptionsDto: UserPageOptionsDto) {
    const [totalItems, entities] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.find({
        order: {
          [userPageOptionsDto.orderBy]: userPageOptionsDto.order,
        },
        where: userPageOptionsDto.where,
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
}
