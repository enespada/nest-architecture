import { CreateUserDTO } from '@controller/user/dto/create-user.dto';
import { UpdateUserDTO } from '@controller/user/dto/update-user.dto';
import { UserPageOptionsDTO } from '@controller/user/dto/user-pagination-options.dto';
import { PageDTO } from '@core/database/dto/page.dto';
import { PageMetaDTO } from '@core/database/dto/pagination-meta.dto';
import { Inject, Injectable } from '@nestjs/common';
import { SessionService } from '@core/services/session/session.service';
import { UserRepository } from '@domain/user/user.repository';
import { User } from '@domain/user/models/user.model';
import { FindOneOptions } from '@domain/user/interfaces/find-one-options.interface';
import { FindManyOptions } from '@domain/user/interfaces/find-many-options.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
  ) {}

  async create(createUserDto: CreateUserDTO) {
    createUserDto.password = this.sessionService.encrypt(
      createUserDto.password,
    );
    return await this.userRepository.create(createUserDto);
  }

  async find(options?: FindManyOptions<User>) {
    return await this.userRepository.find(options ?? {});
  }

  async findOne(options?: FindOneOptions<User>) {
    return await this.userRepository.findOne(options ?? {});
  }

  async paginate(userPageOptionsDto: UserPageOptionsDTO) {
    const { totalItems, entities } =
      await this.userRepository.paginate(userPageOptionsDto);
    const pageMetaDto = new PageMetaDTO({
      totalItems,
      pageOptionsDto: userPageOptionsDto,
    });
    return new PageDTO(entities, pageMetaDto);
  }

  async update(userId: string, updateUserDto: UpdateUserDTO) {
    //We search the user to check if it exists
    const user: User = await this.userRepository.findById(userId);
    updateUserDto.password = this.sessionService.encrypt(
      updateUserDto.password,
    );
    return await this.userRepository.update(user.id, updateUserDto);
  }

  async remove(id: string) {
    return await this.userRepository.remove(id);
  }
}
