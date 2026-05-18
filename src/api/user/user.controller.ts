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
import { UpdateUserDTO } from '@application/user/dto/update-user.dto';
import { CreateUserDTO } from '@application/user/dto/create-user.dto';
import { EmailAvailabilityQueryDTO } from '@application/user/dto/email-availability-query.dto';
import { EmailAvailabilityResponseDTO } from '@application/user/dto/email-availability-response.dto';
import { PhoneAvailabilityQueryDTO } from '@application/user/dto/phone-availability-query.dto';
import { PhoneAvailabilityResponseDTO } from '@application/user/dto/phone-availability-response.dto';
import { UserPageOptionsDTO } from '@application/user/dto/user-pagination-options.dto';
import { UsernameAvailabilityQueryDTO } from '@application/user/dto/username-availability-query.dto';
import { UsernameAvailabilityResponseDTO } from '@application/user/dto/username-availability-response.dto';
import { User } from '@domain/user/models/user.model';
import { UserToken } from '@core/decorators/decorators';

@Controller('users')
@ApiTags(`Users`)
@UseFilters(ExceptionFilter)
// @UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  //-----------------------------------------------POST-----------------------------------------------------------
  @Post()
  @ApiOperation({ summary: 'Creates a user' })
  @ApiBody({ type: CreateUserDTO })
  @ApiOkResponse({
    type: User,
    description: 'Retrieves the created user',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  register(@Body() createUserDto: CreateUserDTO): Promise<User> {
    return this.userService.create(createUserDto);
  }

  //-----------------------------------------------GET username-available-----------------------------------------------------------
  @Get('username-available')
  @ApiOperation({ summary: 'Checks if a username is available' })
  @ApiQuery({
    name: 'username',
    type: String,
    description: 'Username to check availability for',
  })
  @ApiOkResponse({
    type: UsernameAvailabilityResponseDTO,
    description: 'Availability status of the username',
  })
  checkUsernameAvailable(
    @Query() usernameAvailabilityQueryDto: UsernameAvailabilityQueryDTO,
  ): Promise<UsernameAvailabilityResponseDTO> {
    return this.userService.isUsernameAvailable(usernameAvailabilityQueryDto);
  }

  //-----------------------------------------------GET email-available-----------------------------------------------------------
  @Get('email-available')
  @ApiOperation({ summary: 'Checks if an email is available' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: 'Email to check availability for',
  })
  @ApiOkResponse({
    type: EmailAvailabilityResponseDTO,
    description: 'Availability status of the email',
  })
  checkEmailAvailable(
    @Query() emailAvailabilityQueryDto: EmailAvailabilityQueryDTO,
  ): Promise<EmailAvailabilityResponseDTO> {
    return this.userService.isEmailAvailable(emailAvailabilityQueryDto);
  }

  //-----------------------------------------------GET phone-available-----------------------------------------------------------
  @Get('phone-available')
  @ApiOperation({ summary: 'Checks if a phone is available' })
  @ApiQuery({
    name: 'phonePreffix',
    type: String,
    description: 'Phone preffix to check availability for',
  })
  @ApiQuery({
    name: 'phone',
    type: String,
    description: 'Phone to check availability for',
  })
  @ApiOkResponse({
    type: PhoneAvailabilityResponseDTO,
    description: 'Availability status of the phone',
  })
  checkPhoneAvailable(
    @Query() phoneAvailabilityQueryDto: PhoneAvailabilityQueryDTO,
  ): Promise<PhoneAvailabilityResponseDTO> {
    return this.userService.isPhoneAvailable(phoneAvailabilityQueryDto);
  }

  //-----------------------------------------------GET-----------------------------------------------------------
  @Get()
  // @UseGuards(JwtUserGuard)
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
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Bearer token must be a valid Token',
  })
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
    return this.userService.findOne({ where: { id: user.id } }, user.id);
  }

  //-----------------------------------------------GET paginate-----------------------------------------------------------
  @Get('paginate')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Bearer token must be a valid Token',
  })
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
    description:
      'Retrieves a paginated list of users. Each user may include isBlockedByLogged and blockedLogged flags computed against the authenticated user.',
  })
  paginate(
    @UserToken() user: User,
    @Query() userPageOptionsDto: UserPageOptionsDTO,
  ) {
    return this.userService.paginate(userPageOptionsDto, user.id);
  }

  //-----------------------------------------------GET :id-----------------------------------------------------------
  @Get(':id')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Bearer token must be a valid Token',
  })
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
  get(@UserToken() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findById(id, user.id);
  }

  //-------------------------------------------------PUT-------------------------------------------------------------
  @Put()
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Bearer token must be a valid Token',
  })
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
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Bearer token must be a valid Token',
  })
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
