import { UserService } from '@application/user/user.service';
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
  UseGuards,
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
import { UpdateUserDTO } from './dto/update-user.dto';
import { User } from '../../domain/user/models/user.model';
import { UserToken } from '@core/decorators/decorators';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserPageOptionsDTO } from './dto/user-pagination-options.dto';

@Controller('users')
@ApiTags(`Users`)
@UseFilters(ExceptionFilter)
// @UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Bearer token must be a valid Token',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  //-----------------------------------------------POST-----------------------------------------------------------
  @Post()
  @ApiOperation({ summary: 'Creates a user' })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  register(@Body() createUserDto: CreateUserDTO) {
    return this.userService.create(createUserDto);
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

  //-----------------------------------------------GET me-----------------------------------------------------------
  @Get('me')
  @UseGuards(JwtUserGuard)
  @ApiOperation({ summary: 'Gets a user by given token' })
  @ApiExtraModels(User)
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

  //-----------------------------------------------GET paginate-----------------------------------------------------------
  @Get('paginate')
  @UseGuards(JwtUserGuard)
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
  paginate(@Query() userPageOptionsDto: UserPageOptionsDTO) {
    return this.userService.paginate(userPageOptionsDto);
  }

  //-----------------------------------------------GET :id-----------------------------------------------------------
  @Get(':id')
  @UseGuards(JwtUserGuard)
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the user',
  })
  @ApiOperation({ summary: 'Gets a user by given id' })
  @ApiOkResponse({
    type: User,
    description: 'Retrieves user data',
  })
  @ApiResponse({
    description: 'There is no user with the given id',
    status: HttpStatus.NOT_FOUND,
  })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  //-------------------------------------------------PUT-------------------------------------------------------------
  @Put()
  @UseGuards(JwtUserGuard)
  @ApiOperation({ summary: 'Updates a user' })
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
    @UserToken() user: User,
    @Body()
    updateUserDto: UpdateUserDTO,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  //-----------------------------------------------DELETE :id-----------------------------------------------------------
  @Delete(':id')
  @UseGuards(JwtUserGuard)
  @ApiOperation({ summary: 'Deletes a user' })
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
