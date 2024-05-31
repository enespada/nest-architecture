import { UserService } from '@application/users/user.service';
import { ExceptionFilter } from '@core/exceptions/global.exception';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseFilters,
  // UseGuards,
} from '@nestjs/common';
// import { JwtUserGuard } from '@core/middlewares/jwt/user/jwt-user.guard';
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
import { UpdateUserDTO } from './dto/update-user.dto';
import { User } from '../../domain/user/entities/user.entity';
import { UserToken } from '@core/decorators/decorators';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserPageOptionsDTO } from './dto/user-pagination-options.dto';

@Controller('users')
@ApiTags(`Users`)
@UseFilters(ExceptionFilter)
// @UseGuards(JwtUserGuard)
// @UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Bearer token must be a valid Token',
})
export class UsersController {
  constructor(private readonly userService: UserService) {}

  //-----------------------------------------------POST-----------------------------------------------------------
  @Post()
  @ApiOperation({ summary: 'Creates a user' })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  register(@Body() body: CreateUserDTO) {
    return this.userService.create(body);
  }

  //-----------------------------------------------GET me-----------------------------------------------------------
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
    return this.userService.findOne({
      where: { id: user.id },
    });
  }

  //-----------------------------------------------GET-----------------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'Gets all users' })
  @ApiOkResponse({
    type: Array<User>,
    isArray: true,
    description: 'Retrieves an array of users',
  })
  getAll() {
    return this.userService.find();
  }

  //-----------------------------------------------GET paginate-----------------------------------------------------------
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
  paginate(@Query() pageOptionsDto: UserPageOptionsDTO) {
    return this.userService.paginate(pageOptionsDto);
  }

  //-----------------------------------------------GET :id-----------------------------------------------------------
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
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne({ where: { id } });
  }

  //-------------------------------------------------PUT-------------------------------------------------------------
  @Put()
  @ApiOperation({ summary: 'Updates an user' })
  @ApiBody({ type: UpdateUserDTO })
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
    updateUserDTO: UpdateUserDTO,
  ) {
    return this.userService.update(updateUserDTO);
  }

  //-----------------------------------------------DELETE :id-----------------------------------------------------------
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
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}
