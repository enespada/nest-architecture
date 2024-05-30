import { UsersService } from '@application/users/users.service';
import { ExceptionFilter } from '@core/exceptions/global.exception';
import { TransformInterceptor } from '@core/response/success.response';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtUserGuard } from '@core/middlewares/jwt/user/jwt-user.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserToken } from '@core/decorators/decorators';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPageOptionsDto } from './dto/user-pagination-options.dto';

@Controller('users')
@ApiTags(`Users`)
@UseFilters(ExceptionFilter)
@UseGuards(JwtUserGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Bearer token must be a valid Token',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Creates a user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  @UseInterceptors(TransformInterceptor)
  register(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get('me')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the user',
  })
  @ApiOperation({ summary: 'Gets an user by given token' })
  @ApiOkResponse({
    type: User,
    description: 'Retrieves user data',
  })
  @ApiResponse({
    description: 'There is no user with the given id',
    status: HttpStatus.NOT_FOUND,
  })
  me(@UserToken() user: User) {
    return this.usersService.findOne({
      where: { id: user.id },
    });
  }

  @Get('paginate')
  @ApiOperation({ summary: 'Paginate users' })
  @ApiExtraModels(User)
  @ApiQuery({
    required: false,
    name: 'where',
    style: 'deepObject',
    explode: true,
    type: 'object',
    schema: {
      $ref: getSchemaPath(User),
    },
  })
  @ApiOkResponse({
    type: User,
    isArray: true,
    description: 'Retrieves an array of users',
  })
  paginate(@Query() pageOptionsDto: UserPageOptionsDto) {
    return this.usersService.paginate(pageOptionsDto);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the user',
  })
  @ApiOperation({ summary: 'Gets an user by given id' })
  @ApiOkResponse({
    type: User,
    description: 'Retrieves user data',
  })
  @ApiResponse({
    description: 'There is no user with the given id',
    status: HttpStatus.NOT_FOUND,
  })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne({ where: { id } });
  }

  @Get()
  @ApiOperation({ summary: 'Gets all users' })
  @ApiOkResponse({
    type: Array<User>,
    isArray: true,
    description: 'Retrieves an array of users',
  })
  getAll() {
    return this.usersService.find();
  }

  @Put()
  @ApiOperation({ summary: 'Updates an user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    type: User,
    description: 'Retrieves an updated user',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  updateUser(
    @Body()
    userDto: UpdateUserDto,
  ) {
    return this.usersService.update(userDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes an user' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the user',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully deleted',
  })
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
