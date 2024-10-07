import { CreateUserDTO } from '@application/user/dto/create-user.dto';
import { UpdateUserDTO } from '@application/user/dto/update-user.dto';
import { UserPageOptionsDTO } from '@application/user/dto/user-pagination-options.dto';
import { PageDTO } from '@core/database/dto/page.dto';
import { PageMetaDTO } from '@core/database/dto/pagination-meta.dto';
import { Inject, Injectable } from '@nestjs/common';
import { SessionService } from '@core/services/session/session.service';
import { UserRepository } from '@domain/user/user.repository';
import { User } from '@domain/user/models/user.model';
import { UpdateUserPayloadDTO } from '@application/user/dto/update-user-payload.dto';
import {
  FindManyOptions,
  FindOneOptions,
} from '@domain/shared/interfaces/find-options.interface';
import { CreateUserPayloadDTO } from './dto/create-user-payload.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
  ) {}

  async create(createUserDto: CreateUserDTO) {
    const createUserPayloadDto: CreateUserPayloadDTO = { ...createUserDto };
    createUserPayloadDto.password = this.sessionService.encrypt(
      createUserPayloadDto.password,
    );
    return await this.userRepository.create(createUserPayloadDto);
  }

  async find(options?: FindManyOptions<User>) {
    return await this.userRepository.find(options ?? {});
  }

  async findOne(options?: FindOneOptions<User>) {
    return await this.userRepository.findOne(options ?? {});
  }

  async findById(userId: string) {
    return await this.userRepository.findById(userId);
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
    // We search the user to check if it exists
    await this.userRepository.findById(userId);
    updateUserDto.password = this.sessionService.encrypt(
      updateUserDto.password,
    );
    const updateUserPayloadDto: Partial<UpdateUserPayloadDTO> = {
      ...updateUserDto,
    };
    return await this.userRepository.update(userId, updateUserPayloadDto);
  }

  async remove(id: string) {
    // We search the user to check if it exists
    await this.userRepository.findById(id);
    return await this.userRepository.remove(id);
  }
}
