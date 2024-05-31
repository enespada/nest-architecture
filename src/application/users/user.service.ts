import { CreateUserDTO } from '@controller/user/dto/create-user.dto';
import { UpdateUserDTO } from '@controller/user/dto/update-user.dto';
import { UserPageOptionsDTO } from '@controller/user/dto/user-pagination-options.dto';
import { User } from '@domain/user/entities/user.entity';
import { PageDto } from '@core/database/dto/page.dto';
import { PageMetaDto } from '@core/database/dto/pagination-meta.dto';
import { UserDomainService } from '@domain/user/user.domain';
import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private userDomainService: UserDomainService) {}

  async create(createUserDto: CreateUserDTO) {
    return await this.userDomainService.create(createUserDto);
  }

  async update(updateUserDto: UpdateUserDTO) {
    return await this.userDomainService.update(updateUserDto);
  }

  async remove(id: string) {
    return await this.userDomainService.remove(id);
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
    const pageMetaDto = new PageMetaDto({
      totalItems,
      pageOptionsDto: userPageOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }
}
