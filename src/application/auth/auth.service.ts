import { MailService } from '@core/services/mail/mail.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { LoginDTO as LoginDto } from '@controller/auth/dto/login.dto';
import { User } from '@domain/user/entities/user.entity';
import { UserToken } from '@controller/auth/dto/token.dto';
import { SessionService } from '@core/services/session/session.service';
import { RegisterDTO } from '@controller/auth/dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly mailService: MailService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user: User = await this.usersService.findOne({
      where: {
        email: loginDto.email,
      },
    });

    if (!user)
      throw new HttpException(
        'User or password incorrect',
        HttpStatus.FORBIDDEN,
      );

    const decriptedBodyPassword = this.sessionService.decrypt(
      loginDto.password,
    );
    const decriptedUserPassword = this.sessionService.decrypt(user.password);

    if (decriptedBodyPassword !== decriptedUserPassword)
      throw new HttpException(
        'User or password incorrect',
        HttpStatus.FORBIDDEN,
      );

    return this.refresh(user);
  }

  refresh(user: User, token?: string) {
    const accessToken = this.sessionService.createToken(user);
    const refreshToken = token ?? this.sessionService.createToken(user, true);
    return { accessToken, refreshToken } as UserToken;
  }

  register(registerDto: RegisterDTO) {
    return this.usersService.create(registerDto);
  }
}
