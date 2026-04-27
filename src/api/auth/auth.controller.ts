import { UserToken, Token } from '@core/decorators/decorators';
import { ExceptionFilter } from '@core/exceptions/global.exception';
import { JwtRefreshGuard } from '@core/middlewares/jwt/refresh/jwt-refresh.guard';
import { JwtUserGuard } from '@core/middlewares/jwt/user/jwt-user.guard';
import { LoginResponseDto } from '@application/auth/dto/login-response.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '@application/auth/auth.service';
import { LoginRequestDTO } from '@application/auth/dto/login-request.dto';
import { RegisterRequestDTO } from '@application/auth/dto/register-request.dto';
import { SignOutRequestDTO } from '@application/auth/dto/sign-out-request.dto';
import { User } from '@domain/user/models/user.model';

@Controller('auth')
@UseFilters(ExceptionFilter)
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //-----------------------------------------------POST login-----------------------------------------------------------
  @Post('login')
  @ApiOperation({ summary: 'Log a user' })
  @ApiBody({ type: LoginRequestDTO })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  login(@Body() loginRequestDto: LoginRequestDTO): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto);
  }

  //-----------------------------------------------POST register-----------------------------------------------------------
  @Post('register')
  @ApiOperation({ summary: 'Register a user' })
  @ApiBody({ type: RegisterRequestDTO })
  @ApiOkResponse({ type: User })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  register(@Body() registerRequestDto: RegisterRequestDTO): Promise<User> {
    return this.authService.register(registerRequestDto);
  }

  //-----------------------------------------------GET refresh-----------------------------------------------------------
  @Get('refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh JWT token',
    description: 'Returns a brand new Access Token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access Token successfully refreshed',
  })
  @ApiResponse({
    description:
      'User needs to be active <br/> Bearer Token must be a refresh token',
    status: HttpStatus.FORBIDDEN,
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer token must be a valid user refresh JWT',
  })
  @UseGuards(JwtRefreshGuard)
  refresh(
    @UserToken() user: User,
    @Token() token: string,
  ): Promise<LoginResponseDto> {
    return this.authService.refresh(user, token);
  }

  //-----------------------------------------------POST sign-out-----------------------------------------------------------
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Signs out the authenticated user from the current device',
  })
  @ApiBody({ type: SignOutRequestDTO })
  @ApiNoContentResponse({ description: 'Session signed out successfully' })
  @ApiUnauthorizedResponse({
    description: 'Bearer token must be a valid user access JWT',
  })
  signOut(
    @UserToken() user: User,
    @Token() accessToken: string,
    @Body() signOutRequestDto: SignOutRequestDTO,
  ): Promise<void> {
    return this.authService.signOut(signOutRequestDto, user.id, accessToken);
  }
}
