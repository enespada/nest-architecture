import { CreateUserDTO } from '@controller/user/dto/create-user.dto';
import { UpdateUserDTO } from '@controller/user/dto/update-user.dto';
import { UserPageOptionsDTO } from '@controller/user/dto/user-pagination-options.dto';
import { User } from '@domain/user/entities/user.entity';
import { PageDTO } from '@core/database/dto/page.dto';
import { PageMetaDTO } from '@core/database/dto/pagination-meta.dto';
import { UserDomainService } from '@domain/user/user.domain';
import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { SessionService } from '@core/services/session/session.service';

@Injectable()
export class UserService {
  constructor(
    private userDomainService: UserDomainService,
    private readonly sessionService: SessionService,
  ) {}

  async create(createUserDto: CreateUserDTO) {
    createUserDto.password = this.sessionService.encrypt(
      createUserDto.password,
    );
    return await this.userDomainService.create(createUserDto);
  }

  async find(options?: FindManyOptions<User>) {
    return await this.userDomainService.find(options ?? {});
  }

  async findOne(options?: FindManyOptions<User>) {
    return await this.userDomainService.findOne(options ?? {});
  }

  async paginate(userPageOptionsDto: UserPageOptionsDTO) {
    const { totalItems, entities } =
      await this.userDomainService.paginate(userPageOptionsDto);
    const pageMetaDto = new PageMetaDTO({
      totalItems,
      pageOptionsDto: userPageOptionsDto,
    });
    return new PageDTO(entities, pageMetaDto);
  }

  async update(userId: string, updateUserDto: UpdateUserDTO) {
    //We search the user to check if it exists
    const user: User = await this.userDomainService.findById(userId);
    updateUserDto.password = this.sessionService.encrypt(
      updateUserDto.password,
    );
    return await this.userDomainService.update(user.id, updateUserDto);
  }

  async remove(id: string) {
    return await this.userDomainService.remove(id);
  }
}
