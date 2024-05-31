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

  async create(createUserDTO: CreateUserDTO) {
    createUserDTO.password = this.sessionService.encrypt(
      createUserDTO.password,
    );
    return await this.userDomainService.create(createUserDTO);
  }

  async update(updateUserDTO: UpdateUserDTO) {
    updateUserDTO.password = this.sessionService.encrypt(
      updateUserDTO.password,
    );
    return await this.userDomainService.update(updateUserDTO);
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
    const pageMetaDto = new PageMetaDTO({
      totalItems,
      pageOptionsDto: userPageOptionsDto,
    });
    return new PageDTO(entities, pageMetaDto);
  }
}
