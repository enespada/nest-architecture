import { CreateUserDto } from '@controller/users/dto/create-user.dto';
import { UpdateUserDto } from '@controller/users/dto/update-user.dto';
import { UserPageOptionsDto } from '@controller/users/dto/user-pagination-options.dto';
import { User } from '@controller/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { forkJoin, from, map } from 'rxjs';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class UsersDomainService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return from(this.userRepository.insert(user));
  }

  update(updateUserDto: UpdateUserDto) {
    const user = this.userRepository.create(updateUserDto);
    return from(this.userRepository.update(user.id, user));
  }

  remove(id: number) {
    return from(this.userRepository.delete({ id }));
  }

  paginate(pageOptionsDto: UserPageOptionsDto) {
    return forkJoin([
      this.userRepository.count(),
      this.userRepository.find({
        order: {
          [pageOptionsDto.orderBy]: pageOptionsDto.order,
        },
        where: pageOptionsDto.where,
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take,
        relations: pageOptionsDto.relations as unknown as Array<string>,
      }),
    ]).pipe(
      map(([totalItems, entities]) => {
        return { totalItems, entities };
      }),
    );
  }

  find(options: FindManyOptions<User>) {
    return from(this.userRepository.find(options));
  }

  findOne(options: FindOneOptions<User>) {
    return from(this.userRepository.findOne(options));
  }
}
