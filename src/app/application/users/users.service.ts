import { CreateUserDto } from '@controller/users/dto/create-user.dto';
import { UpdateUserDto } from '@controller/users/dto/update-user.dto';
import { UserPageOptionsDto } from '@controller/users/dto/user-pagination-options.dto';
import { User } from '@controller/users/entities/user.entity';
import { PageDto } from '@core/database/dto/page.dto';
import { PageMetaDto } from '@core/database/dto/pagination-meta.dto';
import { UsersDomainService } from '@domain/users/users.domain';
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private usersDomainService: UsersDomainService) {}

  create(createUserDto: CreateUserDto) {
    return this.usersDomainService.create(createUserDto);
  }

  update(updateUserDto: UpdateUserDto) {
    return this.usersDomainService.update(updateUserDto);
  }

  remove(id: number) {
    return this.usersDomainService.remove(id);
  }

  find(options?: FindManyOptions<User>) {
    return this.usersDomainService.find(options ?? {});
  }

  findOne(options?: FindManyOptions<User>) {
    return this.usersDomainService.findOne(options ?? {});
  }

  paginate(pageOptionsDto: UserPageOptionsDto) {
    return this.usersDomainService.paginate(pageOptionsDto).pipe(
      map(({ totalItems, entities }) => {
        const pageMetaDto = new PageMetaDto({ totalItems, pageOptionsDto });
        return new PageDto(entities, pageMetaDto);
      }),
    );
  }
}
