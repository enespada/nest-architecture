import { User } from '@controller/users/entities/user.entity';
import { UserToken, Token } from '@core/decorators/decorators';
import { ExceptionFilter } from '@core/exceptions/global.exception';
import { JwtRefreshGuard } from '@core/middlewares/jwt/refresh/jwt-refresh.guard';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from '@application/auth/auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@UseFilters(ExceptionFilter)
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Log a user' })
  @ApiBody({ type: LoginDTO })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  login(@Body() body: LoginDTO) {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The request sent to the server is invalid or corrupted',
  })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Get('refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh JWT token',
    description: 'Returns a brand new Access Token',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
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
  refresh(@UserToken() user: User, @Token() token: string) {
    return this.authService.refresh(user, token);
  }
}
