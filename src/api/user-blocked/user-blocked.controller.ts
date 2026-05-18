import { UserBlockedPaginationOptionsDTO } from '@application/user-blocked/dto/user-blocked-pagination-options.dto';
import { UserBlockedService } from '@application/user-blocked/user-blocked.service';
import { UserToken } from '@core/decorators/decorators';
import { ExceptionFilter } from '@core/exceptions/global.exception';
import { JwtUserGuard } from '@core/middlewares/jwt/user/jwt-user.guard';
import { User } from '@domain/user/models/user.model';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('users/blocked')
@ApiTags('Users Blocked')
@UseFilters(ExceptionFilter)
@UseGuards(JwtUserGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Bearer token must be a valid Token' })
export class UserBlockedController {
  constructor(private readonly userBlockedService: UserBlockedService) {}

  //-----------------------------------------------GET paginate-----------------------------------------------------------
  @Get('paginate')
  @ApiOperation({
    summary:
      'Returns blocked users for the authenticated user as a plain array',
  })
  @ApiOkResponse({
    description:
      'Plain User array. Flutter client iterates response.data directly.',
    type: User,
    isArray: true,
  })
  async paginateBlocked(
    @UserToken() user: User,
    @Query() userBlockedPaginationOptionsDto: UserBlockedPaginationOptionsDTO,
  ): Promise<User[]> {
    const { items } = await this.userBlockedService.paginateBlocked(
      user.id,
      userBlockedPaginationOptionsDto,
    );
    return items;
  }

  //-----------------------------------------------POST :id-----------------------------------------------------------
  @Post(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Blocks a user by id on behalf of the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user to block',
    type: String,
  })
  @ApiNoContentResponse({ description: 'User blocked successfully' })
  block(
    @UserToken() user: User,
    @Param('id', ParseUUIDPipe) blockedId: string,
  ) {
    return this.userBlockedService.block(user.id, blockedId);
  }

  //-----------------------------------------------DELETE :id-----------------------------------------------------------
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Unblocks a user by id on behalf of the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user to unblock',
    type: String,
  })
  @ApiNoContentResponse({ description: 'User unblocked successfully' })
  unblock(
    @UserToken() user: User,
    @Param('id', ParseUUIDPipe) blockedId: string,
  ) {
    return this.userBlockedService.unblock(user.id, blockedId);
  }
}
